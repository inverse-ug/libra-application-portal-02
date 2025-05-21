"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateContactInfo } from "@/app/actions/application-actions"
import { Loader2 } from "lucide-react"

const contactInfoSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  alternativeEmail: z.string().email({ message: "Please enter a valid email address" }).optional().or(z.literal("")),
  alternativePhone: z.string().optional().or(z.literal("")),
  postalAddress: z.string().optional().or(z.literal("")),
  physicalAddress: z.string().min(5, { message: "Physical address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  district: z.string().optional().or(z.literal("")),
  country: z.string().min(2, { message: "Country is required" }),
  emergencyContactName: z.string().min(2, { message: "Emergency contact name is required" }),
  emergencyContactRelationship: z.string().min(2, { message: "Relationship is required" }),
  emergencyContactPhone: z.string().min(10, { message: "Emergency contact phone is required" }),
  emergencyContactEmail: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .optional()
    .or(z.literal("")),
  emergencyContactAddress: z.string().optional().or(z.literal("")),
})

type ContactInfoValues = z.infer<typeof contactInfoSchema>

interface ApplicationStepContactProps {
  application: any
  user: any
  onComplete: () => void
}

export function ApplicationStepContact({ application, user, onComplete }: ApplicationStepContactProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ContactInfoValues>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      email: user?.email || "",
      phone: user?.phone || "",
      alternativeEmail: user?.alternativeEmail || "",
      alternativePhone: user?.alternativePhone || "",
      postalAddress: user?.postalAddress || "",
      physicalAddress: user?.physicalAddress || "",
      city: user?.city || "",
      district: user?.district || "",
      country: user?.country || "",
      emergencyContactName: user?.emergencyContactName || "",
      emergencyContactRelationship: user?.emergencyContactRelationship || "",
      emergencyContactPhone: user?.emergencyContactPhone || "",
      emergencyContactEmail: user?.emergencyContactEmail || "",
      emergencyContactAddress: user?.emergencyContactAddress || "",
    },
  })

  async function onSubmit(data: ContactInfoValues) {
    try {
      setIsSubmitting(true)
      await updateContactInfo(application.id, user.id, data)
      onComplete()
    } catch (error) {
      console.error("Error updating contact information:", error)
      form.setError("root", {
        type: "manual",
        message: "Failed to save contact information. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
        <p className="text-muted-foreground">Please provide your contact details and emergency contact information.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Your Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} className="rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} className="rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alternativeEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alternative Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter alternative email" {...field} className="rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alternativePhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alternative Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter alternative phone" {...field} className="rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="physicalAddress"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Physical Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter your physical address" {...field} className="rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Address (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter postal address" {...field} className="rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} className="rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District/State (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter district or state" {...field} className="rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter country" {...field} className="rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="emergencyContactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} className="rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContactRelationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter relationship" {...field} className="rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} className="rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email" {...field} className="rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContactAddress"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Emergency Contact Address (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter address" {...field} className="rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

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
