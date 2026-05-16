"use client";

import React from "react";
import { LayoutDashboard, ClipboardList, Users ,BookOpen } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

const sidebarLinks = [
  { title: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  {
    title: "Attendance History",
    href: "/teacher/attendance",
    icon: ClipboardList,
  },
  {
    title: "Student Attendance",
    href: "/teacher/student-attendance",
    icon: Users,
  },
  {
  title: "Homework",
  href: "/teacher/Homework",
  icon: BookOpen,
},
];

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout roleTitle="Teacher" sidebarLinks={sidebarLinks}>
      {children}
    </DashboardLayout>
  );
}
