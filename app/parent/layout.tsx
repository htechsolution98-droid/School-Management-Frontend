"use client";
import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FileText, LayoutDashboard, School } from "lucide-react";

const sidebarLinks = [
  { title: "Dashboard", href: "/parent", icon: LayoutDashboard },
//   { title: "Admission Form", href: "/principal/admission-form", icon: FileText },
//   { title: "Classes", href: "/principal/classes", icon: School },
];

export default function PrincipalLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout roleTitle="Parent" sidebarLinks={sidebarLinks}>
      {children}
    </DashboardLayout>
  );
}
