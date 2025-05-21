"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { BookOpen, Clock, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ProgramCardProps {
  program: any;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg">{program.title}</h3>
          <Badge
            variant="outline"
            className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 rounded-md">
            {program.type}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {program.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {program.categories?.map((category: any) => (
            <Badge key={category.id} variant="secondary" className="rounded-md">
              {category.name}
            </Badge>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium">Duration:</span> {program.duration}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => setShowDetails(true)}>
            View Details
          </Button>
        </div>
      </div>

      {/* Program Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-3xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="h-6 w-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-md flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BookOpen className="h-4 w-4" />
              </div>
              {program.title}
            </DialogTitle>
            <DialogDescription>
              {program.type} Program • {program.duration}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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

            <p className="text-muted-foreground">{program.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
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
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Requirements</h3>
              <p className="text-muted-foreground">{program.requirements}</p>
            </div>

            {program.intakes && program.intakes.length > 0 && (
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Available Intakes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {program.intakes.map((intake: any) => (
                    <div key={intake.id} className="border rounded-lg p-3">
                      <div className="font-medium">{intake.name}</div>
                      <p className="text-sm text-muted-foreground">
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
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                className="rounded-lg"
                onClick={() => setShowDetails(false)}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>

              <Button
                className="rounded-lg bg-indigo-600 hover:bg-indigo-700"
                asChild>
                <Link href={`/programs/${program.id}/apply`}>Apply Now</Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
