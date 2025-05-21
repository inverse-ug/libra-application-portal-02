import { getGreeting, getTimeOfDay } from "@/lib/date-utils";
import HomeContent from "./HomeContent";
import { Metadata } from "next";
import { getCurrentApplicant } from "@/lib/user-utils";

export default async function Home() {
  const user = await getCurrentApplicant();

  // Server-side greeting
  const timeOfDay = getTimeOfDay();
  const greeting = getGreeting(timeOfDay, user?.name?.split(" ")[0]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-xl sm:text-3xl">{greeting}</h1>
        <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
          Here are some of the latest updates and information.
        </p>
      </div>

      <HomeContent userId={user?.id ? String(user.id) : undefined} />
    </div>
  );
}

export const metadata: Metadata = {
  title: "Overview | Libra Vocational and Business Institute",
  description: "Application Portal for Libra Vocational and Business Institute",
};
