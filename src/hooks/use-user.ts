"use client";

import { useSession } from "next-auth/react";

export function useUser() {
  const { data: session, status } = useSession();

  return {
    user: session?.user || null,
    isLoading: status === "loading",
    error: status === "unauthenticated" ? new Error("Not authenticated") : null,
  };
}
