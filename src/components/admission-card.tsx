import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  CalendarDays,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  Download,
  Printer,
} from "lucide-react";
import Link from "next/link";

interface AdmissionCardProps {
  admission: any;
}

export function AdmissionCard({ admission }: AdmissionCardProps) {
  // Helper function to get status badge
  const getStatusBadge = () => {
    switch (admission.status) {
      case "PROVISIONAL":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 rounded-md">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Provisional
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-md">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Confirmed
          </Badge>
        );
      case "DEFERRED":
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 rounded-md">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Deferred
          </Badge>
        );
      case "WITHDRAWN":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 rounded-md">
            <FileText className="h-3.5 w-3.5 mr-1" />
            Withdrawn
          </Badge>
        );
      case "GRADUATED":
        return (
          <Badge
            variant="outline"
            className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 rounded-md">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Graduated
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="rounded-md">
            {admission.status}
          </Badge>
        );
    }
  };

  return (
    <div className="border border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="font-medium text-lg text-rose-700 dark:text-rose-400">
            {admission.program?.title || "Unknown Program"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {admission.application?.intake?.name || "Unknown Intake"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {getStatusBadge()}
          <Badge
            variant="outline"
            className="bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 rounded-md">
            {admission.admissionNumber}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <div className="h-6 w-6 rounded-md bg-slate-100 dark:bg-slate-800/40 flex items-center justify-center text-slate-600 dark:text-slate-400">
          <CalendarDays className="h-3.5 w-3.5" />
        </div>
        <span>Start Date: {formatDate(admission.startDate)}</span>
      </div>

      <div className="flex flex-wrap gap-2 justify-end">
        <Button asChild variant="outline" className="rounded-lg">
          <Link href={`/my-admissions/${admission.id}`}>
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Link>
        </Button>

        <Button asChild variant="outline" className="rounded-lg">
          <Link href={`/my-admissions/${admission.id}/download`}>
            <Download className="h-4 w-4 mr-1" />
            Download Letter
          </Link>
        </Button>

        <Button asChild variant="outline" className="rounded-lg">
          <Link href={`/my-admissions/${admission.id}/print`}>
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Link>
        </Button>
      </div>
    </div>
  );
}
