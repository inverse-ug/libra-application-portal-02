"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function RegisterFormSkeleton() {
  return (
    <div className="px-2 py-8 sm:p-8 space-y-8">
      <div className="flex justify-center mb-6">
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-full" />
        </div>

        <Skeleton className="h-10 w-full mt-8" />
      </div>
    </div>
  );
}
