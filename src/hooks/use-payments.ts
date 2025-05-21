"use client";

import { Application } from "@/app/generated/prisma";
import { useState, useEffect } from "react";

export function useApplicationPayments(userId?: string) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchApplicationPayments = async () => {
      try {
        setIsLoading(true);
        const url = new URL(
          `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/applications`
        );

        // Filter by user
        url.searchParams.append("where[user][equals]", userId);

        // Only get applications that have payment info
        url.searchParams.append("where[paymentStatus][exists]", "true");

        // Sort by createdAt in descending order
        url.searchParams.append("sort", "-createdAt");

        // Add depth for related fields
        url.searchParams.append("depth", "1");

        const response = await fetch(url.toString(), {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch application payments");
        }

        const data = await response.json();
        setApplications(data.docs || []);
      } catch (err) {
        console.error("Error fetching application payments:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationPayments();
  }, [userId]);

  return { applications, isLoading, error };
}
