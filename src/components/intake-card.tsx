import {
  CalendarDays,
  Printer,
  FileDown,
  Edit,
  Eye,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Intake } from "@/app/generated/prisma";

type IntakeCardProps = {
  intake: Intake & {
    applications?: any[];
    programs?: any[]; // Add this to fix the TypeScript error
  };
  userApplications?: any[];
};

export function IntakeCard({ intake, userApplications = [] }: IntakeCardProps) {
  // Check if user has applied to this intake
  const userApplication = userApplications?.find((app) =>
    typeof app.intake === "object"
      ? app.intake.id === intake.id
      : app.intakeId === intake.id
  );

  const applied = Boolean(userApplication);
  const paid = applied && userApplication?.payment?.status === "COMPLETED";
  const isComplete = applied && userApplication?.status !== "DRAFT";
  const isDraft = applied && userApplication?.status === "DRAFT";
  const applicationProgress = isDraft ? userApplication?.progress || 0 : 100;

  // Determine intake status based on dates
  const now = new Date();
  const startDate = new Date(intake.startDate);
  const endDate = new Date(intake.endDate);

  let status = "ended";
  if (now < startDate) {
    status = "upcoming";
  } else if (now <= endDate) {
    status = "ongoing";
  }

  // Adding this check for payment expired status
  const isPaymentExpired =
    applied && !paid && isComplete && status !== "ongoing";

  // Calculate days remaining or days until start
  const daysRemaining = Math.max(
    0,
    Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );
  const daysUntilStart = Math.max(
    0,
    Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Define status colors based on intake status and application status
  const getStatusStyles = () => {
    if (applied && !paid && isComplete) {
      // If payment is expired, use reddish color
      if (status !== "ongoing") {
        return "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"; // Payment expired
      }
      return "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20"; // Pending payment
    }

    if (applied && !paid && !isComplete) {
      // If application expired, use reddish color
      if (status !== "ongoing") {
        return "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"; // Application expired
      }
      return "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20"; // Incomplete application
    }

    if (applied && paid) {
      return "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20"; // Applied and paid
    }

    switch (status) {
      case "upcoming":
        return "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20";
      case "ongoing":
        return "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20";
      case "ended":
        return "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20";
      default:
        return "border-border";
    }
  };

  const getStatusText = () => {
    if (applied && !paid && isComplete) {
      return status !== "ongoing" ? "Payment Expired" : "Pending Payment";
    }
    if (applied && !paid && !isComplete) {
      return status !== "ongoing"
        ? "Application Expired"
        : "Incomplete Application";
    }
    if (applied && paid) return "Applied";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusBadgeStyles = () => {
    if (applied && !paid && isComplete && status !== "ongoing") {
      return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"; // Payment expired
    }
    if (applied && !paid && isComplete) {
      return "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"; // Pending payment
    }
    if (applied && !paid && !isComplete && status !== "ongoing") {
      return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"; // Application expired
    }
    if (applied && !paid && !isComplete) {
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"; // Incomplete application
    }
    if (applied && paid) {
      return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"; // Applied and paid
    }

    switch (status) {
      case "upcoming":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "ongoing":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "ended":
        return "bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
      default:
        return "";
    }
  };

  return (
    <div
      className={`border rounded-xl p-4 ${getStatusStyles()} transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start mb-3 flex-col-reverse sm:flex-row gap-2">
        <h3 className="font-medium text-lg">{intake.name}</h3>
        <Badge
          variant="outline"
          className={cn("px-2.5 py-0.5 rounded-md", getStatusBadgeStyles())}>
          {getStatusText()}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {intake.description || "No description available"}
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <div className="h-6 w-6 rounded-md bg-slate-100 dark:bg-slate-800/40 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <CalendarDays className="h-3.5 w-3.5" />
          </div>
          <span>
            {formatDate(intake.startDate)} - {formatDate(intake.endDate)}
          </span>
        </div>

        {status === "upcoming" && daysUntilStart > 0 && (
          <Badge
            variant="outline"
            className={cn("w-fit rounded-md", getStatusBadgeStyles())}>
            <Clock className="h-3.5 w-3.5 mr-1" />
            {status === "upcoming"
              ? `Starts in ${daysUntilStart} days`
              : `${daysRemaining} days remaining`}
          </Badge>
        )}

        {status === "ongoing" && daysRemaining > 0 && (
          <Badge
            variant="outline"
            className={cn("w-fit rounded-md", getStatusBadgeStyles())}>
            <Clock className="h-3.5 w-3.5 mr-1" />
            {daysRemaining} days remaining
          </Badge>
        )}
      </div>

      {/* Show progress bar for draft applications */}
      {isDraft && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Application Progress</span>
            <span>{applicationProgress}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${applicationProgress}%` }}
              aria-valuenow={applicationProgress}
              aria-valuemin={0}
              aria-valuemax={100}></div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-4">
        <div className="bg-white dark:bg-slate-900 px-3 py-1 rounded-lg text-sm border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="font-medium">Fee:</span>{" "}
          {formatCurrency(intake.applicationFee)}
        </div>

        <div className="bg-white dark:bg-slate-900 px-3 py-1 rounded-lg text-sm border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="font-medium">Programs:</span>{" "}
          {intake.programs?.length || 0}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 justify-end">
        {/* Apply button for intakes that haven't been applied to */}
        {!applied && status === "ongoing" && (
          <Button
            size="sm"
            asChild
            className="rounded-lg bg-blue-600 hover:bg-blue-700">
            <Link href={`/intakes/${intake.id}/apply`}>Apply Now</Link>
          </Button>
        )}

        {/* Continue Application button for draft applications */}
        {isDraft && status === "ongoing" && (
          <Button
            size="sm"
            asChild
            className="rounded-lg bg-blue-600 hover:bg-blue-700">
            <Link href={`/apply/${userApplication?.id}`}>
              <Edit className="h-4 w-4 mr-1" />
              Continue Application ({applicationProgress}%)
            </Link>
          </Button>
        )}

        {/* Pay Application Fee button - only if ongoing and complete */}
        {applied && !paid && isComplete && status === "ongoing" && (
          <Button
            size="sm"
            variant="default"
            className="rounded-lg bg-amber-600 hover:bg-amber-700"
            asChild>
            <Link href={`/payment/${userApplication?.id}`}>
              Pay Application Fee
            </Link>
          </Button>
        )}

        {/* View button for all applications */}
        {applied && (
          <Button size="sm" variant="outline" asChild className="rounded-lg">
            <Link href={`/my-applications/${userApplication?.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Link>
          </Button>
        )}

        {/* Coming Soon button for upcoming intakes */}
        {status === "upcoming" && (
          <Button size="sm" variant="outline" disabled className="rounded-lg">
            Coming Soon
          </Button>
        )}

        {/* Print and Download buttons only for paid applications */}
        {applied && paid && (
          <>
            <Button size="sm" variant="outline" asChild className="rounded-lg">
              <Link href={`/my-applications/${userApplication?.id}/print`}>
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="rounded-lg">
              <Link href={`/my-applications/${userApplication?.id}/download`}>
                <FileDown className="h-4 w-4 mr-1" />
                Download PDF
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
