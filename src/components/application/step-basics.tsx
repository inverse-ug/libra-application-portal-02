"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Loader2,
  BookOpen,
  CalendarClock,
  ChevronDown,
  Calendar,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getIntakes,
  getPrograms,
  getShortCourses,
} from "@/app/actions/program-actions";
import { createOrUpdateApplication } from "@/app/actions/application-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { toast } from "sonner";

const basicsSchema = z
  .object({
    courseType: z.enum(["long", "short"], {
      required_error: "Please select a course type",
    }),
    intakeId: z.string().optional().nullable(),
    programId: z.string().min(1, "Please select a program"),
  })
  .refine(
    (data) => {
      // If it's a long course, intake is required
      if (data.courseType === "long") {
        return data.intakeId && data.intakeId.length > 0;
      }
      return true;
    },
    {
      message: "Please select an intake for long courses",
      path: ["intakeId"],
    }
  );

type BasicsValues = z.infer<typeof basicsSchema>;

interface ApplicationStepBasicsProps {
  application: any;
  onComplete: (createdApplication?: any) => void;
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
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data states
  const [intakes, setIntakes] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);

  // Loading states
  const [isLoadingIntakes, setIsLoadingIntakes] = useState(false);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);

  // Modal states
  const [intakeModalOpen, setIntakeModalOpen] = useState(false);
  const [programModalOpen, setProgramModalOpen] = useState(false);

  const [previousSelections, setPreviousSelections] = useState({
    long: {
      intakeId: preselectedIntakeId || application?.intakeId || "",
      programId: preselectedProgramId || application?.programId || "",
    },
    short: {
      programId: preselectedProgramId || application?.programId || "",
    },
  });

  // Initialize form with existing application data or preselected values
  const form = useForm<BasicsValues>({
    resolver: zodResolver(basicsSchema),
    defaultValues: {
      courseType:
        preselectedCourseType ||
        (application?.isShortCourse ? "short" : "long"),
      intakeId: preselectedIntakeId || application?.intakeId || "",
      programId: preselectedProgramId || application?.programId || "",
    },
  });

  const courseType = form.watch("courseType");
  const selectedIntakeId = form.watch("intakeId");
  const selectedProgramId = form.watch("programId");

  // Get selected items for display
  const selectedIntake = intakes.find(
    (intake) => intake.id === selectedIntakeId
  );
  const selectedProgram = programs.find(
    (program) => program.id === selectedProgramId
  );

  // Handle preselected values on mount
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

  // Fetch intakes function
  const fetchIntakes = useCallback(async () => {
    try {
      setIsLoadingIntakes(true);
      const data = await getIntakes({ isActive: true });
      setIntakes(data);
    } catch (error) {
      console.error("Error fetching intakes:", error);
      toast.error("Failed to load intakes. Please try again.");
      setIntakes([]);
    } finally {
      setIsLoadingIntakes(false);
    }
  }, []);

  // Fetch programs function
  const fetchPrograms = useCallback(
    async (intakeId?: string) => {
      try {
        setIsLoadingPrograms(true);
        let data;

        if (courseType === "short") {
          data = await getShortCourses();
        } else if (courseType === "long") {
          data = intakeId
            ? await getPrograms({ intakeId })
            : await getPrograms();
        }

        setPrograms(data || []);
      } catch (error) {
        console.error("Error fetching programs:", error);
        toast.error("Failed to load programs. Please try again.");
        setPrograms([]);
      } finally {
        setIsLoadingPrograms(false);
      }
    },
    [courseType]
  );

  // Load existing data if we have selected items
  useEffect(() => {
    // Load intakes if we have a selected intake or if course type is long
    if (
      (selectedIntakeId && intakes.length === 0) ||
      (courseType === "long" && intakes.length === 0)
    ) {
      fetchIntakes();
    }
  }, [selectedIntakeId, courseType, intakes.length, fetchIntakes]);

  useEffect(() => {
    // Load programs if we have a selected program
    if (selectedProgramId && programs.length === 0) {
      fetchPrograms(selectedIntakeId);
    }
  }, [selectedProgramId, programs.length, selectedIntakeId, fetchPrograms]);

  // Simple course type change handler
  const handleCourseTypeChange = (value: "long" | "short") => {
    console.log("Course type changed to:", value);

    // Store current selections before switching
    const currentCourseType = form.getValues("courseType");
    const currentIntakeId = form.getValues("intakeId");
    const currentProgramId = form.getValues("programId");

    // Save current selections to previousSelections
    if (currentCourseType === "long") {
      setPreviousSelections((prev) => ({
        ...prev,
        long: {
          intakeId: currentIntakeId || "",
          programId: currentProgramId || "",
        },
      }));
    } else if (currentCourseType === "short") {
      setPreviousSelections((prev) => ({
        ...prev,
        short: {
          programId: currentProgramId || "",
        },
      }));
    }

    // Set the new course type
    form.setValue("courseType", value);

    // Restore previous selections for the target course type
    if (value === "long") {
      // Restore long course selections
      const longSelections = previousSelections.long;
      form.setValue("intakeId", longSelections.intakeId);
      form.setValue("programId", longSelections.programId);

      // Clear errors
      form.clearErrors("intakeId");
      form.clearErrors("programId");

      // Load data if we have selections but no data loaded
      if (longSelections.intakeId && intakes.length === 0) {
        fetchIntakes();
      }
      if (longSelections.programId && programs.length === 0) {
        fetchPrograms(longSelections.intakeId);
      }
    } else if (value === "short") {
      // For short courses, clear intakeId and restore short course program
      form.setValue("intakeId", "");
      form.setValue("programId", previousSelections.short.programId);

      // Clear errors
      form.clearErrors("intakeId");
      form.clearErrors("programId");

      // Load short courses if we have a selection but no data loaded
      if (previousSelections.short.programId && programs.length === 0) {
        fetchPrograms();
      } else if (!previousSelections.short.programId) {
        // Clear programs when switching to short course with no previous selection
        setPrograms([]);
      }
    }
  };

  // Handle intake modal open
  const handleIntakeModalOpen = (open: boolean) => {
    if (open && intakes.length === 0) {
      fetchIntakes();
    }
    setIntakeModalOpen(open);
  };

  // Handle program modal open
  const handleProgramModalOpen = (open: boolean) => {
    if (open && programs.length === 0) {
      fetchPrograms(courseType === "long" ? selectedIntakeId : undefined);
    }
    setProgramModalOpen(open);
  };

  const handleIntakeSelect = (intakeId: string) => {
    form.setValue("intakeId", intakeId);
    form.clearErrors("intakeId");
    setIntakeModalOpen(false);

    // Update previous selections
    setPreviousSelections((prev) => ({
      ...prev,
      long: {
        ...prev.long,
        intakeId: intakeId,
      },
    }));

    // Clear programs when intake changes
    setPrograms([]);
    form.setValue("programId", "");

    // Clear the long course program selection since intake changed
    setPreviousSelections((prev) => ({
      ...prev,
      long: {
        ...prev.long,
        programId: "",
      },
    }));
  };

  const handleProgramSelect = (programId: string) => {
    form.setValue("programId", programId);
    form.clearErrors("programId");
    setProgramModalOpen(false);

    // Update previous selections based on current course type
    const currentCourseType = form.getValues("courseType");
    if (currentCourseType === "long") {
      setPreviousSelections((prev) => ({
        ...prev,
        long: {
          ...prev.long,
          programId: programId,
        },
      }));
    } else {
      setPreviousSelections((prev) => ({
        ...prev,
        short: {
          programId: programId,
        },
      }));
    }
  };

  async function onSubmit(data: BasicsValues) {
    try {
      setIsSubmitting(true);

      if (!user?.id) {
        toast.error("You must be logged in to create an application.");
        return;
      }

      let currentApplication = application;

      // If no application exists, create one first
      if (!application?.id) {
        currentApplication = await createOrUpdateApplication(
          user.id,
          data.programId,
          {
            intakeId: data.courseType === "long" ? data.intakeId : null,
            isShortCourse: data.courseType === "short",
          }
        );
      }

      toast.success("Application basics saved successfully!");

      // Pass the created/updated application back to parent
      onComplete(
        currentApplication?.id !== application?.id
          ? currentApplication
          : undefined
      );
    } catch (error) {
      console.error("Error saving application basics:", error);
      toast.error("Failed to save application basics. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      <div className="px-4 sm:px-0">
        <h2 className="text-lg sm:text-xl font-semibold mb-2">
          Application Basics
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Please select the type of course you want to apply for and choose your
          preferred program.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 sm:space-y-8">
          <div className="px-4 sm:px-0">
            <FormField
              control={form.control}
              name="courseType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-medium">
                    Course Type *
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={handleCourseTypeChange}
                      value={field.value}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <Label htmlFor="long-course" className="cursor-pointer">
                        <Card
                          className={`rounded-lg min-w-sm cursor-pointer transition-all hover:shadow-sm ${
                            field.value === "long"
                              ? "border-blue-300 dark:border-blue-700 shadow-sm bg-blue-50/50 dark:bg-blue-950/20"
                              : ""
                          } border`}>
                          <CardContent className="p-4 sm:pt-6">
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem
                                value="long"
                                id="long-course"
                                className="sr-only"
                              />
                              <div className="flex items-center gap-3 w-full">
                                {field.value === "long" && (
                                  <div className="h-4 w-4 rounded-full bg-blue-600 dark:bg-blue-400 flex items-center justify-center flex-shrink-0">
                                    <div className="h-2 w-2 rounded-full bg-white"></div>
                                  </div>
                                )}
                                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                                  <CalendarClock className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-sm sm:text-base">
                                    Long Course
                                  </div>
                                  <div className="text-xs sm:text-sm text-muted-foreground break-words">
                                    Certificate Program
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Label>

                      <Label htmlFor="short-course" className="cursor-pointer">
                        <Card
                          className={`rounded-lg min-w-sm cursor-pointer transition-all hover:shadow-sm ${
                            field.value === "short"
                              ? "border-amber-300 dark:border-amber-700 shadow-sm bg-amber-50/50 dark:bg-amber-950/20"
                              : ""
                          } border`}>
                          <CardContent className="p-4 sm:pt-6">
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem
                                value="short"
                                id="short-course"
                                className="sr-only"
                              />
                              <div className="flex items-center gap-3 w-full">
                                {field.value === "short" && (
                                  <div className="h-4 w-4 rounded-full bg-amber-600 dark:bg-amber-400 flex items-center justify-center flex-shrink-0">
                                    <div className="h-2 w-2 rounded-full bg-white"></div>
                                  </div>
                                )}
                                <div className="h-8 w-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                                  <BookOpen className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-sm sm:text-base">
                                    Short Course
                                  </div>
                                  <div className="text-xs sm:text-sm text-muted-foreground break-words">
                                    3-6 Month Specialized Training
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {courseType === "long" && (
            <div className="px-4 sm:px-0">
              <FormField
                control={form.control}
                name="intakeId"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Select Intake *
                    </FormLabel>
                    <Dialog
                      open={intakeModalOpen}
                      onOpenChange={handleIntakeModalOpen}>
                      <DialogTrigger asChild>
                        <Card className="cursor-pointer shadow-none transition-all border-1 hover:border-blue-200 dark:hover:border-blue-800">
                          <CardContent className="p-4">
                            {selectedIntake ? (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-sm line-clamp-2">
                                      {selectedIntake.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(
                                        selectedIntake.startDate
                                      ).toLocaleDateString()}{" "}
                                      -{" "}
                                      {new Date(
                                        selectedIntake.endDate
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Calendar className="h-5 w-5 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    Select an intake
                                  </span>
                                </div>
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg w-[90vw] max-h-[98vh]">
                        <DialogHeader>
                          <DialogTitle>Select Intake</DialogTitle>
                          <DialogDescription>
                            Choose your preferred intake period
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[70vh] sm:max-h-[80vh] pr-4">
                          {isLoadingIntakes ? (
                            <div className="space-y-2">
                              {[1, 2, 3].map((i) => (
                                <Card key={i} className="p-3">
                                  <div className="flex items-center gap-3">
                                    <Skeleton className="h-4 w-4" />
                                    <div className="flex-1">
                                      <Skeleton className="h-4 w-3/4 mb-2" />
                                      <Skeleton className="h-3 w-1/2" />
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          ) : intakes.length === 0 ? (
                            <div className="text-center py-8">
                              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                              <p className="text-sm text-muted-foreground">
                                No active intakes are currently available.
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Please check back later or contact support.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {intakes.map((intake) => (
                                <Card
                                  key={intake.id}
                                  className={`cursor-pointer transition-all shadow-none ${
                                    selectedIntakeId === intake.id
                                      ? "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20"
                                      : "hover:border-gray-300"
                                  }`}
                                  onClick={() => handleIntakeSelect(intake.id)}>
                                  <CardContent className="p-3">
                                    <div className="flex items-center gap-3">
                                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <div className="font-medium text-sm">
                                          {intake.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {new Date(
                                            intake.startDate
                                          ).toLocaleDateString()}{" "}
                                          -{" "}
                                          {new Date(
                                            intake.endDate
                                          ).toLocaleDateString()}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="px-4 sm:px-0">
            <FormField
              control={form.control}
              name="programId"
              render={() => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Select Program *
                  </FormLabel>
                  {courseType === "long" && !selectedIntakeId && (
                    <Alert variant="default" className="mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Please select an intake first to view available
                        programs.
                      </AlertDescription>
                    </Alert>
                  )}
                  <Dialog
                    open={programModalOpen}
                    onOpenChange={handleProgramModalOpen}>
                    <DialogTrigger
                      asChild
                      disabled={courseType === "long" && !selectedIntakeId}>
                      <Card
                        className={`transition-all border-1 shadow-none ${
                          courseType === "long" && !selectedIntakeId
                            ? "opacity-60 cursor-not-allowed"
                            : "cursor-pointer hover:border-green-200 dark:hover:border-green-800"
                        }`}
                        onClick={(e) => {
                          if (courseType === "long" && !selectedIntakeId) {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                        }}>
                        <CardContent className="p-4">
                          {selectedProgram ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-sm line-clamp-2">
                                    {selectedProgram.title}
                                  </div>
                                  {selectedProgram.code && (
                                    <div className="text-xs text-muted-foreground">
                                      Code: {selectedProgram.code}
                                    </div>
                                  )}
                                  {selectedProgram.duration && (
                                    <div className="text-xs text-muted-foreground">
                                      Duration: {selectedProgram.duration}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Select a program
                                </span>
                              </div>
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg w-[90vw] max-h-[98vh]">
                      <DialogHeader>
                        <DialogTitle>Select Program</DialogTitle>
                        <DialogDescription>
                          Choose your preferred{" "}
                          {courseType === "short" ? "short course" : "program"}
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[70vh] sm:max-h-[80vh] pr-4">
                        {isLoadingPrograms ? (
                          <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                              <Card key={i} className="p-3">
                                <div className="flex items-start gap-3">
                                  <div className="flex-1">
                                    <Skeleton className="h-4 w-3/4 mb-2" />
                                    <Skeleton className="h-3 w-1/2 mb-1" />
                                    <Skeleton className="h-3 w-2/3" />
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : programs.length === 0 ? (
                          <div className="text-center py-8">
                            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground">
                              No{" "}
                              {courseType === "short"
                                ? "short courses"
                                : "programs"}{" "}
                              are currently available
                              {courseType === "long" && selectedIntakeId
                                ? " for the selected intake"
                                : ""}
                              .
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Please check back later or contact support.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {programs.map((program) => (
                              <Card
                                key={program.id}
                                className={`cursor-pointer transition-all shadow-none ${
                                  selectedProgramId === program.id
                                    ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20"
                                    : "hover:border-primary/30"
                                }`}
                                onClick={() => handleProgramSelect(program.id)}>
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-3">
                                    <div className="min-w-0 flex-1">
                                      <div className="font-medium text-sm mb-1">
                                        {program.title}
                                      </div>
                                      {program.code && (
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Code: {program.code}
                                        </div>
                                      )}
                                      {program.duration && (
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Duration: {program.duration}
                                        </div>
                                      )}
                                      {program.categories &&
                                        program.categories.length > 0 && (
                                          <div className="text-xs text-muted-foreground">
                                            {program.categories
                                              .map((cat: any) => cat.name)
                                              .join(", ")}
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="px-4 sm:px-0">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto rounded-lg min-h-[44px]">
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Saving..." : "Save and Continue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
