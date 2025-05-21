"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { seedDatabase } from "@/app/actions/seed-data";
import { AlertCircle, CheckCircle2, Database } from "lucide-react";

export default function SeedDatabasePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    error?: string;
  } | null>(null);

  const handleSeedDatabase = async () => {
    try {
      setIsLoading(true);
      setResult(null);
      const seedResult = await seedDatabase();
      setResult(seedResult);
    } catch (error) {
      console.error("Error seeding database:", error);
      setResult({
        success: false,
        message: "An unexpected error occurred",
        error: String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Seed Database</CardTitle>
          <CardDescription>
            This will populate your database with sample data for testing
            purposes. This includes programs, categories, intakes, and
            announcements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-400 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Warning</h3>
                  <p className="text-sm mt-1">
                    This action will add sample data to your database. If
                    records with the same IDs already exist, they will be
                    updated with the sample data. This is intended for testing
                    purposes only.
                  </p>
                </div>
              </div>
            </div>

            {result && (
              <Alert
                variant={result.success ? "default" : "destructive"}
                className={
                  result.success
                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-800 dark:text-green-400"
                    : undefined
                }>
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>
                  {result.message}
                  {result.error && (
                    <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/20 rounded text-sm overflow-auto">
                      {result.error}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSeedDatabase}
            disabled={isLoading}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-700">
            {isLoading ? (
              "Seeding Database..."
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" /> Seed Database
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
