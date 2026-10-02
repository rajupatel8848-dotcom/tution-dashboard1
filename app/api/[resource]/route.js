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

function serialize(record) {
  const { _id, ...fields } = record;
  return { ...fields, id: _id.toString() };
}

export async function GET(request, { params }) {
  const denied = authorize(request);
  if (denied) return denied;
  const { resource } = params;
  if (!API_RESOURCES[resource]) {
    return NextResponse.json({ error: "Unknown resource." }, { status: 404 });
  }

  try {
    const database = await getDatabase();
    const records = await database.collection(resource)
      .find({})
      .sort({ _id: -1 })
      .limit(500)
      .toArray();
    return NextResponse.json({ data: records.map(serialize) });
  } catch (error) {
    console.error(`Failed to read ${resource}:`, error);
    return NextResponse.json({ error: "Database request failed." }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const denied = authorize(request, true);
  if (denied) return denied;
  const { resource } = params;
  if (!API_RESOURCES[resource]) {
    return NextResponse.json({ error: "Unknown resource." }, { status: 404 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must contain valid JSON." }, { status: 400 });
  }
  const validation = validateDocument(resource, body);
  if (validation.error) return NextResponse.json({ error: validation.error }, { status: 400 });
  if (resource === "students" && !validation.document.createdAt) {
    validation.document.createdAt = new Date().toISOString();
  }
  if (resource === "activities" && !validation.document.createdAt) {
    validation.document.createdAt = new Date().toISOString();
  }

  try {
    const database = await getDatabase();
    const result = await database.collection(resource).insertOne(validation.document);
    return NextResponse.json(
      { data: serialize({ ...validation.document, _id: result.insertedId }) },
      { status: 201 },
    );
  } catch (error) {
    console.error(`Failed to create ${resource}:`, error);
    return NextResponse.json({ error: "Database request failed." }, { status: 500 });
  }
}
