import { redirect } from "next/navigation";

// Legacy route — all CTAs now link directly to /signup.
// Keep this redirect as a fallback for bookmarked or external links.
export default function OnboardingPage() {
  redirect("/signup");
}
