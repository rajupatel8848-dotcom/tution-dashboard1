import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { hasValidSession, isSameOrigin } from "@/lib/auth";
import { API_RESOURCES, validateDocument } from "@/lib/api-resources";
import { getDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

function authorize(request, mutation = false) {
  if (!hasValidSession(request)) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (mutation && !isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  return null;
}

function parseId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function serialize(record) {
  const { _id, ...fields } = record;
  return { ...fields, id: _id.toString() };
}

export async function GET(request, { params }) {
  const denied = authorize(request);
  if (denied) return denied;
  const { resource, id } = params;
  const objectId = parseId(id);
  if (!API_RESOURCES[resource]) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });
  if (!objectId) return NextResponse.json({ error: "Invalid record ID." }, { status: 400 });

  try {
    const record = await (await getDatabase()).collection(resource).findOne({ _id: objectId });
    if (!record) return NextResponse.json({ error: "Record not found." }, { status: 404 });
    return NextResponse.json({ data: serialize(record) });
  } catch (error) {
    console.error(`Failed to read ${resource} record:`, error);
    return NextResponse.json({ error: "Database request failed." }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const denied = authorize(request, true);
  if (denied) return denied;
  const { resource, id } = params;
  const objectId = parseId(id);
  if (!API_RESOURCES[resource]) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });
  if (!objectId) return NextResponse.json({ error: "Invalid record ID." }, { status: 400 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must contain valid JSON." }, { status: 400 });
  }
  const validation = validateDocument(resource, body, { partial: true });
  if (validation.error) return NextResponse.json({ error: validation.error }, { status: 400 });

  try {
    const collection = (await getDatabase()).collection(resource);
    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: validation.document },
      { returnDocument: "after" },
    );
    if (!result) return NextResponse.json({ error: "Record not found." }, { status: 404 });
    return NextResponse.json({ data: serialize(result) });
  } catch (error) {
    console.error(`Failed to update ${resource} record:`, error);
    return NextResponse.json({ error: "Database request failed." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const denied = authorize(request, true);
  if (denied) return denied;
  const { resource, id } = params;
  const objectId = parseId(id);
  if (!API_RESOURCES[resource]) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });
  if (!objectId) return NextResponse.json({ error: "Invalid record ID." }, { status: 400 });

  try {
    const result = await (await getDatabase()).collection(resource).deleteOne({ _id: objectId });
    if (!result.deletedCount) return NextResponse.json({ error: "Record not found." }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to delete ${resource} record:`, error);
    return NextResponse.json({ error: "Database request failed." }, { status: 500 });
  }
}
