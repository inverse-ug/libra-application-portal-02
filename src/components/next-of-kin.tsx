"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NextOfKinProps {
  scheme: any;
  value: any;
  onChange: (value: any) => void;
  errors?: Record<string, string>;
  className?: string;
}

export function NextOfKin({
  scheme,
  value,
  onChange,
  errors = {},
  className,
}: NextOfKinProps) {
  // Get next of kin requirements from scheme
  const kinConfig = scheme?.schemeFields?.kin || {};
  const reqKin = kinConfig?.reqKin !== "no";
  const isRequired = kinConfig?.reqKin === "req";

  const requiresName = kinConfig?.reqKinName;
  const requiresRelationship = kinConfig?.reqKinRel;
  const requiresContact = kinConfig?.reqKinContact;
  const requiresAddress = kinConfig?.reqKinAddr;

  // Handle next of kin changes
  const handleChange = (field: string, newValue: any) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  if (!reqKin) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Next of Kin</span>
          {isRequired ? (
            <Badge variant="destructive">Required</Badge>
          ) : (
            <Badge variant="outline">Optional</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Provide details of your next of kin or emergency contact
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {requiresName && (
            <div className="space-y-3">
              <Label
                htmlFor="kin-name"
                className={errors.name ? "text-destructive" : ""}>
                Full Name{" "}
                {isRequired && requiresName && (
                  <span className="text-destructive">*</span>
                )}
              </Label>
              <Input
                id="kin-name"
                value={value?.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter full name"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm font-medium text-destructive">
                  {errors.name}
                </p>
              )}
            </div>
          )}

          {requiresRelationship && (
            <div className="space-y-3">
              <Label
                htmlFor="kin-relationship"
                className={errors.relationship ? "text-destructive" : ""}>
                Relationship{" "}
                {isRequired && requiresRelationship && (
                  <span className="text-destructive">*</span>
                )}
              </Label>
              <Select
                value={value?.relationship || ""}
                onValueChange={(val) => handleChange("relationship", val)}>
                <SelectTrigger
                  id="kin-relationship"
                  className={errors.relationship ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem id="parent" value="parent">
                    Parent
                  </SelectItem>
                  <SelectItem id="spouse" value="spouse">
                    Spouse
                  </SelectItem>
                  <SelectItem id="sibling" value="sibling">
                    Sibling
                  </SelectItem>
                  <SelectItem id="child" value="child">
                    Child
                  </SelectItem>
                  <SelectItem id="relative" value="relative">
                    Other Relative
                  </SelectItem>
                  <SelectItem id="guardian" value="guardian">
                    Guardian
                  </SelectItem>
                  <SelectItem id="friend" value="friend">
                    Friend
                  </SelectItem>
                  <SelectItem id="other" value="other">
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.relation && (
                <p className="text-sm font-medium text-destructive">
                  {errors.relationship}
                </p>
              )}
            </div>
          )}

          {requiresContact && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label
                  htmlFor="kin-phone"
                  className={errors.phone ? "text-destructive" : ""}>
                  Phone Number{" "}
                  {isRequired && requiresContact && (
                    <span className="text-destructive">*</span>
                  )}
                </Label>
                <Input
                  id="kin-phone"
                  value={value?.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.phone}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <Label htmlFor="kin-email">Email Address</Label>
                <Input
                  id="kin-email"
                  type="email"
                  value={value?.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
            </div>
          )}

          {requiresAddress && (
            <div className="space-y-3">
              <Label
                htmlFor="kin-address"
                className={errors.address ? "text-destructive" : ""}>
                Address{" "}
                {isRequired && requiresAddress && (
                  <span className="text-destructive">*</span>
                )}
              </Label>
              <Input
                id="kin-address"
                value={value?.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Enter address"
                className={errors.address ? "border-destructive" : ""}
              />
              {errors.address && (
                <p className="text-sm font-medium text-destructive">
                  {errors.address}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
