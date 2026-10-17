import React, { Suspense } from "react";
import WorkspaceDashboard, { DashboardSkeleton } from "../WorkspaceDashboard";

interface PageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function DynamicWorkspaceDashboardPage({ params }: PageProps) {
  const { workspaceId } = await params;
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <WorkspaceDashboard initialWorkspaceId={workspaceId} />
    </Suspense>
  );
}
