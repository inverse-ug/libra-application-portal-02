"use client";

import { useState, useEffect } from "react";
export const useSchemes = ({ limit }: { limit?: number } = {}) => {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchemes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/schemes?limit=${limit || 100}&sort=-createdAt&depth=0`,
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSchemes(data.docs || []);
        } else {
          setSchemes([]);
        }
      } catch (error) {
        console.error("Error fetching schemes:", error);
        setSchemes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchemes();
  }, []);

  return { schemes, isLoading };
};
