"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="COMPANY">
      <WorkspaceShell role="COMPANY">{children}</WorkspaceShell>
    </AuthGuard>
  );
}
