"use client";

import { useState } from "react";
import {
  CreditCard,
  Search,
  Receipt,
  Filter,
  Download,
  Eye,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/use-user";
import { RiNoCreditCardLine } from "@remixicon/react";
import { useApplicationPayments } from "@/hooks/use-payments";
import { formatDate } from "@/lib/date-utils";

export default function PaymentHistoryPage() {
  const { user } = useUser();
  const { applications, isLoading } = useApplicationPayments(
    user?.id?.toString()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Filter and sort applications with payment info
  const filteredApplications = applications
    .filter((application) => {
      const schemeTitle =
        typeof application.scheme === "object" && application.scheme
          ? application.scheme.title
          : "";
      const programName =
        typeof application.program === "object" && application.program
          ? application.program.name
          : "";

      return (
        schemeTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        programName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.paymentStatus
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        application.paymentMethod
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortOrder === "oldest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleSort = (order: "newest" | "oldest") => {
    setSortOrder(order);
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "text-green-700 dark:text-green-400 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30";
      case "refunded":
        return "text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30";
      case "pending":
      case "unpaid":
        return "text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30";
      default:
        return "";
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Payment History</h1>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by scheme or payment method"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Sort Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => handleSort("newest")}>
                    Date (Newest First)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("oldest")}>
                    Date (Oldest First)
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>Your Payments</CardTitle>
          </div>
          <Separator className="mt-4" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                    <div>
                      <Skeleton className="h-5 w-48 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredApplications.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredApplications.map((application) => {
                const schemeTitle =
                  typeof application.scheme === "object" && application.scheme
                    ? application.scheme.title
                    : "Unknown Scheme";
                const programName =
                  typeof application.program === "object" && application.program
                    ? application.program.name
                    : "Unknown Program";

                return (
                  <div
                    key={application.id}
                    className={`border p-4 ${getStatusColor(application.paymentStatus ?? "")}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-medium">{schemeTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          {programName}
                        </p>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 border self-start md:self-auto">
                        {application.paymentStatus}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm mb-4">
                      <div className="flex items-center gap-1">
                        <Receipt className="h-3 w-3" />
                        <span>{formatCurrency(application.amount ?? 0)}</span>
                      </div>
                      <span className="hidden sm:inline text-muted-foreground">
                        •
                      </span>
                      <span className="text-muted-foreground">
                        {application.paymentMethod}
                      </span>
                      <span className="hidden sm:inline text-muted-foreground">
                        •
                      </span>
                      <span className="text-muted-foreground">
                        {formatDate(application.createdAt)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border"
                        asChild>
                        <Link href={`/applications/${application.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Application
                        </Link>
                      </Button>

                      {/* Only show receipt options for paid payments */}
                      {application.paymentStatus === "paid" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border"
                            asChild>
                            <Link
                              href={`/applications/${application.id}/receipt`}>
                              <Receipt className="h-4 w-4 mr-1" />
                              View Receipt
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border"
                            asChild>
                            <Link
                              href={`/applications/${application.id}/invoice`}>
                              <Download className="h-4 w-4 mr-1" />
                              Download Invoice
                            </Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={
                <RiNoCreditCardLine className="h-10 w-10 text-muted-foreground" />
              }
              title="No payments found"
              description={
                searchTerm
                  ? "No payments match your search criteria. Try adjusting your search."
                  : "You haven't made any payments yet."
              }
              actionLabel={searchTerm ? "Clear search" : "Browse Schemes"}
              actionHref={searchTerm ? undefined : "/schemes"}
              actionOnClick={searchTerm ? () => setSearchTerm("") : undefined}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
