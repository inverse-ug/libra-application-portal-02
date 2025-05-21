"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  QrCode,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/use-user";
import { useApplicant } from "@/hooks/use-applicant";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface UserInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserInfoModal({ open, onOpenChange }: UserInfoModalProps) {
  const { user, isLoading: isUserLoading } = useUser();
  const { applicant, isLoading: isApplicantLoading } = useApplicant(
    user?.id ? String(user?.id) : undefined
  );

  const isLoading = isUserLoading || isApplicantLoading;

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Function to handle email display
  const getDisplayEmail = () => {
    if (!user?.email) return "Not Available";

    // Check if email contains "phoneverified"
    if (user.email.includes("@phoneverified")) {
      return "Not Available"; // Don't display phone-verified temporary emails
    }

    return user.email;
  };

  // Get the most recent program the applicant applied for
  const getProgram = () => {
    if (!applicant?.applications || applicant.applications.length === 0) {
      return "Not Enrolled";
    }

    const latestApplication = applicant.applications[0];
    return latestApplication.program?.title || "Unknown Program";
  };

  // Format date for display
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Not Available";
    return format(new Date(date), "PPP"); // Localized date format
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border h-[95vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
        </DialogHeader>

        <div className="border border-border p-4 bg-card">
          <div className="flex flex-col items-center mb-4">
            <div className="w-24 h-24 bg-primary flex items-center justify-center text-primary-foreground text-3xl mb-2">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : user?.name ? (
                getInitials(user.name)
              ) : (
                "?"
              )}
            </div>
            <h2 className="text-xl font-bold">
              {isLoading ? (
                <Skeleton className="h-7 w-32" />
              ) : (
                user?.name || "Unknown User"
              )}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-4 w-40" />
              ) : (
                `Applicant ID: ${applicant?.id?.substring(0, 8) || "Not Available"}`
              )}
            </p>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Program</p>
                {isLoading ? (
                  <Skeleton className="h-4 w-40" />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {getProgram()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Registration Date</p>
                {isLoading ? (
                  <Skeleton className="h-4 w-40" />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {formatDate(applicant?.createdAt)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Email</p>
                {isLoading ? (
                  <Skeleton className="h-4 w-40" />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {getDisplayEmail()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                {isLoading ? (
                  <Skeleton className="h-4 w-40" />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {applicant?.phone || user?.phone || "Not Available"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Address</p>
                {isLoading ? (
                  <Skeleton className="h-4 w-40" />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {applicant?.physicalAddress || "Not Available"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Status</p>
                {isLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {applicant?.applications?.some(
                      (app) => app.status === "ACCEPTED"
                    )
                      ? "Admitted"
                      : "Not Admitted"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-center">
            <div className="border border-border p-2 bg-background">
              <QrCode className="h-32 w-32" />
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <Button variant="outline" size="sm">
              Print ID
            </Button>
            <Button size="sm">Download</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
