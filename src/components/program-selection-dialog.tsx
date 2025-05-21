"use client";

import type React from "react";

import { useState } from "react";
import { Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Program } from "@/payload-types";

interface ProgramSelectionDialogProps {
  programs: Program[];
  selectedProgramId: string;
  onSelect: (programId: string) => void;
  trigger?: React.ReactNode;
}

export function ProgramSelectionDialog({
  programs,
  selectedProgramId,
  onSelect,
  trigger,
}: ProgramSelectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Ensure selectedProgramId is a string
  const safeSelectedId = String(selectedProgramId);

  const selectedProgram = programs.find((p) => String(p.id) === safeSelectedId);

  const filteredPrograms = programs.filter((program) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      program.name?.toLowerCase().includes(searchLower) ||
      program.category?.toLowerCase().includes(searchLower) ||
      `${program.duration?.value} ${program.duration?.unit}`
        .toLowerCase()
        .includes(searchLower)
    );
  });

  const handleSelect = (programId: string) => {
    onSelect(String(programId));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full justify-between">
            {selectedProgram ? (
              <span className="truncate">{selectedProgram.name}</span>
            ) : (
              <span className="text-muted-foreground">Select a program</span>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Program</DialogTitle>
          <DialogDescription>
            Choose the program you wish to apply for from the list below.
          </DialogDescription>
        </DialogHeader>

        <div className="relative my-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search programs..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[300px] rounded-md border p-2">
          {filteredPrograms.length === 0 ? (
            <div className="flex h-full items-center justify-center p-4 text-center">
              <p className="text-sm text-muted-foreground">
                No programs match your search criteria
              </p>
            </div>
          ) : (
            <div className="space-y-1 divide-y-1">
              {filteredPrograms.map((program) => (
                <Button
                  key={program.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left font-normal h-auto py-3",
                    String(program.id) === safeSelectedId && "bg-primary/5"
                  )}
                  onClick={() => handleSelect(String(program.id))}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col items-start">
                      <div className="flex items-center">
                        <span className="font-medium">{program.name}</span>
                        {/* {program.code && (
                          <Badge variant="outline" className="ml-2 text-xs">
                          {program.code}
                          </Badge>
                        )} */}
                      </div>
                      {(program.category || program.duration) && (
                        <span className="text-xs text-muted-foreground mt-1">
                          {program.category}
                          {program.category && program.duration && " • "}
                          {program.duration?.value} {program.duration?.unit}
                        </span>
                      )}
                    </div>
                    {String(program.id) === safeSelectedId && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
