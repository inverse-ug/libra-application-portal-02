"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReferencesProps {
  scheme: any
  value: any[]
  onChange: (value: any[]) => void
  className?: string
}

export function References({ scheme, value, onChange, className }: ReferencesProps) {
  // Get references requirements from scheme
  const referencesConfig = scheme?.applicationFields?.references || {}
  const requiresReferences = referencesConfig.requiresReferences !== "never"
  const isRequired = referencesConfig.requiresReferences === "required"
  const minReferences = referencesConfig.minReferences || 0
  const maxReferences = referencesConfig.maxReferences || 3

  // Add reference
  const addReference = () => {
    if (value.length >= maxReferences) return

    onChange([
      ...value,
      {
        id: Date.now().toString(),
        name: "",
        title: "",
        organization: "",
        relationship: "",
        email: "",
        phone: "",
        letter: "",
      },
    ])
  }

  // Remove reference
  const removeReference = (index: number) => {
    const newRefs = [...value]
    newRefs.splice(index, 1)
    onChange(newRefs)
  }

  // Update reference
  const updateReference = (index: number, field: string, newValue: any) => {
    const newRefs = [...value]
    newRefs[index] = {
      ...newRefs[index],
      [field]: newValue,
    }
    onChange(newRefs)
  }

  if (!requiresReferences) {
    return null
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>References</span>
          <div className="flex items-center gap-2">
            {isRequired ? <Badge variant="destructive">Required</Badge> : <Badge variant="outline">Optional</Badge>}

            {minReferences > 0 && <Badge variant="secondary">Min: {minReferences}</Badge>}

            {maxReferences > 0 && <Badge variant="secondary">Max: {maxReferences}</Badge>}
          </div>
        </CardTitle>
        <CardDescription>Provide details of people who can vouch for your character and abilities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {value.length === 0 ? (
          <div className="border border-dashed rounded-md p-8 text-center">
            <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No references added yet</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={addReference}>
              <Plus className="h-4 w-4 mr-1" />
              Add Reference
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {value.map((ref, index) => (
              <div key={ref.id || index} className="border rounded-md p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Reference #{index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-destructive"
                    onClick={() => removeReference(index)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>

                <Separator />

                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`ref-${index}-name`}>Full Name</Label>
                      <Input
                        id={`ref-${index}-name`}
                        value={ref.name || ""}
                        onChange={(e) => updateReference(index, "name", e.target.value)}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`ref-${index}-title`}>Title/Position</Label>
                      <Input
                        id={`ref-${index}-title`}
                        value={ref.title || ""}
                        onChange={(e) => updateReference(index, "title", e.target.value)}
                        placeholder="e.g. Professor, Manager"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`ref-${index}-organization`}>Organization/Institution</Label>
                      <Input
                        id={`ref-${index}-organization`}
                        value={ref.organization || ""}
                        onChange={(e) => updateReference(index, "organization", e.target.value)}
                        placeholder="Enter organization name"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`ref-${index}-relationship`}>Relationship to You</Label>
                      <Input
                        id={`ref-${index}-relationship`}
                        value={ref.relationship || ""}
                        onChange={(e) => updateReference(index, "relationship", e.target.value)}
                        placeholder="e.g. Teacher, Supervisor"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`ref-${index}-email`}>Email Address</Label>
                      <Input
                        id={`ref-${index}-email`}
                        type="email"
                        value={ref.email || ""}
                        onChange={(e) => updateReference(index, "email", e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`ref-${index}-phone`}>Phone Number</Label>
                      <Input
                        id={`ref-${index}-phone`}
                        value={ref.phone || ""}
                        onChange={(e) => updateReference(index, "phone", e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`ref-${index}-letter`}>Reference Letter (Optional)</Label>
                    <Textarea
                      id={`ref-${index}-letter`}
                      value={ref.letter || ""}
                      onChange={(e) => updateReference(index, "letter", e.target.value)}
                      placeholder="Paste the content of your reference letter here, or upload as a document in the Documents section"
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {value.length < maxReferences && (
          <Button variant="outline" className="w-full mt-2" onClick={addReference}>
            <Plus className="h-4 w-4 mr-1" />
            Add Reference
          </Button>
        )}

        {isRequired && minReferences > 0 && value.length < minReferences && (
          <p className="text-sm text-amber-500 flex items-center gap-1.5 mt-2">
            <Badge variant="outline" className="text-amber-500 border-amber-500">
              Required
            </Badge>
            Please add at least {minReferences} reference{minReferences > 1 ? "s" : ""}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
