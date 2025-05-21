"use client";

import { useCallback, useState, useEffect } from "react";
import { FileDown, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useFileUpload, formatBytes } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";
import { RiFileAddLine } from "@remixicon/react";

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  onFilesChange?: (files: any[]) => void;
  description?: string;
  showPreview?: boolean;
  allowDescription?: boolean;
}

export function FileUpload({
  accept = "application/pdf,image/jpeg,image/png",
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 10,
  multiple = true,
  disabled = false,
  className,
  onFilesChange,
  description = "Drag & drop or click to select files (PDF, JPG, PNG, max 5MB)",
  showPreview = true,
  allowDescription = true,
}: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );

  const [
    { files, isDragging, errors },
    {
      addFiles,
      removeFile,
      clearErrors,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      getInputProps,
      openFileDialog,
    },
  ] = useFileUpload({
    maxFiles,
    maxSize,
    accept,
    multiple,
    onFilesChange,
  });

  const updateDocumentDescription = useCallback(
    (id: string, description: string) => {
      const updatedFiles = files.map((file) =>
        file.id === id ? { ...file, description } : file
      );
      onFilesChange?.(updatedFiles);
    },
    [files, onFilesChange]
  );

  // Simulate upload progress for demo purposes
  const simulateUploadProgress = useCallback((id: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress((prev) => ({ ...prev, [id]: progress }));
    }, 200);
  }, []);

  // Use useEffect to start simulating upload progress when new files appear
  useEffect(() => {
    files.forEach((file) => {
      if (!uploadProgress[file.id] && file.file instanceof File) {
        simulateUploadProgress(file.id);
      }
    });
  }, [files, uploadProgress, simulateUploadProgress]);

  return (
    <div className={cn("space-y-4", className)}>
      {errors.length > 0 && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error uploading files</p>
            <ul className="list-disc list-inside mt-1.5 space-y-1">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-destructive mt-1.5"
              onClick={clearErrors}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <div
        className={cn(
          "border-2 border-dashed rounded-lg transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
          disabled &&
            "opacity-50 cursor-not-allowed border-muted-foreground/20 hover:border-muted-foreground/20",
          "relative"
        )}
        onDragEnter={!disabled ? handleDragEnter : undefined}
        onDragLeave={!disabled ? handleDragLeave : undefined}
        onDragOver={!disabled ? handleDragOver : undefined}
        onDrop={!disabled ? handleDrop : undefined}>
        <input {...getInputProps({ disabled })} className="sr-only" />

        <div className="flex flex-col items-center justify-center p-6 text-center">
          <RiFileAddLine className="h-10 w-10 text-muted-foreground mb-2" />
          <h3 className="font-medium text-lg mb-1">Upload Documents</h3>
          <p className="text-sm text-muted-foreground mb-2">{description}</p>

          <div className="flex flex-wrap gap-2 mt-2">
            {accept.split(",").map((type) => (
              <Badge key={type} variant="outline" className="text-xs">
                {type.includes("pdf")
                  ? "PDF"
                  : type.includes("jpeg") || type.includes("jpg")
                    ? "JPG"
                    : type.includes("png")
                      ? "PNG"
                      : type}
              </Badge>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={openFileDialog}
            disabled={disabled}>
            Select Files
          </Button>
        </div>
      </div>

      {showPreview && files.length > 0 && (
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">
              Uploaded Files ({files.length})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground hover:text-destructive"
              onClick={() => files.forEach((file) => removeFile(file.id))}
              disabled={disabled}>
              Remove All
            </Button>
          </div>

          <div className="space-y-3">
            {files.map((file) => {
              const isImage =
                file.file instanceof File
                  ? file.file.type.startsWith("image/")
                  : typeof file.file === "object" && file.file.type
                    ? file.file.type.startsWith("image/")
                    : false;

              const isPdf =
                file.file instanceof File
                  ? file.file.type === "application/pdf"
                  : typeof file.file === "object" && file.file.type
                    ? file.file.type === "application/pdf"
                    : false;

              const progress = uploadProgress[file.id] || 0;
              const isUploading = progress > 0 && progress < 100;

              const fileName =
                file.file instanceof File
                  ? file.file.name
                  : typeof file.file === "object" && file.file.name
                    ? file.file.name
                    : "Unknown file";

              const fileSize =
                file.file instanceof File
                  ? file.file.size
                  : typeof file.file === "object" && file.file.size
                    ? file.file.size
                    : 0;

              return (
                <div
                  key={file.id}
                  className="flex flex-col sm:flex-row items-start gap-3 p-3 border rounded-md bg-background">
                  <div className="flex-shrink-0 h-14 w-14 rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                    {isImage && file.preview ? (
                      <img
                        src={file.preview || "/placeholder.svg"}
                        alt={fileName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FileDown className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 w-full mt-3 sm:mt-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm truncate">
                          {fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(fileSize)}
                          {isPdf && " • PDF"}
                          {isImage && " • Image"}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFile(file.id)}
                        disabled={disabled}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>

                    {isUploading && (
                      <div className="mt-2 space-y-1">
                        <Progress value={progress} className="h-1.5" />
                        <p className="text-xs text-muted-foreground">
                          {progress.toFixed(0)}% uploaded
                        </p>
                      </div>
                    )}

                    {allowDescription && (
                      <Input
                        placeholder="Add description (optional)"
                        className="mt-2 text-sm"
                        value={(file as any).description || ""}
                        onChange={(e) =>
                          updateDocumentDescription(file.id, e.target.value)
                        }
                        disabled={disabled || isUploading}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
