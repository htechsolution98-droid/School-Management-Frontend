"use client";

import React from "react";
import { LayoutDashboard, FileText, Upload, HelpCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

const sidebarLinks = [
  { title: "Dashboard", href: "/user", icon: LayoutDashboard },
    // { title: "Admission Form", href: "/user/admission", icon: FileText },
    // { title: "Upload Documents", href: "/user/documents", icon: Upload },
    // { title: "Support", href: "/user/support", icon: HelpCircle },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout roleTitle="Applicant" sidebarLinks={sidebarLinks}>
      {children}
    </DashboardLayout>
  );
}
