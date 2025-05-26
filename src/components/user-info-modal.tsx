"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  QrCode,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Download,
  Printer,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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

  // Get admission status
  const getAdmissionStatus = () => {
    const isAdmitted = applicant?.applications?.some(
      (app) => app.status === "ACCEPTED"
    );
    return isAdmitted ? "admitted" : "pending";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-0 shadow-2xl bg-gradient-to-br from-background via-background to-accent/90 rounded-3xl p-0 overflow-hidden max-h-[98vh]">
        {/* Header with colorful gradient - maintains brand colors */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-3 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              My Profile
            </DialogTitle>
          </DialogHeader>
        </div>

        <ScrollArea className="h-[70vh] px-6">
          <div className="py-6 space-y-6">
            {/* Profile Header */}
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                {/* Avatar with colorful gradient - maintains brand colors */}
                <div className="w-28 h-28 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-4xl flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-background">
                  {isLoading ? (
                    <Skeleton className="w-full h-full rounded-4xl" />
                  ) : user?.name ? (
                    getInitials(user.name)
                  ) : (
                    "?"
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  {isLoading ? (
                    <Skeleton className="h-8 w-40 mx-auto" />
                  ) : (
                    user?.name || "Unknown User"
                  )}
                </h2>

                <div className="flex items-center justify-center gap-2">
                  <Badge
                    variant={
                      getAdmissionStatus() === "admitted"
                        ? "default"
                        : "secondary"
                    }
                    className={`rounded-full px-3 py-1 ${
                      getAdmissionStatus() === "admitted"
                        ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                        : "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
                    }`}>
                    {getAdmissionStatus() === "admitted" ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {getAdmissionStatus() === "admitted"
                      ? "Admitted"
                      : "Not Addmitted"}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground bg-muted rounded-full px-3 py-1 inline-block">
                  {isLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    `ID: ${applicant?.id?.substring(0, 8) || "Not Available"}`
                  )}
                </p>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Information Cards */}
            <div className="grid gap-4">
              {[
                {
                  icon: GraduationCap,
                  label: "Program",
                  value: getProgram(),
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  icon: Calendar,
                  label: "Registration Date",
                  value: formatDate(applicant?.createdAt),
                  color: "from-purple-500 to-pink-500",
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: getDisplayEmail(),
                  color: "from-green-500 to-emerald-500",
                },
                {
                  icon: Phone,
                  label: "Phone",
                  value: applicant?.phone || user?.phone || "Not Available",
                  color: "from-orange-500 to-red-500",
                },
                {
                  icon: MapPin,
                  label: "Address",
                  value: applicant?.physicalAddress || "Not Available",
                  color: "from-indigo-500 to-purple-500",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl p-4 shadow-sm border border-border hover:shadow-md transition-all duration-200 hover:scale-[1.01] hover:border-accent">
                  <div className="flex items-start gap-4">
                    {/* Icon containers keep colorful gradients for visual appeal */}
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-card-foreground mb-1">
                        {item.label}
                      </p>
                      {isLoading ? (
                        <Skeleton className="h-4 w-32" />
                      ) : (
                        <p className="text-sm text-muted-foreground break-words">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* QR Code Section */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              {/* <h3 className="text-lg font-semibold text-card-foreground mb-4 text-center">
                Digital ID
              </h3> */}
              <div className="flex justify-center mb-4">
                <div className="bg-muted rounded-2xl p-6 shadow-inner">
                  <QrCode className="h-32 w-32 text-muted-foreground" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Scan this QR code for quick access to your profile
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="p-6 bg-muted/30 border-t border-border">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-full border-2 hover:bg-accent hover:border-accent-foreground/20 transition-colors">
              <Printer className="h-4 w-4 mr-2" />
              Print ID
            </Button>
            {/* Main action button keeps colorful gradient for emphasis */}
            <Button className="flex-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-white">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
