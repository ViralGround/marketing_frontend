import { notFound } from "next/navigation";
import { FEATURE_INSTAGRAM_ENABLED } from "@/lib/featureFlags";

export default function AdminAnalyticsLayout({ children }: { children: React.ReactNode }) {
  if (!FEATURE_INSTAGRAM_ENABLED) notFound();
  return children;
}
