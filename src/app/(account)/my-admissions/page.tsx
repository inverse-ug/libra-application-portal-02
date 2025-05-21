"use client";

import { useState, useEffect } from "react";
import { Filter, Search, SortAsc, SortDesc, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/empty-state";
import { AdmissionCard } from "@/components/admission-card";
import { getUserAdmissions } from "@/app/actions/admission-actions";
import { useUser } from "@/hooks/use-user";

export default function MyAdmissionsPage() {
  const { user } = useUser();
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const data = await getUserAdmissions(user.id);
        setAdmissions(data);
      } catch (error) {
        console.error("Error fetching admissions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Filter and sort admissions
  const filteredAdmissions = admissions
    .filter((admission) => {
      // Filter by search query
      const matchesSearch =
        searchQuery === "" ||
        admission.program?.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        admission.admissionNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Filter by status
      const matchesStatus =
        !selectedStatus || admission.status === selectedStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
    });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Admissions</h1>
          <p className="text-muted-foreground mt-1">
            Manage your admission applications
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-3/4 mb-3" />
              <div className="flex gap-2 mb-3">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      ) : admissions.length > 0 ? (
        <>
          {/* Search and filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search admissions..."
                className="pl-9 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-lg">
                    <Filter className="h-4 w-4 mr-2" />
                    {selectedStatus ? selectedStatus : "All Statuses"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-lg" align="end">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => setSelectedStatus(null)}
                      className="rounded-md">
                      All Statuses
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedStatus("PROVISIONAL")}
                      className="rounded-md">
                      Provisional
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedStatus("CONFIRMED")}
                      className="rounded-md">
                      Confirmed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedStatus("DEFERRED")}
                      className="rounded-md">
                      Deferred
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedStatus("WITHDRAWN")}
                      className="rounded-md">
                      Withdrawn
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedStatus("GRADUATED")}
                      className="rounded-md">
                      Graduated
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                className="rounded-lg"
                onClick={() =>
                  setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
                }>
                {sortOrder === "newest" ? (
                  <SortDesc className="h-4 w-4 mr-2" />
                ) : (
                  <SortAsc className="h-4 w-4 mr-2" />
                )}
                {sortOrder === "newest" ? "Newest First" : "Oldest First"}
              </Button>
            </div>
          </div>

          {/* Admissions list */}
          <Card className="shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <CardTitle>Your Admissions</CardTitle>
                </div>
                <CardDescription>
                  {filteredAdmissions.length}{" "}
                  {filteredAdmissions.length === 1 ? "admission" : "admissions"}{" "}
                  found
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAdmissions.map((admission) => (
                  <AdmissionCard key={admission.id} admission={admission} />
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState
          icon={
            <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="h-6 w-6" />
            </div>
          }
          title="No admissions found"
          description="You don't have any admissions yet. Apply to a program to get started."
          actionLabel="Browse Programs"
          actionOnClick={() => (window.location.href = "/programs")}
        />
      )}
    </div>
  );
}
