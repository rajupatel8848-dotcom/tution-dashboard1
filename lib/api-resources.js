export const API_RESOURCES = {
  students: {
    fields: ["name", "cls", "parent", "phone", "parentPhone", "attendance", "fees", "performance", "status", "createdAt"],
    required: ["name", "cls"],
    numbers: ["attendance", "performance"],
  },
  teachers: {
    fields: ["name", "subject", "batches", "students", "rating", "phone", "status"],
    required: ["name"],
    numbers: ["students", "rating"],
  },
  batches: {
    fields: ["name", "subjects", "teacher", "time", "seats", "attendance", "status"],
    required: ["name"],
    numbers: ["attendance"],
  },
  attendance: {
    fields: ["studentId", "student", "cls", "date", "status", "reason", "notified"],
    required: ["student", "cls", "date", "status"],
  },
  fees: {
    fields: ["studentId", "student", "cls", "total", "paid", "status", "month", "due"],
    required: ["student", "total", "paid", "status"],
    numbers: ["total", "paid"],
  },
  assignments: {
    fields: ["title", "cls", "subject", "due", "submitted", "status"],
    required: ["title"],
  },
  exams: {
    fields: ["exam", "cls", "date", "time", "room", "marks"],
    required: ["exam"],
    numbers: ["marks"],
  },
  announcements: {
    fields: ["title", "audience", "sent"],
    required: ["title"],
  },
  conversations: {
    fields: ["parent", "phone", "last", "time", "status", "createdAt", "updatedAt"],
    required: ["parent"],
  },
  notifications: {
    fields: ["category", "text", "read"],
    required: ["category", "text"],
    booleans: ["read"],
  },
  automations: {
    fields: ["key", "icon", "title", "text", "on"],
    required: ["key", "title"],
    booleans: ["on"],
  },
  activities: {
    fields: ["icon", "text", "time", "createdAt"],
    required: ["text"],
  },
  classes: {
    fields: ["subject", "teacher", "batch", "room", "time", "students", "status"],
    required: ["subject", "batch"],
    numbers: ["students"],
  },
  "ai-actions": {
    fields: ["text", "area", "status"],
    required: ["text"],
  },
  leads: {
    fields: ["phone", "name", "enquiryFor", "grade", "board", "subjects", "goal", "mode", "timing", "challenge", "demo", "createdAt"],
    required: ["phone", "name"],
  },
};

export function validateDocument(resource, value, { partial = false } = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { error: "Request body must be a JSON object." };
  }

  const schema = API_RESOURCES[resource];
  const document = {};
  for (const [key, fieldValue] of Object.entries(value)) {
    if (!schema.fields.includes(key)) {
      return { error: `Unknown field "${key}" for ${resource}.` };
    }
    if (fieldValue === undefined) continue;
    if (fieldValue === null || typeof fieldValue === "object") {
      return { error: `Field "${key}" must be a scalar value.` };
    }
    if (schema.numbers?.includes(key) && (typeof fieldValue !== "number" || !Number.isFinite(fieldValue))) {
      return { error: `Field "${key}" must be a finite number.` };
    }
    if (schema.booleans?.includes(key) && typeof fieldValue !== "boolean") {
      return { error: `Field "${key}" must be a boolean.` };
    }
    if (!schema.numbers?.includes(key) && !schema.booleans?.includes(key) && typeof fieldValue !== "string") {
      return { error: `Field "${key}" must be a string.` };
    }
    if (typeof fieldValue === "string" && fieldValue.length > 1000) {
      return { error: `Field "${key}" exceeds the 1000 character limit.` };
    }
    document[key] = fieldValue;
  }

  if (!Object.keys(document).length) {
    return { error: "Provide at least one valid field." };
  }
  if (!partial) {
    const missing = schema.required.filter((key) =>
      document[key] === undefined || (typeof document[key] === "string" && !document[key].trim()));
    if (missing.length) return { error: `Missing required field(s): ${missing.join(", ")}.` };
  }
  return { document };
}
