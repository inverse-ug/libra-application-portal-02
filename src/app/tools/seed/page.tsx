"use client";

import { seedDatabase } from "@/app/actions/seed-data";

export default function SeedPage() {
  const handleClick = async () => {
    if (!confirm("WARNING: This will DELETE ALL DATA and reseed. Continue?"))
      return;

    try {
      const result = await seedDatabase();
      alert(`Seeding complete: ${result.message}`);
    } catch (error) {
      alert(
        `Seeding failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  return (
    <div className="grid place-items-center min-h-screen">
      <button
        onClick={handleClick}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow">
        SEED DATABASE
      </button>
    </div>
  );
}
