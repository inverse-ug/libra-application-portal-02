"use client";

import { useState, useEffect } from "react";
import { getUserApplications } from "@/app/actions/intake-actions";

export function useApplications(userId?: string) {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!userId) {
        setApplications([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getUserApplications(userId);
        setApplications(data);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [userId]);

  return { applications, isLoading, error };
}
