"use client";
import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Users, LayoutDashboard } from "lucide-react";

const sidebarLinks = [
  { title: "Staff", href: "/trustee", icon: Users },
  // { title: "Overview", href: "/trustee/dashboard", icon: LayoutDashboard },
];

export default function TrusteeLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout roleTitle="Trustee" sidebarLinks={sidebarLinks}>
      {children}
    </DashboardLayout>
  );
}
