import { getIntakes } from "@/app/actions/intake-actions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"

export async function IntakesList() {
  const intakes = await getIntakes({ isActive: true })

  if (!intakes || intakes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium">No active intakes available</h3>
        <p className="text-muted-foreground mt-1">Please check back later for new intake opportunities</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {intakes.map((intake) => (
        <Card key={intake.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{intake.name}</CardTitle>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Active
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">
              {intake.description || "No description available"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Application Fee:</span>
                <span className="font-medium">{formatCurrency(intake.applicationFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date:</span>
                <span className="font-medium">{formatDate(intake.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">End Date:</span>
                <span className="font-medium">{formatDate(intake.endDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Programs:</span>
                <span className="font-medium">{intake.programs.length}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full rounded-lg">
              <Link href={`/intakes/${intake.id}`}>View Details</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
