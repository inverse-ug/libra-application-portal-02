"use client";

import type { ReactNode } from "react";
import { CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ApplicationSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  isCompleted?: boolean;
  hasErrors?: boolean;
  isRequired?: boolean;
  isSubmitting?: boolean;
  className?: string;
}

export function ApplicationSection({
  title,
  description,
  children,
  isOpen,
  onToggle,
  isCompleted = false,
  hasErrors = false,
  isRequired = false,
  isSubmitting = false,
  className,
}: ApplicationSectionProps) {
  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <div
        className={cn(
          "flex items-center justify-between p-4 cursor-pointer bg-card transition-colors",
          isOpen && "border-b",
          isCompleted && !hasErrors && "bg-primary/5",
          hasErrors && "bg-destructive/5",
          isSubmitting && "opacity-70 pointer-events-none"
        )}
        onClick={onToggle}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {isCompleted && !hasErrors ? (
              <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            ) : hasErrors ? (
              <div className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
            ) : (
              <div className="h-6 w-6 rounded-full border border-muted-foreground/30" />
            )}
          </div>
          <div>
            <h3 className="font-medium flex items-center gap-2">
              {title}
              {isRequired && !isCompleted && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
              {isCompleted && (
                <Badge
                  variant="outline"
                  className="text-xs bg-green-500/10 text-green-600 border-green-200">
                  Completed
                </Badge>
              )}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </div>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
}
