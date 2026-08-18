"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="CREATOR">
      <WorkspaceShell role="CREATOR">{children}</WorkspaceShell>
    </AuthGuard>
  );
}
