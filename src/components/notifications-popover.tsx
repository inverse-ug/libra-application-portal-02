"use client";

import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useTransition } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/app/actions/notification-actions";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  RiFileList3Line,
  RiMoneyDollarCircleLine,
  RiGraduationCapLine,
  RiInformationLine,
  RiTimeLine,
} from "@remixicon/react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type:
    | "APPLICATION_UPDATE"
    | "PAYMENT_CONFIRMATION"
    | "ADMISSION_UPDATE"
    | "GENERAL";
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationsData {
  notifications: Notification[];
  unreadCount: number;
}

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationsData>({
    notifications: [],
    unreadCount: 0,
  });
  const [isPending, startTransition] = useTransition();

  // Fetch notifications when popover opens
  useEffect(() => {
    if (isOpen) {
      startTransition(async () => {
        const data = await getNotifications();
        setNotifications(data);
      });
    }
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId: string) => {
    startTransition(async () => {
      const result = await markNotificationAsRead(notificationId);
      if (result.success) {
        // Update local state
        setNotifications((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, prev.unreadCount - 1),
        }));
      } else {
        toast.error(result.error || "Failed to mark notification as read");
      }
    });
  };

  const handleMarkAllAsRead = async () => {
    startTransition(async () => {
      const result = await markAllNotificationsAsRead();
      if (result.success) {
        setNotifications((prev) => ({
          ...prev,
          notifications: prev.notifications.map((n) => ({
            ...n,
            isRead: true,
          })),
          unreadCount: 0,
        }));
        toast.success("All notifications marked as read");
      } else {
        toast.error(result.error || "Failed to mark all notifications as read");
      }
    });
  };

  const handleDeleteNotification = async (notificationId: string) => {
    startTransition(async () => {
      const result = await deleteNotification(notificationId);
      if (result.success) {
        setNotifications((prev) => ({
          ...prev,
          notifications: prev.notifications.filter(
            (n) => n.id !== notificationId
          ),
          unreadCount: prev.notifications.find((n) => n.id === notificationId)
            ?.isRead
            ? prev.unreadCount
            : Math.max(0, prev.unreadCount - 1),
        }));
        toast.success("Notification deleted");
      } else {
        toast.error(result.error || "Failed to delete notification");
      }
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "APPLICATION_UPDATE":
        return <RiFileList3Line className="h-4 w-4" />;
      case "PAYMENT_CONFIRMATION":
        return <RiMoneyDollarCircleLine className="h-4 w-4" />;
      case "ADMISSION_UPDATE":
        return <RiGraduationCapLine className="h-4 w-4" />;
      default:
        return <RiInformationLine className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "APPLICATION_UPDATE":
        return "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400";
      case "PAYMENT_CONFIRMATION":
        return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400";
      case "ADMISSION_UPDATE":
        return "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "APPLICATION_UPDATE":
        return "Application";
      case "PAYMENT_CONFIRMATION":
        return "Payment";
      case "ADMISSION_UPDATE":
        return "Admission";
      default:
        return "General";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-border relative">
          <Bell className="h-5 w-5" />
          {notifications.unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {notifications.unreadCount > 99
                ? "99+"
                : notifications.unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 sm:w-96 p-0 ml-4" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notifications</h3>
            {notifications.unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {notifications.unreadCount} new
              </Badge>
            )}
          </div>
          {notifications.unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              className="text-xs h-7">
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-80 sm:h-96">
          {notifications.notifications.length === 0 ? (
            <div className="flex p-2 flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                No notifications yet
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                We'll notify you when something important happens
              </p>
            </div>
          ) : (
            <div className="p-1">
              {notifications.notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`group relative p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                      !notification.isRead
                        ? "bg-blue-50/50 dark:bg-blue-900/10 border-l-2 border-blue-500"
                        : ""
                    }`}>
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4
                                className={`text-sm font-medium line-clamp-1 ${
                                  !notification.isRead
                                    ? "text-gray-900 dark:text-gray-100"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}>
                                {notification.title}
                              </h4>
                              <Badge
                                variant="outline"
                                className="text-xs px-1.5 py-0.5 h-5">
                                {getTypeLabel(notification.type)}
                              </Badge>
                            </div>
                            <p
                              className={`text-xs line-clamp-2 mb-2 ${
                                !notification.isRead
                                  ? "text-gray-600 dark:text-gray-400"
                                  : "text-gray-500 dark:text-gray-500"
                              }`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <RiTimeLine className="h-3 w-3" />
                              {formatDistanceToNow(
                                new Date(notification.createdAt),
                                { addSuffix: true }
                              )}
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons - show on hover */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={isPending}
                          className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20">
                          <Check className="h-3 w-3 text-blue-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDeleteNotification(notification.id)
                        }
                        disabled={isPending}
                        className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20">
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  {index < notifications.notifications.length - 1 && (
                    <Separator className="my-1" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.notifications.length > 0 && (
          <div className="border-t p-3">
            <Button variant="ghost" className="w-full text-sm" size="sm">
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
