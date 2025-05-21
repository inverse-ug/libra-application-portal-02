"use client";

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
import { personalDetailsSchema } from "../../lib/validation";
import { Loader } from "lucide-react";
import { toast } from "sonner";
// import { createClient } from "@/utils/supabase/client";

interface PersonalDetailsStepProps {
  formData: Record<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >;
  updateFormData: (
    key: string,
    value: // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  ) => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function PersonalDetailsStep({
  formData,
  updateFormData,
  onContinue,
}: PersonalDetailsStepProps) {
  const form = useForm<z.infer<typeof personalDetailsSchema>>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      firstName: formData.firstName || "",
      otherNames: formData.otherNames || "",
      phoneNumber: formData.phoneNumber || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof personalDetailsSchema>) => {
    const toastId = toast.loading("Saving your details...");
    // const supabase = createClient();

    try {
      // Update form data in state
      updateFormData("firstName", values.firstName);
      updateFormData("otherNames", values.otherNames);
      updateFormData("phoneNumber", values.phoneNumber);

      // Get current user with proper error handling
      // const {
      //   data: { user },
      //   error: authError,
      // } = await supabase.auth.getUser();

      // if (authError) {
      //   throw new Error("Authentication error: " + authError.message);
      // }

      // if (!user) {
      //   throw new Error("No authenticated user found");
      // }

      // // Update user profile with RLS enforcement
      // const { error } = await supabase
      //   .from("users")
      //   .update({
      //     first_name: values.firstName,
      //     other_names: values.otherNames,
      //     phone_number: values.phoneNumber,
      //     onboarding_step: "personal_details_completed",
      //   })
      //   .eq("id", user.id)
      //   .select()
      //   .single();

      // if (error) {
      //   throw new Error("Database update failed: " + error.message);
      // }

      toast.success("Details saved successfully!", { id: toastId });
      onContinue();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save details",
        { id: toastId }
      );
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      form.setValue("phoneNumber", value.slice(0, 10));
    }
  };

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Personal Details</h1>
          <p className="text-muted-foreground mt-2">
            Please provide your personal information
          </p>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your first name"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="otherNames"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Names</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your other names"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    {...field}
                    onChange={handlePhoneNumberChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground">
                  10 digits only (no country code)
                </p>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </form>
    </Form>
  );
}
