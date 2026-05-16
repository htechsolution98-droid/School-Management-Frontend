// app/student/layout.tsx
"use client";

import React from "react";
import { LayoutDashboard, History, Users, BookOpen } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/student",
    icon: LayoutDashboard,
  },
  {
    title: "Attendance History",
    href: "/student/attendance-history",
    icon: History,
  },
  {
    title: "Student Attendance",
    href: "/student/attendance",
    icon: Users,
  },
  {
    title: "Homework",
    href: "/student/homework",
    icon: BookOpen,
  },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout roleTitle="Student" sidebarLinks={sidebarLinks}>
      {children}
    </DashboardLayout>
  );
}