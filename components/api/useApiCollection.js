"use client";
import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "./client";

export default function useApiCollection(resource) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await apiRequest(`/api/${resource}`));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => { reload(); }, [reload]);
  return { data, loading, error, reload, setData };
}
