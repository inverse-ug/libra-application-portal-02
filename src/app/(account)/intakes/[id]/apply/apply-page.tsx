"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { getIntakeById } from "@/app/actions/intake-actions";
import { createOrUpdateApplication } from "@/app/actions/application-actions";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  AlignLeft,
  GraduationCap,
  Search,
  Loader,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";

export default function ApplyPage({ id }: { id: string }) {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [intake, setIntake] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showShortCourseOnly, setShowShortCourseOnly] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const intakeData = await getIntakeById(id);
        setIntake(intakeData);

        if (intakeData?.programs && intakeData.programs.length > 0) {
          setPrograms(intakeData.programs);
          // setSelectedProgram(intakeData.programs[0].id);

          // Extract unique categories from all programs
          const allCategories = new Map();
          intakeData.programs.forEach((program) => {
            program.categories?.forEach((category) => {
              allCategories.set(category.id, category);
            });
          });
          setCategories(Array.from(allCategories.values()));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load intake information. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async () => {
    if (!user?.id || !selectedProgram) {
      setError("Please select a program to continue.");
      return;
    }

    const selectedProgramData = programs.find((p) => p.id === selectedProgram);

    try {
      setIsSubmitting(true);
      setError(null);

      const application = await createOrUpdateApplication(
        user.id,
        selectedProgram,
        {
          intakeId: id,
          isShortCourse: selectedProgramData?.isShortCourse || false,
        }
      );

      if (application) {
        router.push(`/apply/${application.id}`);
        document.dispatchEvent(new Event("startNavigation"));
      } else {
        setError("Failed to create application. Please try again.");
      }
    } catch (error) {
      console.error("Error creating application:", error);
      setError(
        "An error occurred while creating your application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter programs based on selected categories and short course filter
  const filteredPrograms = programs.filter((program) => {
    // Filter by categories
    const matchesCategory =
      selectedCategories.length === 0 ||
      program.categories?.some((category) =>
        selectedCategories.includes(category.id)
      );

    // Filter by short course
    const matchesShortCourse =
      !showShortCourseOnly || program.hasShortCourse || program.isShortCourse;

    return matchesCategory && matchesShortCourse;
  });

  const hasActiveFilters = selectedCategories.length > 0 || showShortCourseOnly;

  const clearFilters = () => {
    setSelectedCategories([]);
    setShowShortCourseOnly(false);
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="p-2 sm:p-6 max-w-4xl mx-auto">
        <Card className="rounded-xl shadow-md border-0">
          <CardHeader className="pb-2">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-6">
              <Skeleton className="h-6 w-32 mb-3" />
              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20 rounded-full" />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-40" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!intake) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert variant="destructive" className="rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            The intake you are looking for does not exist or has been removed.
            Please go back and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="p-2 sm:p-6 max-w-4xl mx-auto">
        <Card className="rounded-xl shadow-md border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold">
              Apply for {intake.name}
            </CardTitle>
            <CardDescription className="text-base mt-1">
              Application fee:{" "}
              <span className="font-medium">
                {formatCurrency(intake.applicationFee)}
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Filters Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlignLeft className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter Programs</span>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground">
                    Clear all
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Short Course Filter */}
                <Toggle
                  pressed={showShortCourseOnly}
                  onPressedChange={setShowShortCourseOnly}
                  variant="outline"
                  size="sm"
                  className="px-3 text-xs">
                  <GraduationCap className="h-3 w-3 mr-1.5" />
                  Short Courses
                </Toggle>

                {/* Category Filters */}
                {categories.map((category) => (
                  <Toggle
                    key={category.id}
                    pressed={selectedCategories.includes(category.id)}
                    onPressedChange={() => handleCategoryToggle(category.id)}
                    variant="outline"
                    size="sm"
                    className="px-3 text-xs">
                    {category.code}
                  </Toggle>
                ))}
              </div>
            </div>

            {/* Programs Grid */}
            {filteredPrograms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-24">
                {filteredPrograms.map((program) => (
                  <div
                    key={program.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedProgram === program.id
                        ? "ring-2 ring-primary/95 bg-primary/5"
                        : "hover:border-primary/30"
                    }`}
                    onClick={() => setSelectedProgram(program.id)}>
                    <div className="flex flex-col-reverse mb-2 gap-2">
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm font-medium flex-1">
                          {program.title} ({program.code})
                        </h3>
                      </div>
                      <div
                        className={`w-4 h-4 self-end shrink-0 rounded-full ${
                          selectedProgram === program.id
                            ? "bg-primary/95"
                            : "border border-muted-foreground/90"
                        }`}></div>
                    </div>

                    {program.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {program.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-1">
                      {program.categories.map((category) => (
                        <Badge
                          key={category.id}
                          variant="outline"
                          className="text-xs">
                          {category.code}
                        </Badge>
                      ))}
                      {program.duration && (
                        <Badge className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1.5 text-primary-foreground" />
                          {program.isShortCourse
                            ? `${program.shortCourseDurationMonths} months`
                            : program.duration}
                        </Badge>
                      )}
                    </div>

                    {/* Short Course Details */}
                    {program.categories && program.categories.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {program.hasShortCourse && (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 text-xs">
                            Short Course
                          </Badge>
                        )}
                        {program.hasShortCourse && (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 text-xs">
                            {program.shortCourseDurationMonths} Months
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No programs found</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  {hasActiveFilters
                    ? "No programs match your current filter selection. Try adjusting your filters to see more results."
                    : "There are no programs available for this intake at the moment."}
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mx-auto">
                    Clear all filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sticky Continue Button - Only show when a program is selected */}
      {selectedProgram && filteredPrograms.length > 0 && (
        <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t shadow-lg z-50">
          <div className="p-4 max-w-xl mx-auto">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full px-6 cursor-pointer"
              size="lg">
              {isSubmitting && <Loader className="animate-spin" />}
              {isSubmitting ? "Processing..." : "Continue to Application"}
              {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
