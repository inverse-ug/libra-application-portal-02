"use client";

import { HelpCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";
import logo from "@/assets/logo.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  RiUserLine,
  RiSettings4Line,
  RiShieldUserLine,
  RiLogoutBoxRLine,
} from "@remixicon/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useUser } from "@/hooks/use-user";
import { UserInfoModal } from "@/components/user-info-modal";
import { Skeleton } from "@/components/ui/skeleton";
import Sidebar from "@/components/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { NotificationsPopover } from "@/components/notifications-popover";

export default function TopNavigation() {
  const [showUserModal, setShowUserModal] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryText, setInquiryText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, isLoading } = useUser();

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Function to handle email display
  const getDisplayContact = () => {
    if (!user) return "No contact";

    if (user.phone) {
      return user.phone;
    } else if (user.email) {
      return user.email;
    }

    return "No contact info";
  };

  const handleLogout = async () => {
    document.dispatchEvent(new Event("startNavigation"));

    try {
      await signOut({ redirect: false });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      document.dispatchEvent(new Event("endNavigation"));
    }
  };

  const handleSubmitInquiry = async () => {
    if (!inquiryText.trim()) {
      toast.error("Please enter your inquiry");
      return;
    }

    setIsSubmitting(true);
    try {
      // Replace with your actual API call or server action
      // await submitInquiry(inquiryText, user?.id);
      toast.success(
        "Inquiry Submitted. We've received your inquiry and will respond shortly."
      );
      setInquiryText("");
      setInquiryOpen(false);
    } catch (error) {
      toast.error("Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background flex items-center px-4 md:px-6 w-full">
      <div className="flex items-center gap-4 justify-between w-full">
        <div className="flex items-center gap-4 w-full">
          <div className="md:hidden">
            <Sidebar />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8">
              <Image src={logo || "/placeholder.svg"} alt="Libra Logo" />
            </div>
            <div className="sm:flex sm:flex-col gap-0 hidden">
              <span className="text-xs font-semibold">
                Libra Vocational and
              </span>
              <span className="font-semibold text-[12px] text-muted-foreground">
                Business Institute
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            {/* Replace the old Bell button with the new NotificationsPopover */}
            <NotificationsPopover />

            {/* Inquiry Popover */}
            <Popover open={inquiryOpen} onOpenChange={setInquiryOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-border">
                      <HelpCircle className="h-5 w-5" />
                      <span className="sr-only">Inquiry</span>
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Submit Inquiry</p>
                </TooltipContent>
              </Tooltip>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <h3 className="font-medium">Submit Inquiry</h3>
                  <div className="space-y-2">
                    <Label htmlFor="inquiry">Your Question</Label>
                    <Textarea
                      id="inquiry"
                      value={inquiryText}
                      onChange={(e) => setInquiryText(e.target.value)}
                      placeholder="Type your question or concern here..."
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInquiryOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmitInquiry}
                      disabled={isSubmitting || !inquiryText.trim()}>
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* User Profile Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-border data-[state=open]:bg-accent/10 bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium">
                  {isLoading ? (
                    <Skeleton className="w-5 h-5 rounded" />
                  ) : user?.name ? (
                    <>{getInitials(user.name)}</>
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span className="sr-only">User Profile</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0 rounded-lg" align="end">
                <div className="p-2 border-b">
                  {isLoading ? (
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ) : (
                    <>
                      <h3 className="font-medium line-clamp-1">
                        {user?.name || "Guest"}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {getDisplayContact()}
                      </p>
                    </>
                  )}
                </div>
                <div className="p-1">
                  <button
                    onClick={() => setShowUserModal(true)}
                    className="flex items-center gap-2 w-full text-sm px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors text-left">
                    <div className="h-6 w-6 rounded-md bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <RiUserLine className="h-3.5 w-3.5" />
                    </div>
                    View Profile
                  </button>

                  <Link
                    href="/settings"
                    className="flex items-center gap-2 w-full text-sm px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/20 rounded-lg transition-colors">
                    <div className="h-6 w-6 rounded-md bg-slate-100 dark:bg-slate-800/40 flex items-center justify-center text-slate-600 dark:text-slate-400">
                      <RiSettings4Line className="h-3.5 w-3.5" />
                    </div>
                    Settings
                  </Link>

                  {!isLoading && user?.role === "admin" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 w-full text-sm px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
                      <div className="h-6 w-6 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <RiShieldUserLine className="h-3.5 w-3.5" />
                      </div>
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-sm px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-left">
                    <div className="h-6 w-6 rounded-md bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                      <RiLogoutBoxRLine className="h-3.5 w-3.5" />
                    </div>
                    Logout
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </TooltipProvider>
        </div>
      </div>

      <UserInfoModal open={showUserModal} onOpenChange={setShowUserModal} />
    </header>
  );
}
