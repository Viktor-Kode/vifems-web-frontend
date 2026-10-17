import React, { Suspense } from "react";
import WorkspaceDashboard, { DashboardSkeleton } from "./WorkspaceDashboard";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <WorkspaceDashboard />
    </Suspense>
  );
}
