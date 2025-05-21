"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader, MapPin, Building } from "lucide-react";
import { Separator } from "../ui/separator";
import { schoolSelectionSchema } from "../../lib/validation";
import { useState, useEffect } from "react";
import { Label } from "../ui/label";
// import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface School {
  id: string;
  name: string;
  region: string;
  district: string;
  type: string;
}
interface SchoolSelectionStepProps {
  formData: Record<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >;
  updateFormData: (
    key: string,
    value: // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  ) => void;
  onContinue: () => void;
  onBack?: () => void;
}

export default function SchoolSelectionStep({
  formData,
  updateFormData,
  onContinue,
}: SchoolSelectionStepProps) {
  // const supabase = createClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [districts, setDistricts] = useState<string[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [regions, setRegions] = useState<string[]>([]);
  const [schoolTypes, setSchoolTypes] = useState<string[]>([]);
  const [districtsByRegion, setDistrictsByRegion] = useState<
    Record<string, string[]>
  >({});

  const form = useForm<z.infer<typeof schoolSelectionSchema>>({
    resolver: zodResolver(schoolSelectionSchema),
    defaultValues: {
      schoolId: formData.schoolId || "",
    },
  });

  // Fetch regions, districts, and school types on component mount
  // useEffect(() => {
  //   const fetchInitialData = async () => {
  //     try {
  //       // 1. Define precise response interfaces
  //       interface RegionResponse {
  //         name: string;
  //       }

  //       // District response has regions as an array (note the [] after regions)
  //       interface DistrictResponse {
  //         name: string;
  //         regions: { name: string }[] | null; // Array of regions
  //       }

  //       interface SchoolTypeResponse {
  //         name: string;
  //       }

  //       // 2. Fetch regions
  //       const { data: regionData, error: regionError } = await supabase
  //         .from("regions")
  //         .select("name");

  //       if (regionError) throw regionError;
  //       const regionNames = (regionData as RegionResponse[]).map((r) => r.name);
  //       setRegions(regionNames);

  //       // 3. Fetch districts with region relationships
  //       const { data: districtData, error: districtError } = await supabase
  //         .from("districts")
  //         .select("name, regions(name)");

  //       if (districtError) throw districtError;

  //       const districtMap: Record<string, string[]> = {};
  //       (districtData as DistrictResponse[]).forEach((district) => {
  //         // Access first region if exists (since regions is an array)
  //         const regionName = district.regions?.[0]?.name;
  //         if (regionName) {
  //           districtMap[regionName] = districtMap[regionName] || [];
  //           districtMap[regionName].push(district.name);
  //         }
  //       });
  //       setDistrictsByRegion(districtMap);

  //       // 4. Fetch school types
  //       const { data: typeData, error: typeError } = await supabase
  //         .from("school_types")
  //         .select("name");

  //       if (typeError) throw typeError;
  //       const typeNames = (typeData as SchoolTypeResponse[]).map((t) => t.name);
  //       setSchoolTypes(typeNames);
  //     } catch (error) {
  //       console.error("Failed to fetch initial data:", error);
  //       toast.error(
  //         error instanceof Error
  //           ? error.message
  //           : "Failed to load initial data. Please refresh the page."
  //       );
  //     }
  //   };

  //   fetchInitialData();
  // }, [supabase]);

  // Update districts when region changes
  useEffect(() => {
    if (selectedRegion && selectedRegion !== "all") {
      setDistricts(districtsByRegion[selectedRegion] || []);
      setSelectedDistrict("all");
    } else {
      setDistricts([]);
      setSelectedDistrict("all");
    }
  }, [selectedRegion, districtsByRegion]);

  // Fetch schools based on filters
  // useEffect(() => {
  //   const loadSchools = async () => {
  //     setIsLoading(true);
  //     try {
  //       // Define the expected response type
  //       interface SchoolResponse {
  //         id: string;
  //         name: string;
  //         regions: { name: string } | null;
  //         districts: { name: string } | null;
  //         school_types: { name: string } | null;
  //       }

  //       // Start with base query using the new typing approach
  //       let query = supabase
  //         .from("schools")
  //         .select(
  //           "id, name, regions(name), districts(name), school_types(name)"
  //         );

  //       // Apply filters (same as before)
  //       if (selectedRegion !== "all") {
  //         query = query.eq("regions.name", selectedRegion);
  //       }
  //       // ... other filters ...

  //       const { data, error } = await query;

  //       if (error) throw error;

  //       // Type assertion if needed
  //       const schoolData = data as unknown as SchoolResponse[];

  //       const transformedSchools = (schoolData || []).map((school) => ({
  //         id: school.id,
  //         name: school.name,
  //         region: school.regions?.name || "",
  //         district: school.districts?.name || "",
  //         type: school.school_types?.name || "",
  //       }));

  //       setFilteredSchools(transformedSchools);
  //     } catch (error) {
  //       console.error("Failed to fetch schools:", error);
  //       toast.error("Failed to load schools");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   const timeoutId = setTimeout(loadSchools, 300);
  //   return () => clearTimeout(timeoutId);
  // }, [searchTerm, selectedRegion, selectedDistrict, selectedType, supabase]);

  const selectSchool = (school: School) => {
    form.setValue("schoolId", school.id);
    updateFormData("schoolId", school.id);
    updateFormData("schoolName", school.name);
    updateFormData("schoolRegion", school.region);
    updateFormData("schoolDistrict", school.district);
    updateFormData("schoolType", school.type);
  };

  const onSubmit = async () => {
    const toastId = toast.loading("Saving your school selection...");
    // const supabase = createClient();

    // try {
    //   // Get current user with proper error handling
    //   const {
    //     data: { user },
    //     error: authError,
    //   } = await supabase.auth.getUser();

    //   if (authError) {
    //     throw new Error("Authentication error: " + authError.message);
    //   }

    //   if (!user) {
    //     throw new Error("No authenticated user found");
    //   }

    //   // Update user profile with RLS enforcement
    //   const { error } = await supabase
    //     .from("users")
    //     .update({
    //       school_id: form.getValues("schoolId"),
    //       onboarding_step: "school_selection_completed",
    //     })
    //     .eq("id", user.id)
    //     .select()
    //     .single();

    //   if (error) {
    //     throw new Error("Database update failed: " + error.message);
    //   }

    //   toast.success("School selection saved successfully!", { id: toastId });
    //   onContinue();
    // } catch (error) {
    //   toast.error(
    //     error instanceof Error
    //       ? error.message
    //       : "Failed to save school selection",
    //     { id: toastId }
    //   );
    // }
  };

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Select Your School
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Find and select the institution you work for
          </p>
        </div>
        <div className="space-y-4">
          <div className="relative">
            <Input
              placeholder="Search schools by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="region" className="text-xs font-medium">
                Region
              </Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger id="region" className="h-9">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="district" className="text-xs font-medium">
                District
              </Label>
              <Select
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
                disabled={selectedRegion === "all" || districts.length === 0}>
                <SelectTrigger id="district" className="h-9">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {districts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="schoolType" className="text-xs font-medium">
                School Type
              </Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger id="schoolType" className="h-9">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {schoolTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Separator orientation="horizontal" className="my-4" />
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-medium text-muted-foreground flex items-center">
            {isLoading ? (
              <>
                <Loader className="h-3 w-3 mr-2 animate-spin" />
                Loading schools...
              </>
            ) : filteredSchools.length === 0 ? (
              "No schools found matching your criteria"
            ) : (
              `${filteredSchools.length} schools found`
            )}
          </div>
          {filteredSchools.length > 0 && !isLoading && (
            <div className="text-xs text-muted-foreground">
              Click to select a school
            </div>
          )}
        </div>
        <FormField
          control={form.control}
          name="schoolId"
          render={() => (
            <FormItem>
              <FormControl>
                <div className="space-y-2">
                  <div className="max-h-64 overflow-y-auto p-1 space-y-1">
                    {!isLoading &&
                      filteredSchools.map((school) => (
                        <Card
                          key={school.id}
                          className={`cursor-pointer transition-all hover:bg-accent/30 ${
                            form.getValues("schoolId") === school.id
                              ? "ring-1 ring-primary bg-primary/5"
                              : ""
                          }`}
                          onClick={() => selectSchool(school)}>
                          <CardContent className="p-3 flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="font-medium text-sm">
                                {school.name}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground space-x-3">
                                <span className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {school.district}, {school.region}
                                </span>
                                <span className="flex items-center">
                                  <Building className="h-3 w-3 mr-1" />
                                  {school.type}
                                </span>
                              </div>
                            </div>
                            {form.getValues("schoolId") === school.id && (
                              <div className="text-primary">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    {isLoading && (
                      <div className="py-8 text-center flex flex-col items-center">
                        <Loader className="h-6 w-6 animate-spin mb-2 text-primary/70" />
                        <p className="text-sm text-muted-foreground">
                          Fetching schools...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full mt-4"
          disabled={!form.getValues("schoolId") || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </form>
    </Form>
  );
}
