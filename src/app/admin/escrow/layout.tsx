import { notFound } from "next/navigation";
import { FEATURE_PAYMENTS_ENABLED } from "@/lib/featureFlags";

export default function AdminEscrowLayout({ children }: { children: React.ReactNode }) {
  if (!FEATURE_PAYMENTS_ENABLED) notFound();
  return children;
}
