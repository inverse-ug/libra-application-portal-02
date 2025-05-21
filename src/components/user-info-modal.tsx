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
import { useStudent } from "@/hooks/use-student";
import { Skeleton } from "@/components/ui/skeleton";

interface UserInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserInfoModal({ open, onOpenChange }: UserInfoModalProps) {
  const { user, isLoading: isUserLoading } = useUser();
  const { student, isLoading: isStudentLoading } = useStudent(
    user?.id ? String(user?.id) : undefined
  );

  const isLoading = isUserLoading || isStudentLoading;

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

  // // Function to determine which ID to display
  // const getDisplayId = () => {
  //   // Prioritize Student ID if available
  //   if (student?.studentId) {
  //     return {
  //       label: "Student ID",
  //       value: student.studentId,
  //     };
  //   }

  //   // Fall back to Account ID
  //   return {
  //     label: "Account ID",
  //     value: user?.accountId || "Not Available",
  //   };
  // };

  // const displayId = getDisplayId();

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
            {/* <p className="text-sm text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-4 w-40" />
              ) : (
                `${displayId.label}: ${displayId.value}`
              )}
            </p> */}
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
                    {student?.enrolledPrograms?.length
                      ? typeof student.enrolledPrograms[0] === "string"
                        ? "Enrolled"
                        : typeof student.enrolledPrograms[0] === "object" &&
                            "name" in student.enrolledPrograms[0]
                          ? student.enrolledPrograms[0].name
                          : "Unknown Program"
                      : "Not Enrolled"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Enrollment Date</p>
                {isLoading ? (
                  <Skeleton className="h-4 w-40" />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {student?.createdAt
                      ? new Date(student.createdAt).toLocaleDateString()
                      : "Not Available"}
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
                    {user?.phoneNumber || "Not Available"}
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
                    {student?.address || "Not Available"}
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
                    {student?.isAdmitted ? "Admitted" : "Not Admitted"}
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
