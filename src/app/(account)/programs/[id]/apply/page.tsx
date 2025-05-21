"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  Calendar,
  Clock,
  GraduationCap,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getProgramById } from "@/app/actions/program-actions";
import { useUser } from "@/hooks/use-user";
import Link from "next/link";

export default function ProgramApplyPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user } = useUser();
  const [program, setProgram] = useState<any>(null);
  const [isShortCourse, setIsShortCourse] = useState(false);
  const [shortCourseDuration, setShortCourseDuration] =
    useState<string>("3 months");
  const [selectedIntake, setSelectedIntake] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const programData = await getProgramById(params.id);
        setProgram(programData);

        // Set default values based on program data
        if (programData) {
          // Check if program is available as short course
          const isShortCourseAvailable = programData.categories?.some(
            (cat: any) => cat.name === "Short Course"
          );
          setIsShortCourse(isShortCourseAvailable && programData.isShortCourse);

          // Set default intake if available
          if (programData.intakes && programData.intakes.length > 0) {
            // Find active intake if any
            const activeIntake = programData.intakes.find(
              (intake: any) => intake.isActive
            );
            setSelectedIntake(
              activeIntake ? activeIntake.id : programData.intakes[0].id
            );
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load program details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleApply = async () => {
    if (!user) {
      router.push(
        "/login?redirect=" + encodeURIComponent(`/programs/${params.id}/apply`)
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const applicationData = {
        programId: program.id,
        intakeId: isShortCourse ? null : selectedIntake,
        isShortCourse,
        shortCourseDuration: isShortCourse ? shortCourseDuration : null,
      };

      // const result = await createApplication(applicationData);

      // if (result.success) {
      //   router.push(`/apply/${result.applicationId}`);
      // } else {
      //   setError(
      //     result.message || "Failed to create application. Please try again."
      //   );
      // }
    } catch (error) {
      console.error("Error creating application:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <Card className="shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Program Not Found</h2>
              <p className="text-muted-foreground">
                The program you're looking for doesn't exist or has been
                removed.
              </p>
              <Button asChild className="mt-4 rounded-lg">
                <Link href="/programs">Browse Programs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if short course is available for this program
  const isShortCourseAvailable = program.categories?.some(
    (cat: any) => cat.name === "Short Course"
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/programs">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Programs</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Apply for Program</h1>
      </div>

      <Card className="shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="pb-3 bg-indigo-50/50 dark:bg-indigo-950/20 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <CardTitle className="text-xl text-indigo-700 dark:text-indigo-400">
                {program.title}
              </CardTitle>
              <CardDescription>{program.type} Program</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {program.categories?.map((category: any) => (
                <Badge
                  key={category.id}
                  variant="outline"
                  className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 rounded-md">
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Program Details</h3>
              <p className="text-muted-foreground">{program.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{program.duration}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tuition Fee</p>
                  <p className="font-medium">
                    {formatCurrency(program.tuitionFee)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requirements</p>
                  <p className="font-medium">{program.requirements}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Application Fee
                  </p>
                  <p className="font-medium">UGX 50,000 (Non-refundable)</p>
                </div>
              </div>
            </div>

            {isShortCourseAvailable && (
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">Program Type</h3>
                <RadioGroup
                  value={isShortCourse ? "short" : "regular"}
                  onValueChange={(v) => setIsShortCourse(v === "short")}
                  className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem
                      value="regular"
                      id="regular"
                      className="mt-1"
                    />
                    <div className="grid gap-1.5">
                      <Label htmlFor="regular" className="font-medium">
                        Regular Program
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Apply for the full {program.type.toLowerCase()} program
                        through a specific intake period.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="short" id="short" className="mt-1" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="short" className="font-medium">
                        Short Course
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Apply for a 3-6 month short course version of this
                        program.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}

            {isShortCourse && isShortCourseAvailable ? (
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">
                  Short Course Duration
                </h3>
                <RadioGroup
                  value={shortCourseDuration}
                  onValueChange={setShortCourseDuration}
                  className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem
                      value="3 months"
                      id="3months"
                      className="mt-1"
                    />
                    <Label htmlFor="3months">3 Months</Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <RadioGroupItem
                      value="6 months"
                      id="6months"
                      className="mt-1"
                    />
                    <Label htmlFor="6months">6 Months</Label>
                  </div>
                </RadioGroup>
              </div>
            ) : (
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">Select Intake</h3>
                {program.intakes && program.intakes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {program.intakes.map((intake: any) => (
                      <div
                        key={intake.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedIntake === intake.id
                            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                            : "hover:border-indigo-300 dark:hover:border-indigo-700"
                        }`}
                        onClick={() => setSelectedIntake(intake.id)}>
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{intake.name}</p>
                          <div
                            className={`h-4 w-4 rounded-full ${
                              selectedIntake === intake.id
                                ? "bg-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800"
                                : "border border-gray-300 dark:border-gray-600"
                            }`}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(intake.startDate).toLocaleDateString()} -{" "}
                          {new Date(intake.endDate).toLocaleDateString()}
                        </p>
                        {intake.isActive && (
                          <Badge className="mt-2 bg-green-100 text-green-800 border-green-200 rounded-md">
                            Active
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert className="rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No intakes available</AlertTitle>
                    <AlertDescription>
                      There are currently no intakes for this program. Please
                      check back later or consider applying for a short course
                      if available.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>

          <div className="pt-4 border-t flex flex-col sm:flex-row gap-3 justify-end">
            <Button variant="outline" asChild className="rounded-lg">
              <Link href="/programs">Cancel</Link>
            </Button>
            <Button
              onClick={handleApply}
              disabled={
                isSubmitting ||
                (!isShortCourse &&
                  (!selectedIntake ||
                    !program.intakes ||
                    program.intakes.length === 0))
              }
              className="bg-indigo-600 hover:bg-indigo-700 rounded-lg">
              {isSubmitting ? "Processing..." : "Continue to Application"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
