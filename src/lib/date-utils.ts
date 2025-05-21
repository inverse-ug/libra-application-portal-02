export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function calculateDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const today = new Date();

  // Reset time to midnight for accurate day calculation
  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

export function getSchemeStatus(
  startDate: string,
  endDate: string
): "upcoming" | "ongoing" | "ended" {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();

  if (today < start) return "upcoming";
  if (today > end) return "ended";
  return "ongoing";
}

export function getTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export function getGreeting(
  timeOfDay: "morning" | "afternoon" | "evening" | "night",
  name?: string
): string {
  const greetings = {
    morning: [
      "Good morning",
      "Rise and shine",
      "Top of the morning to you",
      "Hello, sunshine",
      "Have a great morning",
    ],
    afternoon: [
      "Good afternoon",
      "Hope you're having a nice day",
      "Afternoon greetings",
      "Having a good day?",
      "Wishing you a productive afternoon",
    ],
    evening: [
      "Good evening",
      "Hope you had a great day",
      "Evening greetings",
      "Winding down for the day?",
      "Pleasant evening to you",
    ],
    night: [
      "Good night",
      "Burning the midnight oil?",
      "Working late tonight?",
      "Hope you're having a peaceful night",
      "Wishing you a restful night",
    ],
  };

  // Get a random greeting from the appropriate time of day
  const randomIndex = Math.floor(Math.random() * greetings[timeOfDay].length);
  const greeting = greetings[timeOfDay][randomIndex];

  return name ? `${greeting}, ${name}!` : `${greeting}!`;
}
