"use client";
import { useEffect, useState } from "react";
import { apiRequest } from "./client";

export default function useApiSummary() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    apiRequest("/api/dashboard").then(setData).catch((requestError) => setError(requestError.message));
  }, []);
  return { data, error };
}
