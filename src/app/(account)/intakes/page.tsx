"use client";

import { useState, useEffect } from "react";
import {
  CalendarClock,
  Filter,
  BookOpen,
  Clock,
  ListFilter,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntakeCard } from "@/components/intake-card";
import { EmptyState } from "@/components/empty-state";
import { useUser } from "@/hooks/use-user";
import { getIntakes, getUserApplications } from "@/app/actions/intake-actions";

export default function IntakesPage() {
  const { user } = useUser();
  const [intakes, setIntakes] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState({
    intakes: true,
    applications: true,
  });

  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "az" | "za">(
    "newest"
  );
  const [activeTab, setActiveTab] = useState<"all" | "ongoing" | "upcoming">(
    "all"
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch intakes
        const intakesData = await getIntakes();
        setIntakes(intakesData);
        setIsLoading((prev) => ({ ...prev, intakes: false }));

        // Fetch user applications if user is logged in
        if (user?.id) {
          const applicationsData = await getUserApplications(user.id);
          setApplications(applicationsData);
        }
        setIsLoading((prev) => ({ ...prev, applications: false }));
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading({
          intakes: false,
          applications: false,
        });
      }
    };

    fetchData();
  }, [user?.id]);

  // Determine intake status based on dates
  const getIntakeStatus = (intake: any) => {
    const now = new Date();
    const startDate = new Date(intake.startDate);
    const endDate = new Date(intake.endDate);

    if (now < startDate) return "upcoming";
    if (now <= endDate) return "ongoing";
    return "ended";
  };

  // Filter and sort intakes
  const filteredIntakes = intakes
    .map((intake) => ({
      ...intake,
      status: getIntakeStatus(intake),
    }))
    .filter((intake) => {
      // Filter by tab selection
      if (activeTab === "all") return true;
      return intake.status === activeTab;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "az":
          return (a.name || "").localeCompare(b.name || "");
        case "za":
          return (b.name || "").localeCompare(a.name || "");
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  const handleSort = (order: "newest" | "oldest" | "az" | "za") => {
    setSortOrder(order);
  };

  // Count intakes by status
  const ongoingCount = intakes.filter(
    (intake) => getIntakeStatus(intake) === "ongoing"
  ).length;
  const upcomingCount = intakes.filter(
    (intake) => getIntakeStatus(intake) === "upcoming"
  ).length;

  // Get sort icon based on current sort order
  const getSortIcon = () => {
    switch (sortOrder) {
      case "newest":
      case "oldest":
        return <Clock className="h-4 w-4 mr-2" />;
      case "az":
        return <SortAsc className="h-4 w-4 mr-2" />;
      case "za":
        return <SortDesc className="h-4 w-4 mr-2" />;
      default:
        return <Filter className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Intakes</h1>
          <p className="text-muted-foreground mt-1">
            Browse and apply for available program intakes
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto rounded-lg">
              {getSortIcon()}
              {sortOrder === "newest" && "Newest First"}
              {sortOrder === "oldest" && "Oldest First"}
              {sortOrder === "az" && "A to Z"}
              {sortOrder === "za" && "Z to A"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-lg" align="end">
            <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => handleSort("newest")}
                className="rounded-md">
                <Clock className="h-4 w-4 mr-2" />
                Date (Newest First)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSort("oldest")}
                className="rounded-md">
                <Clock className="h-4 w-4 mr-2" />
                Date (Oldest First)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSort("az")}
                className="rounded-md">
                <SortAsc className="h-4 w-4 mr-2" />
                Alphabetical (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSort("za")}
                className="rounded-md">
                <SortDesc className="h-4 w-4 mr-2" />
                Alphabetical (Z-A)
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabs for intake status filtering */}
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}>
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-auto min-w-full md:w-fit rounded-lg">
            <TabsTrigger
              value="all"
              className="flex items-center gap-2 rounded-md">
              All{" "}
              <Badge
                variant="secondary"
                className="ml-1 bg-primary/10 text-primary border-primary/20 rounded-md">
                {intakes.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="ongoing"
              className="flex items-center gap-2 rounded-md">
              Ongoing{" "}
              <Badge
                variant="secondary"
                className="ml-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 rounded-md">
                {ongoingCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="flex items-center gap-2 rounded-md">
              Upcoming{" "}
              <Badge
                variant="secondary"
                className="ml-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 rounded-md">
                {upcomingCount}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      {/* Intakes list */}
      <Card className="shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeTab === "all" && (
                <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800/40 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400">
                  <ListFilter className="h-5 w-5" />
                </div>
              )}
              {activeTab === "ongoing" && (
                <div className="h-8 w-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CalendarClock className="h-5 w-5" />
                </div>
              )}
              {activeTab === "upcoming" && (
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Clock className="h-5 w-5" />
                </div>
              )}
              <CardTitle>
                {activeTab === "all" && "Available Intakes"}
                {activeTab === "ongoing" && "Ongoing Intakes"}
                {activeTab === "upcoming" && "Upcoming Intakes"}
              </CardTitle>
            </div>
            <CardDescription>
              {filteredIntakes.length}{" "}
              {filteredIntakes.length === 1 ? "intake" : "intakes"} found
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading.intakes ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Skeleton className="h-6 w-56" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex gap-2 justify-end">
                    <Skeleton className="h-9 w-28" />
                    <Skeleton className="h-9 w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredIntakes.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredIntakes.map((intake) => (
                <IntakeCard
                  key={intake.id}
                  intake={intake}
                  userApplications={applications}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={
                <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800/40 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400">
                  <BookOpen className="h-6 w-6" />
                </div>
              }
              title="No intakes found"
              description={
                activeTab !== "all"
                  ? `There are currently no ${activeTab} intakes available.`
                  : "There are currently no intakes available. Check back later for new enrollment opportunities."
              }
              actionLabel="View all intakes"
              actionOnClick={() => setActiveTab("all")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
