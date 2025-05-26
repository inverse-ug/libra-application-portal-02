"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { notifications: [], unreadCount: 0 };
    }

    // Get notifications for the current user
    const notifications = await prisma.notification.findMany({
      where: {
        applicantId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20, // Limit to latest 20 notifications
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        applicantId: session.user.id,
        isRead: false,
      },
    });

    return {
      notifications: notifications.map((notification) => ({
        ...notification,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
      })),
      unreadCount,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.notification.update({
      where: {
        id: notificationId,
        applicantId: session.user.id, // Ensure user can only mark their own notifications
      },
      data: {
        isRead: true,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.notification.updateMany({
      where: {
        applicantId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: "Failed to mark notifications as read" };
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.notification.delete({
      where: {
        id: notificationId,
        applicantId: session.user.id, // Ensure user can only delete their own notifications
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, error: "Failed to delete notification" };
  }
}
