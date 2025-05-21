"use client";

import { useEffect, useState } from "react";
import {
  RiUser3Line,
  RiUser3Fill,
  RiLockLine,
  RiLockFill,
  RiNotification3Line,
  RiNotification3Fill,
  RiCheckLine,
  RiErrorWarningLine,
  RiLoader5Line,
} from "@remixicon/react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { useStudent } from "@/hooks/use-student";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Profile form schema
const profileFormSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
});

// Password form schema
const passwordFormSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    passwordConfirm: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

// Message type for notifications with timeout
type MessageType = {
  text: string;
  type: "success" | "error";
  id: string;
};

export default function SettingsPage() {
  const { user, isLoading: userLoading } = useUser();
  const { student, isLoading: studentLoading } = useStudent(
    user?.id ? String(user?.id) : undefined
  );
  const { isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "notifications"
  >("profile");

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [changePassword, setChangePassword] = useState(false);

  // Check if email is a temporary phone-verified email
  const isTemporaryEmail = user?.email && user.email.includes("@phoneverified");

  // Determine which fields should be editable
  const isNameEditable = !user?.name;
  const isEmailEditable = !user?.email || isTemporaryEmail;
  const isPhoneEditable = !user?.phoneNumber;
  const isAddressEditable = !student?.address;

  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState(
    student?.notificationPreferences?.emailNotifications ?? true
  );
  const [applicationUpdates, setApplicationUpdates] = useState(
    student?.notificationPreferences?.applicationUpdates ?? true
  );
  const [paymentReminders, setPaymentReminders] = useState(
    student?.notificationPreferences?.paymentReminders ?? true
  );

  // Track original notification preferences
  const [originalNotificationPrefs, setOriginalNotificationPrefs] = useState({
    emailNotifications:
      student?.notificationPreferences?.emailNotifications ?? true,
    applicationUpdates:
      student?.notificationPreferences?.applicationUpdates ?? true,
    paymentReminders:
      student?.notificationPreferences?.paymentReminders ?? true,
  });

  // Update original notification preferences when student data loads
  useEffect(() => {
    if (student) {
      setEmailNotifications(
        student.notificationPreferences?.emailNotifications ?? true
      );
      setApplicationUpdates(
        student.notificationPreferences?.applicationUpdates ?? true
      );
      setPaymentReminders(
        student.notificationPreferences?.paymentReminders ?? true
      );

      setOriginalNotificationPrefs({
        emailNotifications:
          student.notificationPreferences?.emailNotifications ?? true,
        applicationUpdates:
          student.notificationPreferences?.applicationUpdates ?? true,
        paymentReminders:
          student.notificationPreferences?.paymentReminders ?? true,
      });
    }
  }, [student]);

  // Track if notification preferences have changed
  const [notificationPrefsChanged, setNotificationPrefsChanged] =
    useState(false);

  // Update notification preferences change tracking
  useEffect(() => {
    const hasChanges =
      emailNotifications !== originalNotificationPrefs.emailNotifications ||
      applicationUpdates !== originalNotificationPrefs.applicationUpdates ||
      paymentReminders !== originalNotificationPrefs.paymentReminders;

    setNotificationPrefsChanged(hasChanges);
  }, [
    emailNotifications,
    applicationUpdates,
    paymentReminders,
    originalNotificationPrefs,
  ]);

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: isTemporaryEmail ? "" : user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      address: student?.address || "",
    },
  });

  // Track if form has changes
  const [profileFormHasChanges, setProfileFormHasChanges] = useState(false);

  // Watch for form changes
  useEffect(() => {
    const subscription = profileForm.watch((value, { name, type }) => {
      if (type === "change") {
        const currentValues = value;
        const initialValues = {
          name: user?.name || "",
          email: isTemporaryEmail ? "" : user?.email || "",
          phoneNumber: user?.phoneNumber || "",
          address: student?.address || "",
        };

        // Check if any values have changed
        const hasChanges = Object.keys(currentValues).some((key) => {
          const k = key as keyof ProfileFormValues;
          return currentValues[k] !== initialValues[k];
        });

        setProfileFormHasChanges(hasChanges);
      }
    });

    return () => subscription.unsubscribe();
  }, [profileForm, user, student, isTemporaryEmail]);

  // Update profile form values when user/student data loads
  useEffect(() => {
    if (!userLoading && !studentLoading) {
      profileForm.reset({
        name: user?.name || "",
        email: isTemporaryEmail ? "" : user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        address: student?.address || "",
      });
    }
  }, [user, student, userLoading, studentLoading, isTemporaryEmail]);

  const isLoading = userLoading || studentLoading || authLoading;

  // Function to add a message with timeout
  const addMessage = (text: string, type: "success" | "error") => {
    const id = Date.now().toString();
    setMessages((prev) => [...prev, { text, type, id }]);

    // Remove message after 5 seconds
    setTimeout(() => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    }, 5000);
  };

  // Add a function to check if an email already exists
  async function checkEmailExists(email: string): Promise<boolean> {
    try {
      // Skip check if email is unchanged
      if (email === user?.email) {
        return false;
      }

      console.log("Checking if email exists:", email);

      // Make a request to check if the email exists
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/users?where[email][equals]=${encodeURIComponent(email)}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.error("Error checking email existence:", await response.text());
        return false; // Assume it doesn't exist if we can't check
      }

      const data = await response.json();
      const exists = data.docs && data.docs.length > 0;
      console.log("Email exists check result:", exists, data);
      return exists;
    } catch (error) {
      console.error("Error checking email existence:", error);
      return false; // Assume it doesn't exist if we can't check
    }
  }

  async function onSubmitProfileUpdate(data: ProfileFormValues) {
    setIsSubmitting(true);
    setMessages([]);

    try {
      // Check if email already exists (if it's being changed)
      if (data.email && data.email !== user?.email) {
        const emailExists = await checkEmailExists(data.email);
        if (emailExists) {
          throw new Error(
            "This email address is already in use. Please use a different email."
          );
        }
      }

      console.log("Updating user profile:", data);

      // Update user data
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/users/${user?.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            phoneNumber: data.phoneNumber,
          }),
          credentials: "include",
        }
      );

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        console.error("Error updating user:", errorData);

        // Check for specific error messages related to email uniqueness
        if (
          errorData.errors?.email?.message?.includes("already exists") ||
          errorData.message?.toLowerCase().includes("duplicate") ||
          errorData.message?.toLowerCase().includes("already exists")
        ) {
          throw new Error(
            "This email address is already in use. Please use a different email."
          );
        }
        throw new Error(errorData.message || "Failed to update profile");
      }

      const updatedUser = await userResponse.json();
      console.log("User updated successfully:", updatedUser);

      // If student data needs to be updated (address)
      if (student?.id && data.address) {
        console.log("Updating student address:", data.address);

        const studentResponse = await fetch(
          `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/students/${student.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              address: data.address,
            }),
            credentials: "include",
          }
        );

        if (!studentResponse.ok) {
          const errorData = await studentResponse.json();
          console.error("Error updating student:", errorData);
          throw new Error(
            errorData.message || "Failed to update student information"
          );
        }

        console.log(
          "Student updated successfully:",
          await studentResponse.json()
        );
      }

      addMessage("Profile updated successfully", "success");
      toast.success("Profile updated", {
        description: "Your profile information has been successfully updated.",
        icon: <RiCheckLine className="h-5 w-5 text-green-500" />,
      });

      // Reset the change tracking
      setProfileFormHasChanges(false);

      // Update the form's default values to the new values
      profileForm.reset(data);
    } catch (err: any) {
      console.error("Profile update error:", err);
      addMessage(
        err?.message || "Failed to update profile. Please try again.",
        "error"
      );
      toast.error("Error updating profile", {
        description:
          err?.message || "Failed to update profile. Please try again.",
        icon: <RiErrorWarningLine className="h-5 w-5 text-red-500" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSubmitPasswordChange(data: PasswordFormValues) {
    setIsSubmitting(true);
    setMessages([]);

    try {
      console.log("Updating password for user:", user?.id);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/users/${user?.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: data.password,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error updating password:", errorData);
        throw new Error(errorData.message || "Failed to update password");
      }

      console.log("Password updated successfully");
      addMessage("Password updated successfully", "success");
      toast.success("Password updated", {
        description: "Your password has been successfully updated.",
        icon: <RiCheckLine className="h-5 w-5 text-green-500" />,
      });

      passwordForm.reset();
      setChangePassword(false);
    } catch (err: any) {
      console.error("Password update error:", err);
      addMessage(
        err?.message || "Failed to update password. Please try again.",
        "error"
      );
      toast.error("Error updating password", {
        description:
          err?.message || "Failed to update password. Please try again.",
        icon: <RiErrorWarningLine className="h-5 w-5 text-red-500" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function saveNotificationPreferences() {
    setIsSubmitting(true);
    setMessages([]);

    try {
      if (!student?.id) {
        throw new Error("Student record not found");
      }

      const preferences = {
        notificationPreferences: {
          emailNotifications,
          applicationUpdates,
          paymentReminders,
        },
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/api/students/${student.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(preferences),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error updating notification preferences:", errorData);
        throw new Error(
          errorData.message || "Failed to update notification preferences"
        );
      }

      console.log(
        "Notification preferences updated successfully:",
        await response.json()
      );
      addMessage("Notification preferences updated successfully", "success");
      toast.success("Preferences saved", {
        description: "Your notification preferences have been updated.",
        icon: <RiCheckLine className="h-5 w-5 text-green-500" />,
      });

      // Update original preferences to match current
      setOriginalNotificationPrefs({
        emailNotifications,
        applicationUpdates,
        paymentReminders,
      });
      setNotificationPrefsChanged(false);
    } catch (err: any) {
      console.error("Notification preferences update error:", err);
      addMessage(
        err?.message || "Failed to save preferences. Please try again.",
        "error"
      );
      toast.error("Error saving preferences", {
        description:
          err?.message || "Failed to save preferences. Please try again.",
        icon: <RiErrorWarningLine className="h-5 w-5 text-red-500" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // // Determine which ID to display and prioritize Account ID
  // const getDisplayId = () => {
  //   // Prioritize Account ID if available
  //   if (user?.accountId) {
  //     return {
  //       label: "Account ID",
  //       value: user.accountId,
  //     };
  //   }

  //   // Fall back to Student ID
  //   return {
  //     label: "Student ID",
  //     value: student?.studentId || "Not assigned",
  //   };
  // };

  // const displayId = getDisplayId();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        <Card className="h-fit">
          <CardContent className="p-4">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-3 px-3 py-2 border w-full text-left rounded-md transition-colors ${
                  activeTab === "profile"
                    ? "bg-muted border-border"
                    : "border-transparent hover:bg-muted/50"
                }`}>
                {activeTab === "profile" ? (
                  <RiUser3Fill className="h-5 w-5" />
                ) : (
                  <RiUser3Line className="h-5 w-5" />
                )}
                <span>Profile</span>
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-3 px-3 py-2 border w-full text-left rounded-md transition-colors ${
                  activeTab === "security"
                    ? "bg-muted border-border"
                    : "border-transparent hover:bg-muted/50"
                }`}>
                {activeTab === "security" ? (
                  <RiLockFill className="h-5 w-5" />
                ) : (
                  <RiLockLine className="h-5 w-5" />
                )}
                <span>Security</span>
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`flex items-center gap-3 px-3 py-2 border w-full text-left rounded-md transition-colors ${
                  activeTab === "notifications"
                    ? "bg-muted border-border"
                    : "border-transparent hover:bg-muted/50"
                }`}>
                {activeTab === "notifications" ? (
                  <RiNotification3Fill className="h-5 w-5" />
                ) : (
                  <RiNotification3Line className="h-5 w-5" />
                )}
                <span>Notifications</span>
              </button>
            </nav>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Messages with timeout */}
          {messages.length > 0 && (
            <div className="space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`px-4 py-3 rounded-md flex items-start gap-2 relative overflow-hidden ${
                    message.type === "success"
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}>
                  {message.type === "success" ? (
                    <RiCheckLine className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <RiErrorWarningLine className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <p className="text-sm">{message.text}</p>

                  {/* Progress bar */}
                  <div
                    className={`absolute bottom-0 left-0 h-1 ${
                      message.type === "success" ? "bg-green-500" : "bg-red-500"
                    }`}
                    style={{
                      width: "100%",
                      animation: "shrink-width 5s linear forwards",
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === "profile" && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <RiUser3Line className="h-5 w-5" />
                  <CardTitle>Profile Information</CardTitle>
                </div>
                <Separator className="mt-4" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <Form {...profileForm}>
                    <form
                      onSubmit={profileForm.handleSubmit(onSubmitProfileUpdate)}
                      className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isNameEditable}
                                  placeholder={
                                    isNameEditable ? "Enter your name" : ""
                                  }
                                  className="focus:ring-1 focus:ring-primary"
                                />
                              </FormControl>
                              {!isNameEditable && (
                                <FormDescription className="text-amber-500 flex items-center gap-1 mt-1">
                                  <RiErrorWarningLine className="h-4 w-4" />
                                  Name cannot be changed once set
                                </FormDescription>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* <div>
                          <Label htmlFor="id">{displayId.label}</Label>
                          <div className="border border-border bg-muted/30 p-2 mt-2 rounded-md">
                            {displayId.value}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            ID cannot be modified
                          </p>
                        </div> */}
                      </div>

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <div className="flex items-center gap-2">
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={
                                    !isEmailEditable && field.value !== ""
                                  }
                                  placeholder={
                                    isEmailEditable ? "Enter your email" : ""
                                  }
                                  type="email"
                                  className="focus:ring-1 focus:ring-primary"
                                />
                              </FormControl>
                            </div>
                            {!isEmailEditable && field.value !== "" && (
                              <FormDescription className="text-amber-500 flex items-center gap-1 mt-1">
                                <RiErrorWarningLine className="h-4 w-4" />
                                Email cannot be changed once set
                              </FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <div className="flex items-center gap-2">
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isPhoneEditable}
                                  placeholder={
                                    isPhoneEditable
                                      ? "Enter your phone number"
                                      : ""
                                  }
                                  type="tel"
                                  className="focus:ring-1 focus:ring-primary"
                                />
                              </FormControl>
                            </div>
                            {!isPhoneEditable && (
                              <FormDescription className="text-amber-500 flex items-center gap-1 mt-1">
                                <RiErrorWarningLine className="h-4 w-4" />
                                Phone number cannot be changed once set
                              </FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <div className="flex items-center gap-2">
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isAddressEditable}
                                  placeholder={
                                    isAddressEditable
                                      ? "Enter your address"
                                      : ""
                                  }
                                  className="focus:ring-1 focus:ring-primary"
                                />
                              </FormControl>
                            </div>
                            {!isAddressEditable && (
                              <FormDescription className="text-amber-500 flex items-center gap-1 mt-1">
                                <RiErrorWarningLine className="h-4 w-4" />
                                Address cannot be changed once set
                              </FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {(isNameEditable ||
                        isEmailEditable ||
                        isPhoneEditable ||
                        isAddressEditable) && (
                        <Button
                          type="submit"
                          disabled={isSubmitting || !profileFormHasChanges}
                          className="relative">
                          {isSubmitting ? (
                            <>
                              <RiLoader5Line className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      )}

                      <div className="text-sm text-muted-foreground mt-2 bg-amber-50 border border-amber-100 p-3 rounded-md">
                        <p className="flex flex-col items-center text-center gap-1">
                          <RiErrorWarningLine className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          <span>
                            Once profile information is set and saved, it cannot
                            be modified. Please contact administration for any
                            changes needed to locked fields.
                          </span>
                        </p>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <RiLockLine className="h-5 w-5" />
                  <CardTitle>Security Settings</CardTitle>
                </div>
                <Separator className="mt-4" />
              </CardHeader>
              <CardContent>
                {!changePassword ? (
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setChangePassword(true)}>
                      Change Password
                    </Button>
                  </div>
                ) : (
                  <Form {...passwordForm}>
                    <form
                      onSubmit={passwordForm.handleSubmit(
                        onSubmitPasswordChange
                      )}
                      className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                {...field}
                                className="focus:ring-1 focus:ring-primary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="passwordConfirm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                {...field}
                                className="focus:ring-1 focus:ring-primary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="relative">
                          {isSubmitting ? (
                            <>
                              <RiLoader5Line className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Update Password"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setChangePassword(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <RiNotification3Line className="h-5 w-5" />
                  <CardTitle>Notification Preferences</CardTitle>
                </div>
                <Separator className="mt-4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications about new schemes
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <div>
                      <h3 className="font-medium">Application Updates</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about your applications
                      </p>
                    </div>
                    <Switch
                      id="application-updates"
                      checked={applicationUpdates}
                      onCheckedChange={setApplicationUpdates}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <div>
                      <h3 className="font-medium">Payment Reminders</h3>
                      <p className="text-sm text-muted-foreground">
                        Receive reminders about upcoming payments
                      </p>
                    </div>
                    <Switch
                      id="payment-reminders"
                      checked={paymentReminders}
                      onCheckedChange={setPaymentReminders}
                    />
                  </div>

                  <Button
                    onClick={saveNotificationPreferences}
                    disabled={isSubmitting || !notificationPrefsChanged}
                    className="mt-4">
                    {isSubmitting ? (
                      <>
                        <RiLoader5Line className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Preferences"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add CSS for the progress bar animation */}
      <style jsx global>{`
        @keyframes shrink-width {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
