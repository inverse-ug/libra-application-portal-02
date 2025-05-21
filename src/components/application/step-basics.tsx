"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, BookOpen, CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  getIntakes,
  getPrograms,
  getShortCourses,
} from "@/app/actions/program-actions";
import { updateApplicationBasics } from "@/app/actions/application-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const basicsSchema = z.object({
  courseType: z.enum(["long", "short"]),
  intakeId: z.string().optional().nullable(),
  programId: z.string(),
  shortCourseDuration: z.string().optional().nullable(),
});

type BasicsValues = z.infer<typeof basicsSchema>;

interface ApplicationStepBasicsProps {
  application: any;
  onComplete: () => void;
  preselectedIntakeId?: string;
  preselectedProgramId?: string;
  preselectedCourseType?: "long" | "short";
}

export function ApplicationStepBasics({
  application,
  onComplete,
  preselectedIntakeId,
  preselectedProgramId,
  preselectedCourseType,
}: ApplicationStepBasicsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [intakes, setIntakes] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoadingIntakes, setIsLoadingIntakes] = useState(false);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with existing application data or preselected values
  const form = useForm<BasicsValues>({
    resolver: zodResolver(basicsSchema),
    defaultValues: {
      courseType:
        preselectedCourseType ||
        (application?.isShortCourse ? "short" : "long"),
      intakeId: preselectedIntakeId || application?.intakeId || null,
      programId: preselectedProgramId || application?.programId || "",
      shortCourseDuration: application?.shortCourseDuration || "3 months",
    },
  });

  const courseType = form.watch("courseType");
  const selectedIntakeId = form.watch("intakeId");

  // Fetch intakes on component mount
  useEffect(() => {
    const fetchIntakes = async () => {
      try {
        setIsLoadingIntakes(true);
        const data = await getIntakes({ isActive: true });
        setIntakes(data);
      } catch (error) {
        console.error("Error fetching intakes:", error);
        setError("Failed to load intakes. Please try again.");
      } finally {
        setIsLoadingIntakes(false);
      }
    };

    fetchIntakes();
  }, []);

  // Fetch programs based on course type and selected intake
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setIsLoadingPrograms(true);

        if (courseType === "short") {
          // Fetch short courses
          const data = await getShortCourses();
          setPrograms(data);
        } else if (courseType === "long" && selectedIntakeId) {
          // Fetch programs for selected intake
          const data = await getPrograms({ intakeId: selectedIntakeId });
          setPrograms(data);
        } else if (courseType === "long") {
          // Fetch all regular programs
          const data = await getPrograms();
          setPrograms(data);
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
        setError("Failed to load programs. Please try again.");
      } finally {
        setIsLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, [courseType, selectedIntakeId]);

  // Handle preselected values
  useEffect(() => {
    if (preselectedCourseType) {
      form.setValue("courseType", preselectedCourseType);
    }

    if (preselectedIntakeId) {
      form.setValue("intakeId", preselectedIntakeId);
    }

    if (preselectedProgramId) {
      form.setValue("programId", preselectedProgramId);
    }
  }, [preselectedCourseType, preselectedIntakeId, preselectedProgramId, form]);

  async function onSubmit(data: BasicsValues) {
    try {
      setIsSubmitting(true);
      setError(null);

      // Update application with basics information
      await updateApplicationBasics(application.id, {
        isShortCourse: data.courseType === "short",
        intakeId: data.courseType === "long" ? (data.intakeId ?? null) : null,
        programId: data.programId,
        shortCourseDuration:
          data.courseType === "short"
            ? (data.shortCourseDuration ?? null)
            : null,
      });

      onComplete();
    } catch (error) {
      console.error("Error updating application basics:", error);
      setError("Failed to save application basics. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Application Basics</h2>
        <p className="text-muted-foreground">
          Please select the type of course you want to apply for and choose your
          preferred program.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="courseType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Course Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card
                      className={`rounded-lg cursor-pointer transition-all ${field.value === "long" ? "border-blue-300 dark:border-blue-700 shadow-sm" : ""}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="long" id="long-course" />
                          <Label
                            htmlFor="long-course"
                            className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <CalendarClock className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium">Long Course</div>
                                <div className="text-sm text-muted-foreground">
                                  Diploma or Certificate Program
                                </div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={`rounded-lg cursor-pointer transition-all ${field.value === "short" ? "border-amber-300 dark:border-amber-700 shadow-sm" : ""}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="short" id="short-course" />
                          <Label
                            htmlFor="short-course"
                            className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <BookOpen className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium">Short Course</div>
                                <div className="text-sm text-muted-foreground">
                                  3-6 Month Specialized Training
                                </div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </CardContent>
                    </Card>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {courseType === "long" && (
            <FormField
              control={form.control}
              name="intakeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Intake</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                    disabled={isLoadingIntakes}>
                    <FormControl>
                      <SelectTrigger className="rounded-lg">
                        {isLoadingIntakes ? (
                          <Skeleton className="h-4 w-full" />
                        ) : (
                          <SelectValue placeholder="Select an intake" />
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {intakes.map((intake) => (
                        <SelectItem key={intake.id} value={intake.id}>
                          {intake.name} (
                          {new Date(intake.startDate).toLocaleDateString()} -{" "}
                          {new Date(intake.endDate).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="programId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Program</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                  disabled={isLoadingPrograms}>
                  <FormControl>
                    <SelectTrigger className="rounded-lg">
                      {isLoadingPrograms ? (
                        <Skeleton className="h-4 w-full" />
                      ) : (
                        <SelectValue placeholder="Select a program" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {courseType === "short" && (
            <FormField
              control={form.control}
              name="shortCourseDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Duration</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || "3 months"}>
                    <FormControl>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="3 months">
                        3 Months (Intensive)
                      </SelectItem>
                      <SelectItem value="6 months">
                        6 Months (Comprehensive)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {form.formState.errors.root && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 hover:bg-blue-700">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save and Continue"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
