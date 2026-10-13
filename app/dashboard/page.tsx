import React, { Suspense } from "react";
import WorkspaceDashboard from "./WorkspaceDashboard";

export default function DashboardIndexPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
          Loading dashboard…
        </div>
      }
    >
      <WorkspaceDashboard />
    </Suspense>
  );
}
