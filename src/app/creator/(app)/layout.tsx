"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <WorkspaceShell role="CREATOR">{children}</WorkspaceShell>
    </AuthGuard>
  );
}
