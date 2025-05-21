"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addEducationHistory } from "@/app/actions/application-actions"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const educationRecordSchema = z.object({
  institutionName: z.string().min(2, { message: "Institution name is required" }),
  startYear: z.coerce
    .number()
    .min(1950, { message: "Start year must be 1950 or later" })
    .max(new Date().getFullYear(), { message: "Start year cannot be in the future" }),
  endYear: z.coerce
    .number()
    .min(1950, { message: "End year must be 1950 or later" })
    .max(new Date().getFullYear(), { message: "End year cannot be in the future" })
    .optional()
    .nullable(),
  qualification: z.string().min(2, { message: "Qualification is required" }),
})

const educationSchema = z.object({
  records: z.array(educationRecordSchema).min(1, { message: "At least one education record is required" }),
})

type EducationValues = z.infer<typeof educationSchema>

interface ApplicationStepEducationProps {
  application: any
  user: any
  onComplete: () => void
}

export function ApplicationStepEducation({ application, user, onComplete }: ApplicationStepEducationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get existing education history from user
  const existingEducation = user?.educationHistory || []

  const form = useForm<EducationValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      records:
        existingEducation.length > 0
          ? existingEducation.map((record: any) => ({
              institutionName: record.institutionName,
              startYear: record.startYear,
              endYear: record.endYear,
              qualification: record.qualification,
            }))
          : [{ institutionName: "", startYear: undefined, endYear: undefined, qualification: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "records",
  })

  async function onSubmit(data: EducationValues) {
    try {
      setIsSubmitting(true)
      await addEducationHistory(application.id, user.id, data)
      onComplete()
    } catch (error) {
      console.error("Error updating education information:", error)
      form.setError("root", {
        type: "manual",
        message: "Failed to save education information. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const qualificationOptions = [
    "PLE",
    "UCE",
    "UACE",
    "Certificate",
    "Diploma",
    "Bachelor's Degree",
    "Master's Degree",
    "PhD",
    "Other",
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Educational Background</h2>
        <p className="text-muted-foreground">
          Please provide details of your educational background, including primary, secondary schools, colleges, and
          universities attended.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="rounded-lg overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Education Record {index + 1}</h3>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name={`records.${index}.institutionName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institution Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter institution name" {...field} className="rounded-lg" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`records.${index}.qualification`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qualification Obtained</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-lg">
                                <SelectValue placeholder="Select qualification" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {qualificationOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`records.${index}.startYear`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Year</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter start year"
                              {...field}
                              className="rounded-lg"
                              min={1950}
                              max={new Date().getFullYear()}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`records.${index}.endYear`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Year (or Expected)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter end year"
                              {...field}
                              className="rounded-lg"
                              min={1950}
                              max={new Date().getFullYear()}
                              value={field.value || ""}
                              onChange={(e) => {
                                const value = e.target.value ? Number.parseInt(e.target.value) : null
                                field.onChange(value)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ institutionName: "", startYear: undefined, endYear: undefined, qualification: "" })}
            className="rounded-lg"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Another Education Record
          </Button>

          {form.formState.errors.root && (
            <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-600 hover:bg-blue-700">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save and Continue"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
