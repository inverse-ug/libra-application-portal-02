"use client";

import { getAnnouncements } from "@/app/actions/announcement-actions";
import { useState, useEffect } from "react";

export function useAnnouncements(limit?: number) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true);
        const data = await getAnnouncements(limit);
        setAnnouncements(data);
      } catch (err) {
        console.error("Error fetching announcements:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, [limit]);

  return { announcements, isLoading, error };
}
