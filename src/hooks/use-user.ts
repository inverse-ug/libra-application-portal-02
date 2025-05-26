"use client";

import { useState, useEffect } from "react";
import { getCurrentApplicant } from "@/lib/user-utils";

export function useUser() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Directly call the server action
        const userData = await getCurrentApplicant();
        setUser(userData);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch user")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return {
    user,
    isLoading,
    error,
  };
}
