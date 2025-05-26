"use client";

import {
  CalendarClock,
  Bell,
  FileCheck,
  AlertCircle,
  BookOpen,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import {
  getIntakes,
  getUserApplications,
  getAnnouncements,
} from "@/app/actions/intake-actions";
import { IntakeCard } from "@/components/intake-card";
import { ShortCourseCTA } from "@/components/short-course-cta";
import { toast } from "sonner";

interface Application {
  id: string;
  status: string;
  intake?: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
  };
  program?: {
    id: string;
    title: string;
    type: string;
    duration?: string;
  };
  admission?: {
    id: string;
    admissionNumber: string;
    status: string;
  };
}

export default function HomeContent({ userId }: { userId?: string }) {
  const [intakes, setIntakes] = useState<any[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState({
    intakes: true,
    applications: true,
    announcements: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch intakes
        const intakesData = await getIntakes({ limit: 4, isActive: true });
        setIntakes(intakesData);
        setIsLoading((prev) => ({ ...prev, intakes: false }));

        // Fetch user applications if userId is provided
        if (userId) {
          const applicationsData = await getUserApplications(userId);
          setApplications(applicationsData);
        }
        setIsLoading((prev) => ({ ...prev, applications: false }));

        // Fetch announcements
        const announcementsData = await getAnnouncements(5);
        setAnnouncements(announcementsData);
        setIsLoading((prev) => ({ ...prev, announcements: false }));
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load dashboard data. Please refresh the page.");
        setIsLoading({
          intakes: false,
          applications: false,
          announcements: false,
        });
      }
    };

    fetchData();
  }, [userId]);

  // Find admitted application
  const admittedApplication = applications?.find(
    (app) => app.status === "ACCEPTED"
  );
  const admittedIntake = admittedApplication?.intake;
  const admittedProgram = admittedApplication?.program;

  // Format program display name
  const getProgramDisplayName = (program: any) => {
    if (!program) return "Unknown Program";
    return program.title;
  };

  // Format intake display name
  const getIntakeDisplayName = (intake: any) => {
    if (!intake) return "Unknown Intake";
    return intake.name;
  };

  return (
    <>
      {/* Provisional Admission Section - Only show if user has an approved application */}
      {!isLoading.applications && admittedApplication ? (
        <Card className="mb-6 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 overflow-hidden rounded-xl shadow-sm">
          <CardHeader className="bg-emerald-100/50 dark:bg-emerald-900/20 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <FileCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-emerald-700 dark:text-emerald-400">
                Provisional Admission
              </CardTitle>
            </div>
            <CardDescription>
              Congratulations! You have been provisionally admitted to the
              following program:
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 p-4 mb-4 rounded-lg">
              <div className="mb-3">
                <h3 className="font-medium mb-1 text-emerald-700 dark:text-emerald-400">
                  {getProgramDisplayName(admittedProgram)}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium">Intake:</span>{" "}
                  {getIntakeDisplayName(admittedIntake)}
                </p>
                {admittedProgram?.type && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium">Program Type:</span>{" "}
                    <Badge variant="outline" className="ml-1">
                      {admittedProgram.type.replace("_", " ")}
                    </Badge>
                  </p>
                )}
                {admittedProgram?.duration && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium">Duration:</span>{" "}
                    {admittedProgram.duration}
                  </p>
                )}
                {admittedIntake?.startDate && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium">Start Date:</span>{" "}
                    {new Date(admittedIntake.startDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Your application has been reviewed and you have been
                provisionally admitted. Please download your admission letter
                and complete the registration process.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  asChild
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm">
                  <Link
                    href={`/my-applications/${admittedApplication.id}/admission-letter`}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Admission Letter
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                  <Link href="/application-history">
                    View Application Details
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : isLoading.applications ? (
        <Card className="mb-6 rounded-xl shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent>
            <div className="border border-border bg-background p-4 mb-4 rounded-lg">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-9 w-48" />
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden rounded-xl shadow-sm py-0">
            <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 pt-6 border-b">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <CardTitle>Recent Intakes</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading.intakes ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="h-4 w-full mb-3" />
                      <Skeleton className="h-3 w-40 mb-3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : intakes.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {intakes.map((intake) => (
                    <IntakeCard
                      key={intake.id}
                      intake={intake}
                      userApplications={applications}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <BookOpen className="h-6 w-6" />
                    </div>
                  }
                  title="No intakes available"
                  description="There are currently no active intakes. Check back later for new enrollment opportunities."
                  actionLabel="Check All Intakes"
                  actionHref="/intakes"
                />
              )}

              {!isLoading.intakes && intakes.length > 0 && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    asChild
                    className="rounded-lg border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <Link href="/intakes">View All Intakes</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Short Course CTA */}
          <div className="mt-6">
            <ShortCourseCTA />
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="overflow-hidden rounded-xl shadow-sm h-full py-0">
            <CardHeader className="bg-amber-50/50 dark:bg-amber-950/20 pb-3 border-b pt-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Bell className="h-5 w-5" />
                </div>
                <CardTitle>Announcements</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading.announcements ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="border border-border p-3 rounded-lg">
                      <div className="flex flex-col justify-between items-start mb-2">
                        <Skeleton className="h-5 w-40 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : announcements.length > 0 ? (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="border border-amber-200 dark:border-amber-800 p-4 rounded-lg bg-white dark:bg-slate-900">
                      <div className="flex flex-col gap-2 mb-2">
                        <h3 className="font-medium text-amber-700 dark:text-amber-400">
                          {announcement.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className="bg-amber-50 self-end dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 rounded-md">
                          {new Date(
                            announcement.createdAt
                          ).toLocaleDateString()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {announcement.content}
                      </p>
                      {announcement.intake && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            Related to: {announcement.intake.name}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={
                    <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                  }
                  title="No announcements"
                  description="There are no announcements at this time. Check back later for updates."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
