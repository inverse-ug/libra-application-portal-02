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
  X,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
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
import { getPrograms } from "@/app/actions/program-actions";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<
    "az" | "za" | "fee-low" | "fee-high"
  >("az");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);

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
                <div
                  key={program.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedProgram(program)}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg">{program.title}</h3>
                    <Badge
                      variant="outline"
                      className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 rounded-md">
                      {program.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {program.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {program.categories?.map((category: any) => (
                      <Badge
                        key={category.id}
                        variant="secondary"
                        className="rounded-md">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="font-medium">Duration:</span>{" "}
                      {program.duration}
                    </div>
                    <Button variant="outline" size="sm" className="rounded-lg">
                      View Details
                    </Button>
                  </div>
                </div>
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

      {/* Program Details Dialog */}
      <Dialog
        open={!!selectedProgram}
        onOpenChange={(open) => !open && setSelectedProgram(null)}>
        <DialogContent className="sm:max-w-3xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="h-6 w-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-md flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BookOpen className="h-4 w-4" />
              </div>
              {selectedProgram?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedProgram?.type} Program • {selectedProgram?.duration}
            </DialogDescription>
          </DialogHeader>

          {selectedProgram && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedProgram.categories?.map((category: any) => (
                  <Badge
                    key={category.id}
                    variant="outline"
                    className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 rounded-md">
                    {category.name}
                  </Badge>
                ))}
              </div>

              <p className="text-muted-foreground">
                {selectedProgram.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{selectedProgram.duration}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tuition Fee</p>
                    <p className="font-medium">
                      {formatCurrency(selectedProgram.tuitionFee)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Requirements</h3>
                <p className="text-muted-foreground">
                  {selectedProgram.requirements}
                </p>
              </div>

              {selectedProgram.intakes &&
                selectedProgram.intakes.length > 0 && (
                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-2">Available Intakes</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedProgram.intakes.map((intake: any) => (
                        <div key={intake.id} className="border rounded-lg p-3">
                          <div className="font-medium">{intake.name}</div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(intake.startDate).toLocaleDateString()} -{" "}
                            {new Date(intake.endDate).toLocaleDateString()}
                          </p>
                          {intake.isActive && (
                            <Badge className="mt-2 bg-green-100 text-green-800 border-green-200 rounded-md">
                              Active
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="flex justify-end pt-4 border-t">
                <DialogClose asChild>
                  <Button variant="outline" className="rounded-lg">
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
