"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { createOrUpdateApplication } from "@/app/actions/application-actions";
import { getProgramById } from "@/app/actions/program-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  BookOpen,
  Clock,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ShortCourseApplyPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [program, setProgram] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<"3 months" | "6 months">("3 months");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setIsLoading(true);
        const data = await getProgramById(params.id);
        setProgram(data);
      } catch (error) {
        console.error("Error fetching program:", error);
        setError("Failed to load program. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchProgram();
    }
  }, [params.id]);

  const handleApply = async () => {
    if (!user) {
      toast.error("Please sign in to apply for this course");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const application = await createOrUpdateApplication(user.id, program.id, {
        isShortCourse: true,
        shortCourseDuration: duration,
      });

      if (application) {
        toast.success("Application created successfully");
        router.push(`/apply/${application.id}`);
      } else {
        throw new Error("Failed to create application");
      }
    } catch (error) {
      console.error("Error creating application:", error);
      setError("Failed to create application. Please try again.");
      toast.error("Failed to create application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <Alert variant="destructive" className="rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            The program you are looking for does not exist or has been removed.
            Please go back and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <Card className="rounded-xl shadow-sm overflow-hidden">
        <CardHeader className="bg-amber-50/50 dark:bg-amber-950/20 border-b">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <CardTitle>{program.title}</CardTitle>
          </div>
          <CardDescription>Apply for this short course program</CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-6 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Duration Options
                  </p>
                  <p className="font-medium">3 or 6 months</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tuition Fee</p>
                  <p className="font-medium">
                    {program.tuitionFee
                      ? `UGX ${program.tuitionFee.toLocaleString()}`
                      : "Contact for pricing"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">
                Select Course Duration
              </h3>
              <RadioGroup
                value={duration}
                onValueChange={(value) =>
                  setDuration(value as "3 months" | "6 months")
                }>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 cursor-pointer hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3 months" id="3-months" />
                      <Label
                        htmlFor="3-months"
                        className="flex-1 cursor-pointer">
                        <div className="font-medium">3 Months</div>
                        <div className="text-sm text-muted-foreground">
                          Intensive program
                        </div>
                      </Label>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 cursor-pointer hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="6 months" id="6-months" />
                      <Label
                        htmlFor="6-months"
                        className="flex-1 cursor-pointer">
                        <div className="font-medium">6 Months</div>
                        <div className="text-sm text-muted-foreground">
                          Comprehensive program
                        </div>
                      </Label>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-2">Program Description</h3>
              <p className="text-muted-foreground">{program.description}</p>
            </div>

            {program.requirements && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-2">Requirements</h3>
                <p className="text-muted-foreground">{program.requirements}</p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="bg-amber-50/30 dark:bg-amber-950/10 border-t p-6">
          <Button
            onClick={handleApply}
            disabled={isSubmitting || !user}
            className="w-full rounded-lg bg-amber-600 hover:bg-amber-700">
            {isSubmitting ? (
              "Creating Application..."
            ) : (
              <>
                Apply Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
