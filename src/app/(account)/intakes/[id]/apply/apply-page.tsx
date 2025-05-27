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
import { Skeleton } from "@/components/ui/skeleton";
import { getIntakeById } from "@/app/actions/intake-actions";
import { createOrUpdateApplication } from "@/app/actions/application-actions";
import { AlertCircle, ArrowRight, Clock, CreditCard } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ApplyPage({ id }: { id: string }) {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const [intake, setIntake] = useState(null);
  const [programs, setPrograms] = useState([]);
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
          setSelectedProgram(intakeData.programs[0].id);
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

  const handleSubmit = async () => {
    if (!user?.id || !selectedProgram) {
      setError("Please select a program to continue.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const application = await createOrUpdateApplication(
        user.id,
        selectedProgram,
        {
          intakeId: id,
          isShortCourse: false,
        }
      );

      if (application) {
        router.push(`/apply/${application.id}`);
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

  if (isUserLoading || isLoading) {
    return (
      <div className="p-2 sm:p-6 max-w-4xl mx-auto">
        <Card className="rounded-xl shadow-md border-0">
          <CardHeader className="pb-2">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent className="pt-4">
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

  // Group programs by type for better organization
  const programsByType = programs.reduce((acc, program) => {
    if (!acc[program.type]) {
      acc[program.type] = [];
    }
    acc[program.type].push(program);
    return acc;
  }, {});

  const programTypes = Object.keys(programsByType);
  const defaultTabValue = programTypes.length > 0 ? programTypes[0] : "";

  return (
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

          {programTypes.length > 1 ? (
            <Tabs defaultValue={defaultTabValue} className="w-full">
              <TabsList className="mb-6 w-full justify-start space-x-2 bg-transparent p-0">
                {programTypes.map((type) => (
                  <TabsTrigger
                    key={type}
                    value={type}
                    className="rounded-md data-[state=active]:bg-primary/5 data-[state=active]:text-primary border">
                    {type}
                  </TabsTrigger>
                ))}
              </TabsList>

              {programTypes.map((type) => (
                <TabsContent key={type} value={type} className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {programsByType[type].map((program) => (
                      <div
                        key={program.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedProgram === program.id
                            ? "ring-2 ring-primary/95 bg-primary/5"
                            : "hover:border-primary/30"
                        }`}
                        onClick={() => setSelectedProgram(program.id)}>
                        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between mb-2">
                          <h3 className="text-lg font-medium">
                            {program.title}
                          </h3>
                          <div
                            className={`w-4 h-4 self-end sm:self-auto shrink-0 rounded-full ${
                              selectedProgram === program.id
                                ? "bg-primary/95"
                                : "border border-muted-foreground/90"
                            }`}></div>
                        </div>

                        {program.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {program.description}
                          </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {program.tuitionFee && (
                            <div className="flex items-center">
                              <CreditCard className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                              {formatCurrency(program.tuitionFee)}
                            </div>
                          )}
                          {program.duration && (
                            <div className="flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                              {program.duration}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedProgram === program.id
                      ? "ring-2 ring-primary/95 bg-primary/5"
                      : "hover:border-primary/30"
                  }`}
                  onClick={() => setSelectedProgram(program.id)}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">{program.title}</h3>
                    <div
                      className={`w-4 h-4 rounded-full ${
                        selectedProgram === program.id
                          ? "bg-primary/95"
                          : "border border-muted-foreground/90"
                      }`}></div>
                  </div>

                  {program.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {program.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {program.tuitionFee && (
                      <div className="flex items-center">
                        <CreditCard className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        {formatCurrency(program.tuitionFee)}
                      </div>
                    )}
                    {program.duration && (
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        {program.duration}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedProgram}
            className="px-6"
            size="lg">
            {isSubmitting ? "Processing..." : "Continue to Application"}
            {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
