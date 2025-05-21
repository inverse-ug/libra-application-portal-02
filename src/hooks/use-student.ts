"use client";

import { Applicant } from "@/app/generated/prisma";
import { useEffect, useState } from "react";

export function useStudent(userId?: string) {
  const [student, setStudent] = useState<Applicant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchStudent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/students?where[user][equals]=${userId}&depth=1`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch student");
        }

        const data = await response.json();
        if (data.docs && data.docs.length > 0) {
          setStudent(data.docs[0]);
        } else {
          setStudent(null);
        }
      } catch (err) {
        console.error("Error fetching student:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudent();
  }, [userId]);

  return { student, isLoading, error };
}
