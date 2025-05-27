"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function ShortCourseCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}>
      <Card className="overflow-hidden border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 shadow-md">
        <CardHeader className="">
          <div className="flex flex-col sm:flex-row text-center sm:text-start items-center gap-2">
            <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-blue-700 dark:text-blue-400">
                Short Courses Available
              </CardTitle>
              <CardDescription>
                Enhance your skills with our specialized short courses
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 hidden lg:block">
            <p className="text-sm">
              Our short courses are designed to provide practical skills in a
              condensed timeframe. Perfect for professionals looking to upskill
              or students wanting to complement their education.
            </p>
            <ul className="text-sm space-y-1 list-disc pl-5 text-muted-foreground">
              <li>Flexible duration options (3-6 months)</li>
              <li>Industry-relevant curriculum</li>
              <li>Hands-on practical training</li>
              <li>Affordable pricing options</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            asChild
            className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg">
            <Link href="/short-courses">
              Browse Short Courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
