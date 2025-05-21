"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Clock,
  Tag,
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
import { ProgramCard } from "@/components/program-card";
import { getPrograms } from "@/app/actions/program-actions";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<
    "az" | "za" | "fee-low" | "fee-high"
  >("az");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getPrograms();
        setPrograms(data);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(
            data.flatMap(
              (program) => program.categories?.map((cat: any) => cat.name) || []
            )
          )
        );
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching programs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort programs
  const filteredPrograms = programs
    .filter((program) => {
      // Filter by search query
      const matchesSearch =
        searchQuery === "" ||
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by category
      const matchesCategory =
        !selectedCategory ||
        program.categories?.some(
          (cat: any) =>
            cat.name.toLowerCase() === selectedCategory.toLowerCase()
        );

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "za":
          return b.title.localeCompare(a.title);
        case "fee-low":
          return (a.tuitionFee || 0) - (b.tuitionFee || 0);
        case "fee-high":
          return (b.tuitionFee || 0) - (a.tuitionFee || 0);
        case "az":
        default:
          return a.title.localeCompare(b.title);
      }
    });

  const handleSort = (order: "az" | "za" | "fee-low" | "fee-high") => {
    setSortOrder(order);
  };

  // Get sort icon based on current sort order
  const getSortIcon = () => {
    switch (sortOrder) {
      case "az":
        return <SortAsc className="h-4 w-4 mr-2" />;
      case "za":
        return <SortDesc className="h-4 w-4 mr-2" />;
      case "fee-low":
      case "fee-high":
        return <Clock className="h-4 w-4 mr-2" />;
      default:
        return <Filter className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Programs</h1>
          <p className="text-muted-foreground mt-1">
            Browse all available academic programs
          </p>
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search programs..."
            className="pl-9 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-lg">
                <Tag className="h-4 w-4 mr-2" />
                {selectedCategory || "All Categories"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-lg" align="end">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setSelectedCategory(null)}
                  className="rounded-md">
                  All Categories
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-md">
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-lg">
                {getSortIcon()}
                {sortOrder === "az" && "A to Z"}
                {sortOrder === "za" && "Z to A"}
                {sortOrder === "fee-low" && "Fee: Low to High"}
                {sortOrder === "fee-high" && "Fee: High to Low"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-lg" align="end">
              <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
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
                <DropdownMenuItem
                  onClick={() => handleSort("fee-low")}
                  className="rounded-md">
                  <Clock className="h-4 w-4 mr-2" />
                  Fee (Low to High)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSort("fee-high")}
                  className="rounded-md">
                  <Clock className="h-4 w-4 mr-2" />
                  Fee (High to Low)
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Programs list */}
      <Card className="shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <CardTitle>Available Programs</CardTitle>
            </div>
            <CardDescription>
              {filteredPrograms.length}{" "}
              {filteredPrograms.length === 1 ? "program" : "programs"} found
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
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
          ) : filteredPrograms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrograms.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={
                <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="h-6 w-6" />
                </div>
              }
              title="No programs found"
              description={
                searchQuery || selectedCategory
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "There are currently no programs available. Check back later for new programs."
              }
              actionLabel={
                searchQuery || selectedCategory ? "Clear filters" : undefined
              }
              actionOnClick={
                searchQuery || selectedCategory
                  ? () => {
                      setSearchQuery("");
                      setSelectedCategory(null);
                    }
                  : undefined
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
