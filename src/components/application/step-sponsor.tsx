"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateSponsorAndNextOfKin } from "@/app/actions/application-actions";
import { Loader2 } from "lucide-react";

const sponsorSchema = z.object({
  // Sponsor
  sponsorName: z.string().min(2, { message: "Sponsor name is required" }),
  sponsorRelationship: z
    .string()
    .min(2, { message: "Relationship is required" }),
  sponsorOccupation: z.string().min(2, { message: "Occupation is required" }),
  sponsorAddress: z
    .string()
    .min(2, { message: "Physical address is required" }),
  sponsorPhone: z.string().min(10, { message: "Phone number is required" }),

  // Next of Kin
  nextOfKinName: z.string().min(2, { message: "Next of kin name is required" }),
  nextOfKinRelationship: z
    .string()
    .min(2, { message: "Relationship is required" }),
  nextOfKinOccupation: z.string().min(2, { message: "Occupation is required" }),
  nextOfKinAddress: z
    .string()
    .min(2, { message: "Physical address is required" }),
  nextOfKinPhone: z.string().min(10, { message: "Phone number is required" }),
});

type SponsorValues = z.infer<typeof sponsorSchema>;

interface ApplicationStepSponsorProps {
  application: any;
  user: any;
  onComplete: () => void;
}

export function ApplicationStepSponsor({
  application,
  user,
  onComplete,
}: ApplicationStepSponsorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SponsorValues>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: {
      sponsorName: user?.sponsorName ?? "",
      sponsorRelationship: user?.sponsorRelationship ?? "",
      sponsorOccupation: user?.sponsorOccupation ?? "",
      sponsorAddress: user?.sponsorAddress ?? "",
      sponsorPhone: user?.sponsorPhone ?? "",

      nextOfKinName: user?.nextOfKinName ?? "",
      nextOfKinRelationship: user?.nextOfKinRelationship ?? "",
      nextOfKinOccupation: user?.nextOfKinOccupation ?? "",
      nextOfKinAddress: user?.nextOfKinAddress ?? "",
      nextOfKinPhone: user?.nextOfKinPhone ?? "",
    },
  });

  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        sponsorName: user.sponsorName ?? "",
        sponsorRelationship: user.sponsorRelationship ?? "",
        sponsorOccupation: user.sponsorOccupation ?? "",
        sponsorAddress: user.sponsorAddress ?? "",
        sponsorPhone: user.sponsorPhone ?? "",

        nextOfKinName: user.nextOfKinName ?? "",
        nextOfKinRelationship: user.nextOfKinRelationship ?? "",
        nextOfKinOccupation: user.nextOfKinOccupation ?? "",
        nextOfKinAddress: user.nextOfKinAddress ?? "",
        nextOfKinPhone: user.nextOfKinPhone ?? "",
      });
    }
  }, [user, form]);

  async function onSubmit(formData: SponsorValues) {
    try {
      setIsSubmitting(true);

      // Ensure all required fields have values before submitting
      const data = {
        sponsorName: formData.sponsorName ?? "",
        sponsorRelationship: formData.sponsorRelationship ?? "",
        sponsorOccupation: formData.sponsorOccupation ?? "",
        sponsorAddress: formData.sponsorAddress ?? "",
        sponsorPhone: formData.sponsorPhone ?? "",

        nextOfKinName: formData.nextOfKinName ?? "",
        nextOfKinRelationship: formData.nextOfKinRelationship ?? "",
        nextOfKinOccupation: formData.nextOfKinOccupation ?? "",
        nextOfKinAddress: formData.nextOfKinAddress ?? "",
        nextOfKinPhone: formData.nextOfKinPhone ?? "",
      };

      await updateSponsorAndNextOfKin(application.id, user.id, data);
      onComplete();
    } catch (error) {
      console.error("Error updating sponsor information:", error);
      form.setError("root", {
        type: "manual",
        message: "Failed to save sponsor information. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">
          Sponsor & Next of Kin Information
        </h2>
        <p className="text-muted-foreground">
          Please provide details of your sponsor and next of kin.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">
              Parent/Guardian/Sponsor Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="sponsorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter sponsor's name"
                        {...field}
                        className="rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sponsorRelationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter relationship"
                        {...field}
                        className="rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sponsorOccupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupation</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter occupation"
                        {...field}
                        className="rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sponsorPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter phone number"
                        {...field}
                        className="rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sponsorAddress"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Physical Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter physical address"
                        {...field}
                        className="rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Next of Kin Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nextOfKinName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter next of kin's name"
                        {...field}
                        className="rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextOfKinRelationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter relationship"
                        {...field}
                        className="rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextOfKinOccupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupation</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter occupation"
                        {...field}
                        className="rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextOfKinPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter phone number"
                        {...field}
                        className="rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextOfKinAddress"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Physical Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter physical address"
                        {...field}
                        className="rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {form.formState.errors.root && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 hover:bg-blue-700">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save and Continue"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
