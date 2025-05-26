"use client";

import { useState } from "react";
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
// import { UserInfoModal } from "@/components/user-info-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useMobile();
  const router = useRouter();
  const { user, isLoading } = useUser();
  // const [showUserModal, setShowUserModal] = useState(false);

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

  const UserSection = ({ collapsed }) => (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={`flex items-center gap-2 w-full text-sm px-3 py-2 hover:bg-accent/10 rounded-lg transition-colors text-left data-[state=open]:bg-accent/10 cursor-pointer ${collapsed ? "justify-center" : "justify-start"}`}>
          <div
            className={`flex items-center gap-2 ${collapsed ? "flex-col" : ""}`}>
            <div className="h-9 w-9 bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 rounded-lg shadow-sm shrink-0 border border-indigo-200 dark:border-indigo-800">
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
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-0 rounded-lg"
        align={collapsed ? "center" : "start"}>
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
          {/* <button
            onClick={() => setShowUserModal(true)}
            className="flex items-center gap-2 w-full text-sm px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors text-left">
            <div className="h-6 w-6 rounded-md bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <RiUserLine className="h-3.5 w-3.5" />
            </div>
            View Profile
          </button> */}

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
  );

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
      bgColor: "bg-slate-100 dark:bg-slate-800/40",
      textColor: "text-slate-600 dark:text-slate-400",
      borderColor: "border-slate-200 dark:border-slate-700",
      hoverBg: "hover:bg-slate-50 dark:hover:bg-slate-800/20",
    },
  ];

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
        <ul className="space-y-1">
          {navigation.map((item) => {
            // Check if the current path starts with the nav item path
            // Or exact match for home page
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
      </nav>

      <div className="border-t p-3">
        <div
          className={`flex ${collapsed ? "flex-col items-center" : "items-center justify-between"} gap-4`}>
          <UserSection collapsed={collapsed} />
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

      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            // Check if the current path starts with the nav item path
            // Or exact match for home page
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            const Icon = isActive ? item.iconFill : item.iconLine;

            return (
              <li key={item.name}>
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
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between gap-4">
          <UserSection collapsed={false} />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );

  // For mobile, use a sheet with non-collapsible sidebar
  if (isMobile) {
    return (
      <>
        <Sheet>
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
        {/* <UserInfoModal open={showUserModal} onOpenChange={setShowUserModal} /> */}
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
      {/* <UserInfoModal open={showUserModal} onOpenChange={setShowUserModal} /> */}
    </>
  );
}
