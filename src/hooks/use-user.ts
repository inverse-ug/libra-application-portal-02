"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export function useUser() {
  const { data: session, status } = useSession();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Set loading to false once the session status is no longer "loading"
    if (status !== "loading") {
      setIsInitialLoading(false);
    }
  }, [status]);

  return {
    user: session?.user || null,
    isLoading: status === "loading" || isInitialLoading,
    error: status === "unauthenticated" ? new Error("Not authenticated") : null,
  };
}
