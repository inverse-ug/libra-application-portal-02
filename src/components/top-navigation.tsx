"use client";

import { Bell, HelpCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/sidebar";
import { UserInfoModal } from "@/components/user-info-modal";
import { useState } from "react";
import Image from "next/image";
import logo from "@/assets/logo.png";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function TopNavigation() {
  const [showUserModal, setShowUserModal] = useState(false);

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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="border-border">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="border-border">
                  <HelpCircle className="h-5 w-5" />
                  <span className="sr-only">Help</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Help</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-border"
                  onClick={() => setShowUserModal(true)}>
                  <User className="h-5 w-5" />
                  <span className="sr-only">User Profile</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>User Profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <UserInfoModal open={showUserModal} onOpenChange={setShowUserModal} />
    </header>
  );
}
