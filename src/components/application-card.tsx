import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  CalendarDays,
  Eye,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface ApplicationCardProps {
  application: any;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  // Helper function to get status badge
  const getStatusBadge = () => {
    switch (application.status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 rounded-md">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Pending
          </Badge>
        );
      case "UNDER_REVIEW":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 rounded-md">
            <FileText className="h-3.5 w-3.5 mr-1" />
            Under Review
          </Badge>
        );
      case "ACCEPTED":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-md">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Accepted
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 rounded-md">
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Rejected
          </Badge>
        );
      case "ENROLLED":
        return (
          <Badge
            variant="outline"
            className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 rounded-md">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Enrolled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="rounded-md">
            {application.status}
          </Badge>
        );
    }
  };

  // Helper function to get payment status badge
  const getPaymentBadge = () => {
    if (!application.payment) {
      return (
        <Badge
          variant="outline"
          className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle className="h-3.5 w-3.5 mr-1" />
          Payment Required
        </Badge>
      );
    }

    switch (application.payment.status) {
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-md">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Paid
          </Badge>
        );
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 rounded-md">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Payment Pending
          </Badge>
        );
      case "FAILED":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 rounded-md">
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Payment Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="rounded-md">
            {application.payment.status}
          </Badge>
        );
    }
  };

  return (
    <div className="border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="font-medium text-lg text-amber-700 dark:text-amber-400">
            {application.program?.title || "Unknown Program"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {application.intake?.name || "Unknown Intake"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {getStatusBadge()}
          {getPaymentBadge()}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <div className="h-6 w-6 rounded-md bg-slate-100 dark:bg-slate-800/40 flex items-center justify-center text-slate-600 dark:text-slate-400">
          <CalendarDays className="h-3.5 w-3.5" />
        </div>
        <span>Applied on {formatDate(application.createdAt)}</span>
      </div>

      <div className="flex flex-wrap gap-2 justify-end">
        <Button asChild variant="outline" className="rounded-lg">
          <Link href={`/my-applications/${application.id}`}>
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Link>
        </Button>

        {application.status === "ACCEPTED" && (
          <Button
            asChild
            className="rounded-lg bg-emerald-600 hover:bg-emerald-700">
            <Link href={`/my-admissions/${application.id}`}>
              View Admission
            </Link>
          </Button>
        )}

        {!application.payment && (
          <Button
            asChild
            className="rounded-lg bg-amber-600 hover:bg-amber-700">
            <Link href={`/payment/${application.id}`}>Pay Application Fee</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
