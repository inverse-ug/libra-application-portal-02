import { Skeleton } from "@/components/ui/skeleton";

export default function LoginFormSkeleton() {
  return (
    <div className="bg-card p-8 rounded-lg shadow-sm border w-full space-y-6">
      <div className="space-y-4">
        {/* Email field skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Password field skeleton */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="relative">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="absolute right-3 top-3 h-6 w-6 rounded-full" />
          </div>
        </div>
      </div>

      {/* Submit button skeleton */}
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
