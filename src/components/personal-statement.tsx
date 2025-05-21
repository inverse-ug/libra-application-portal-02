"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonalStatementProps {
  scheme: any;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PersonalStatement({
  scheme,
  value,
  onChange,
  className,
}: PersonalStatementProps) {
  const [wordCount, setWordCount] = useState(0);

  // Get personal statement requirements from scheme
  const statementConfig = scheme?.schemeFields?.stmt || {};
  const reqStmt = statementConfig?.reqStmt !== "no";
  const isRequired = statementConfig?.reqStmt === "req";
  const prompt =
    statementConfig?.stmtPrompt ||
    "Explain your motivation for applying, your career goals, and how this program will help you achieve them.";
  const minWords = statementConfig?.stmtMinWords || 0;
  const maxWords = statementConfig?.stmtMaxWords || 500;

  // Calculate word count
  useEffect(() => {
    if (!value) {
      setWordCount(0);
      return;
    }

    const words = value.trim().split(/\s+/);
    setWordCount(words.length);
  }, [value]);

  // Check if word count is within limits
  const isUnderMinWords = isRequired && minWords > 0 && wordCount < minWords;
  const isOverMaxWords = maxWords > 0 && wordCount > maxWords;

  if (!reqStmt) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Personal Statement</span>
          {isRequired ? (
            <Badge variant="destructive">Required</Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              Optional
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{prompt}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <label htmlFor="personal-statement" className="text-sm font-medium">
            Your Statement{" "}
            {isRequired && <span className="text-destructive">*</span>}
          </label>
          <Textarea
            id="personal-statement"
            placeholder="Write your personal statement here..."
            className="min-h-[200px] resize-y"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-muted-foreground",
                isUnderMinWords && "text-amber-500",
                isOverMaxWords && "text-destructive"
              )}>
              {wordCount} words
            </span>

            {minWords > 0 && (
              <span className="text-muted-foreground">(Min: {minWords})</span>
            )}

            {maxWords > 0 && (
              <span className="text-muted-foreground">(Max: {maxWords})</span>
            )}
          </div>

          {(isUnderMinWords || isOverMaxWords) && (
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs",
                isUnderMinWords && "text-amber-500",
                isOverMaxWords && "text-destructive"
              )}>
              {isUnderMinWords ? (
                <>
                  <Info className="h-3.5 w-3.5" />
                  <span>Please write at least {minWords} words</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Exceeds maximum of {maxWords} words</span>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
