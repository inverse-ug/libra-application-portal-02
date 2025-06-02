"use client";

import { useState, useRef, useEffect, RefObject, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  RiDashboardLine,
  RiDashboardFill,
  RiBookOpenLine,
  RiBookOpenFill,
  RiHistoryLine,
  RiHistoryFill,
  RiBankCardLine,
  RiBankCardFill,
  RiSettings4Line,
  RiSettings4Fill,
  RiLogoutBoxRLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiMenuLine,
  RiUserLine,
  RiShieldUserLine,
  RiGraduationCapLine,
  RiGraduationCapFill,
  RiFileListLine,
  RiFileListFill,
  RiSparklingLine,
  RiSparklingFill,
  RiAddLine,
} from "@remixicon/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { useUser } from "@/hooks/use-user";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "next-auth/react";

const useClickAway = (
  ref: RefObject<HTMLElement>,
  ignoreRef?: RefObject<HTMLElement> | undefined,
  callback?: () => void
) => {
  useEffect(() => {
    const handleClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        (!ignoreRef ||
          !ignoreRef.current ||
          !ignoreRef.current.contains(target))
      ) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [ref, ignoreRef, callback]);
};

// Custom Mobile Popover Component
const CustomMobilePopover = ({ trigger, children, isOpen, onClose }) => {
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Calculate position function that can be reused
  const calculatePosition = useCallback(() => {
    if (isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popoverHeight = 200; // Approximate height

      // Position above the trigger
      const top = triggerRect.top - popoverHeight + 48;
      const left = triggerRect.left;

      // Adjust if it goes off screen
      const adjustedTop = top < 0 ? triggerRect.bottom + 8 : top;
      const adjustedLeft = Math.max(
        8,
        Math.min(left, window.innerWidth - 224 - 8)
      ); // 224 is popover width

      setPosition({ top: adjustedTop, left: adjustedLeft });
    }
  }, [isOpen]);

  useClickAway(popoverRef, triggerRef, onClose);

  useEffect(() => {
    calculatePosition();

    // Add resize event listener
    const handleResize = () => {
      calculatePosition();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [calculatePosition]);

  return (
    <>
      <div ref={triggerRef}>{trigger}</div>
      {isOpen && (
        <div
          ref={popoverRef}
          className="fixed w-56 p-0 rounded-lg bg-popover border shadow-lg z-[9999]"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}>
          {children}
        </div>
      )}
    </>
  );
};
export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileUserPopoverOpen, setMobileUserPopoverOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const isMobile = useMobile();
  const router = useRouter();
  const { user, isLoading } = useUser();

  // Close mobile popover when sheet closes
  useEffect(() => {
    if (!sheetOpen) {
      setMobileUserPopoverOpen(false);
    }
  }, [sheetOpen]);

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

  const UserSection = ({ collapsed, isMobileContext = false }) => {
    const triggerContent = (
      <div
        className={`flex items-center gap-2 w-full text-sm px-3 py-2 hover:bg-accent/10 rounded-lg transition-colors text-left cursor-pointer ${collapsed ? "justify-center" : "justify-start"}`}>
        <div
          className={`flex items-center gap-2 ${collapsed ? "flex-col" : ""}`}>
          <div className="h-9 w-9 bg-primary/10 flex items-center justify-center text-primary rounded-lg shadow-sm shrink-0 border border-primary/20">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-lg" />
            ) : user?.name ? (
              getInitials(user.name)
            ) : (
              "?"
            )}
          </div>
          {!collapsed && (
            <div className="min-w-24">
              {isLoading ? (
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium line-clamp-1">
                    {user?.name || "Guest"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.role === "admin" ? "Admin" : "Applicant"}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );

    const popoverContent = (
      <>
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
          <Link
            href="/settings"
            onClick={() => {
              if (isMobileContext) {
                setMobileUserPopoverOpen(false);
                setSheetOpen(false);
              }
            }}
            className="flex items-center gap-2 w-full text-sm px-3 py-2 hover:bg-accent rounded-lg transition-colors">
            <div className="h-6 w-6 rounded-md bg-accent flex items-center justify-center text-muted-foreground">
              <RiSettings4Line className="h-3.5 w-3.5" />
            </div>
            Settings
          </Link>
          {!isLoading && user?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => {
                if (isMobileContext) {
                  setMobileUserPopoverOpen(false);
                  setSheetOpen(false);
                }
              }}
              className="flex items-center gap-2 w-full text-sm px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
              <div className="h-6 w-6 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <RiShieldUserLine className="h-3.5 w-3.5" />
              </div>
              Admin Panel
            </Link>
          )}
          <button
            onClick={() => {
              if (isMobileContext) {
                setMobileUserPopoverOpen(false);
                setSheetOpen(false);
              }
              handleLogout();
            }}
            className="flex items-center gap-2 w-full text-sm px-3 py-2 hover:bg-destructive/10 rounded-lg transition-colors text-left">
            <div className="h-6 w-6 rounded-md bg-destructive/10 flex items-center justify-center text-destructive">
              <RiLogoutBoxRLine className="h-3.5 w-3.5" />
            </div>
            Logout
          </button>
        </div>
      </>
    );

    if (isMobileContext) {
      return (
        <CustomMobilePopover
          trigger={
            <button
              type="button"
              onClick={() => setMobileUserPopoverOpen(!mobileUserPopoverOpen)}
              className="w-full">
              {triggerContent}
            </button>
          }
          isOpen={mobileUserPopoverOpen}
          onClose={() => setMobileUserPopoverOpen(false)}>
          {popoverContent}
        </CustomMobilePopover>
      );
    }

    // Desktop version with regular Popover
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className="w-full">
            {triggerContent}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-56 p-0 rounded-lg"
          align={collapsed ? "center" : "start"}>
          {popoverContent}
        </PopoverContent>
      </Popover>
    );
  };

  const navigation = [
    {
      name: "Overview",
      href: "/",
      iconLine: RiDashboardLine,
      iconFill: RiDashboardFill,
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800",
      hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-900/10",
    },
    {
      name: "All Intakes",
      href: "/intakes",
      iconLine: RiBookOpenLine,
      iconFill: RiBookOpenFill,
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      hoverBg: "hover:bg-emerald-50 dark:hover:bg-emerald-900/10",
    },
    {
      name: "Short Courses",
      href: "/short-courses",
      iconLine: RiSparklingLine,
      iconFill: RiSparklingFill,
      bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
      textColor: "text-cyan-600 dark:text-cyan-400",
      borderColor: "border-cyan-200 dark:border-cyan-800",
      hoverBg: "hover:bg-cyan-50 dark:hover:bg-cyan-900/10",
    },
    {
      name: "All Programs",
      href: "/programs",
      iconLine: RiFileListLine,
      iconFill: RiFileListFill,
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
      textColor: "text-indigo-600 dark:text-indigo-400",
      borderColor: "border-indigo-200 dark:border-indigo-800",
      hoverBg: "hover:bg-indigo-50 dark:hover:bg-indigo-900/10",
    },
    {
      name: "My Applications",
      href: "/my-applications",
      iconLine: RiHistoryLine,
      iconFill: RiHistoryFill,
      bgColor: "bg-amber-100 dark:bg-amber-900/20",
      textColor: "text-amber-600 dark:text-amber-400",
      borderColor: "border-amber-200 dark:border-amber-800",
      hoverBg: "hover:bg-amber-50 dark:hover:bg-amber-900/10",
    },
    {
      name: "My Admissions",
      href: "/my-admissions",
      iconLine: RiGraduationCapLine,
      iconFill: RiGraduationCapFill,
      bgColor: "bg-rose-100 dark:bg-rose-900/20",
      textColor: "text-rose-600 dark:text-rose-400",
      borderColor: "border-rose-200 dark:border-rose-800",
      hoverBg: "hover:bg-rose-50 dark:hover:bg-rose-900/10",
    },
    {
      name: "My Payments",
      href: "/my-payments",
      iconLine: RiBankCardLine,
      iconFill: RiBankCardFill,
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-800",
      hoverBg: "hover:bg-purple-50 dark:hover:bg-purple-900/10",
    },
    {
      name: "Settings",
      href: "/settings",
      iconLine: RiSettings4Line,
      iconFill: RiSettings4Fill,
      bgColor: "bg-accent",
      textColor: "text-muted-foreground",
      borderColor: "border-border",
      hoverBg: "hover:bg-accent",
    },
  ];

  // Apply Now Button Component
  const ApplyNowButton = ({ collapsed }) => {
    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/apply"
              className="flex items-center justify-center gap-3 px-3 py-3 bg-primary text-primary-foreground rounded-lg transition-all hover:bg-primary/90">
              <RiAddLine className="h-5 w-5 flex-shrink-0" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Apply Now</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link
        href="/apply"
        className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground rounded-lg transition-all hover:bg-primary/90">
        <div className="h-8 w-8 rounded-md bg-primary-foreground/20 flex items-center justify-center">
          <RiAddLine className="h-5 w-5 flex-shrink-0" />
        </div>
        <span className="font-medium">Apply Now</span>
      </Link>
    );
  };

  // Desktop sidebar content with collapsing functionality
  const DesktopSidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 p-1 rounded-lg">
              <Image
                src={logo || "/placeholder.svg"}
                alt="Libra Logo"
                className="rounded-lg"
              />
            </div>

            <div className="flex flex-col gap-0">
              <span className="text-sm font-bold">Libra Vocational</span>
              <span className="text-xs text-muted-foreground">
                Business Institute
              </span>
            </div>
          </div>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 border hover:bg-accent/10 rounded-lg"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {collapsed ? (
                <RiArrowRightSLine className="h-5 w-5" />
              ) : (
                <RiArrowLeftSLine className="h-5 w-5" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{collapsed ? "Expand sidebar" : "Collapse sidebar"}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-3">
          {/* Apply Now Button */}
          <ApplyNowButton collapsed={collapsed} />

          {/* Navigation Links */}
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              const Icon = isActive ? item.iconFill : item.iconLine;

              return (
                <li key={item.name}>
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={`flex items-center justify-center gap-3 px-3 py-3 border rounded-lg transition-all ${
                            isActive
                              ? `${item.bgColor} ${item.textColor} ${item.borderColor}`
                              : `hover:bg-accent/10 border-transparent hover:border-border`
                          }`}>
                          <Icon className="h-5 w-5 flex-shrink-0" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 border rounded-lg transition-all ${
                        isActive
                          ? `${item.borderColor}`
                          : "hover:bg-accent/10 border-transparent hover:border-border"
                      }`}>
                      <div
                        className={`h-8 w-8 rounded-md flex items-center justify-center ${
                          isActive
                            ? `${item.bgColor} ${item.textColor}`
                            : `${item.bgColor} ${item.textColor}`
                        }`}>
                        <Icon className="h-5 w-5 flex-shrink-0" />
                      </div>
                      <span
                        className={`font-medium ${isActive ? item.textColor : ""}`}>
                        {item.name}
                      </span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="border-t px-3 py-2.5">
        <div
          className={`flex ${collapsed ? "flex-col items-center" : "items-center justify-between"} gap-4`}>
          <UserSection collapsed={collapsed} isMobileContext={false} />
          <div className={collapsed ? "mt-2" : ""}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile sidebar content - non-collapsible
  const MobileSidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary/10 p-1 rounded-lg">
            <Image
              src={logo || "/placeholder.svg"}
              alt="Libra Logo"
              className="rounded-lg"
            />
          </div>

          <div className="flex flex-col gap-0">
            <span className="text-sm font-bold">Libra Vocational</span>
            <span className="text-xs text-muted-foreground">
              Business Institute
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-scroll">
        <div className="space-y-3">
          {/* Apply Now Button */}
          <ApplyNowButton collapsed={false} />

          {/* Navigation Links */}
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              const Icon = isActive ? item.iconFill : item.iconLine;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setSheetOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 border rounded-lg transition-all ${
                      isActive
                        ? `${item.borderColor}`
                        : "hover:bg-accent/10 border-transparent hover:border-border"
                    }`}>
                    <div
                      className={`h-8 w-8 rounded-md flex items-center justify-center ${
                        isActive
                          ? `${item.bgColor} ${item.textColor}`
                          : `${item.bgColor} ${item.textColor}`
                      }`}>
                      <Icon className="h-5 w-5 flex-shrink-0" />
                    </div>
                    <span
                      className={`font-medium ${isActive ? item.textColor : ""}`}>
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <UserSection collapsed={false} isMobileContext={true} />
          </div>
          <div className="shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );

  // For mobile, use a sheet with non-collapsible sidebar
  if (isMobile) {
    return (
      <>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden rounded-lg">
              <RiMenuLine className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <MobileSidebarContent />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // For desktop, use the regular sidebar with collapsing functionality
  return (
    <>
      <TooltipProvider>
        <div
          className={`border-r bg-card h-full flex-col transition-all duration-300 hidden md:block ${
            collapsed ? "w-20" : "w-64"
          }`}>
          <DesktopSidebarContent />
        </div>
      </TooltipProvider>
    </>
  );
}
