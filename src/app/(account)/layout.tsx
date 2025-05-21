import type React from "react";
import type { Metadata } from "next";
import Sidebar from "@/components/sidebar";
import TopNavigation from "@/components/top-navigation";

export const metadata: Metadata = {
  title: "Apply | Libra Vocational and Business Institute",
  description: "Application Portal for Libra Vocational and Business Institute",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen overflow-y-hidden">
      <TopNavigation />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex-1 overflow-auto w-full">{children}</div>
      </div>
    </div>
  );
}
