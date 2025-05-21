"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface YearPickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
  className?: string;
}

export function YearPicker({
  value,
  onChange,
  placeholder = "Select year",
  minYear = 1950,
  maxYear = new Date().getFullYear() + 10,
  disabled = false,
  className,
}: YearPickerProps) {
  const [open, setOpen] = React.useState(false);

  // Initialize currentDecade only once when component mounts
  const [currentDecade, setCurrentDecade] = React.useState(() => {
    if (value && !isNaN(Number(value))) {
      const year = Number.parseInt(value);
      return Math.floor(year / 10) * 10;
    }
    return Math.floor(new Date().getFullYear() / 10) * 10;
  });

  // Update currentDecade when value changes, but with proper dependency check
  React.useEffect(() => {
    if (value && !isNaN(Number(value))) {
      const year = Number.parseInt(value);
      const yearDecade = Math.floor(year / 10) * 10;

      // Only update if the decade is different to avoid unnecessary state changes
      if (yearDecade !== currentDecade) {
        setCurrentDecade(yearDecade);
      }
    }
  }, [value]); // Don't include currentDecade as a dependency to avoid loop

  // Generate years for the current decade view
  const years = React.useMemo(() => {
    const result = [];
    const startYear = currentDecade;
    const endYear = currentDecade + 9;

    for (let year = startYear; year <= endYear; year++) {
      if (year >= minYear && year <= maxYear) {
        result.push(year);
      }
    }
    return result;
  }, [currentDecade, minYear, maxYear]);

  // Navigate to previous decade
  const handlePreviousDecade = React.useCallback(() => {
    setCurrentDecade((prevDecade) => prevDecade - 10);
  }, []);

  // Navigate to next decade
  const handleNextDecade = React.useCallback(() => {
    setCurrentDecade((prevDecade) => prevDecade + 10);
  }, []);

  // Handle year selection
  const handleYearSelect = React.useCallback(
    (year: number) => {
      onChange(year.toString());
      setOpen(false);
    },
    [onChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}>
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-2 space-y-2">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handlePreviousDecade}
              disabled={currentDecade <= minYear}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Decade</span>
            </Button>
            <div className="text-sm font-medium">
              {currentDecade} - {currentDecade + 9}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handleNextDecade}
              disabled={currentDecade + 10 > maxYear}>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Decade</span>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {years.map((year) => (
              <Button
                key={year}
                variant={value === year.toString() ? "default" : "outline"}
                className="h-8"
                onClick={() => handleYearSelect(year)}>
                {year}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
