"use client"

import { useState, useEffect } from "react"
import { FileText, Filter, Search, Clock, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/empty-state"
import { ApplicationCard } from "@/components/application-card"
import { getUserApplications } from "@/app/actions/application-actions"
import { useUser } from "@/hooks/use-user"

export default function MyApplicationsPage() {
  const { user } = useUser()
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return

      try {
        setIsLoading(true)
        const data = await getUserApplications(user.id)
        setApplications(data)
      } catch (error) {
        console.error("Error fetching applications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) {
      fetchData()
    }
  }, [user?.id])

  // Filter and sort applications
  const filteredApplications = applications
    .filter((application) => {
      // Filter by search query
      const matchesSearch =
        searchQuery === "" ||
        application.program?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        application.intake?.name.toLowerCase().includes(searchQuery.toLowerCase())

      // Filter by status
      const matchesStatus = !selectedStatus || application.status === selectedStatus

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const handleSort = (order: "newest" | "oldest") => {
    setSortOrder(order)
  }

  // Get sort icon based on current sort order
  const getSortIcon = () => {
    switch (sortOrder) {
      case "newest":
      case "oldest":
        return <Clock className="h-4 w-4 mr-2" />
      default:
        return <Filter className="h-4 w-4 mr-2" />
    }
  }

  // Get unique statuses from applications
  const statuses = Array.from(new Set(applications.map((app) => app.status)))

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground mt-1">Track and manage your program applications</p>
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
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
                {selectedStatus || "All Statuses"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-lg" align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setSelectedStatus(null)} className="rounded-md">
                  All Statuses
                </DropdownMenuItem>
                {statuses.map((status) => (
                  <DropdownMenuItem key={status} onClick={() => setSelectedStatus(status)} className="rounded-md">
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-lg">
                {getSortIcon()}
                {sortOrder === "newest" && "Newest First"}
                {sortOrder === "oldest" && "Oldest First"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-lg" align="end">
              <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => handleSort("newest")} className="rounded-md">
                  <Clock className="h-4 w-4 mr-2" />
                  Date (Newest First)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("oldest")} className="rounded-md">
                  <Clock className="h-4 w-4 mr-2" />
                  Date (Oldest First)
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Applications list */}
      <Card className="shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
                <FileText className="h-5 w-5" />
              </div>
              <CardTitle>Your Applications</CardTitle>
            </div>
            <CardDescription>
              {filteredApplications.length} {filteredApplications.length === 1 ? "application" : "applications"} found
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Skeleton className="h-6 w-56" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-3" />
                  <div className="flex gap-2 justify-end">
                    <Skeleton className="h-9 w-28" />
                    <Skeleton className="h-9 w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredApplications.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={
                <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <FileText className="h-6 w-6" />
                </div>
              }
              title="No applications found"
              description={
                searchQuery || selectedStatus
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "You haven't submitted any applications yet."
              }
              actionLabel={searchQuery || selectedStatus ? "Clear filters" : "Browse available intakes"}
              actionOnClick={
                searchQuery || selectedStatus
                  ? () => {
                      setSearchQuery("")
                      setSelectedStatus(null)
                    }
                  : undefined
              }
              actionHref={searchQuery || selectedStatus ? undefined : "/intakes"}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
