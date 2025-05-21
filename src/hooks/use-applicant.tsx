"use client";

import { getApplicantById } from "@/app/actions/application-actions";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Define the Applicant type based on your schema
interface Applicant {
  id: string;
  name: string;
  email: string | null;
  phone?: string;
  firstName?: string;
  middleName?: string;
  surname?: string;
  dateOfBirth?: Date;
  gender?: string;
  nationality?: string;
  physicalAddress?: string;
  educationHistory?: any[];
  nextOfKinName?: string;
  nextOfKinRelationship?: string;
  sponsorName?: string;
  sponsorRelationship?: string;
  createdAt: Date;
  updatedAt: Date;
  applications?: any[];
}

export function useApplicant(userId?: string) {
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchApplicant = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Use the server action directly instead of fetch
        const data = await getApplicantById(userId);
        setApplicant(data as Applicant);
      } catch (err) {
        console.error("Error fetching applicant:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        toast.error("Failed to load applicant information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicant();
  }, [userId]);

  return { applicant, isLoading, error };
}
