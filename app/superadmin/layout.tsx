"use client";
import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Users, LayoutDashboard , Sparkles  } from "lucide-react";

const sidebarLinks = [
  { title: "Dashboard", href: "/superadmin", icon: LayoutDashboard },
  { title: "Features", href: "/superadmin/fetures_select", icon: Sparkles },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout roleTitle="Super Admin" sidebarLinks={sidebarLinks}>
      {children}
    </DashboardLayout>
  );
}

