"use client";

import React from "react";
import {
  LayoutDashboard,
  Layers,
  Users,
  Calendar,
  ReceiptText,
  Tags,           // Fee Types icon
  CreditCard,     // Fee Collection icon (future)
  FileSpreadsheet, // Fee Reports icon (future)
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

const sidebarLinks = [
  { 
    title: "Dashboard", 
    href: "/fees", 
    icon: LayoutDashboard 
  },
  
  { 
    title: "Salary Components", 
    href: "/fees/salary-components", 
    icon: Layers 
  },
  { 
    title: "Staff Salary", 
    href: "/fees/staff-salary", 
    icon: Users 
  },
  { 
    title: "Generate Salary", 
    href: "/fees/generate-salary", 
    icon: ReceiptText 
  },
  { 
    title: "Academic Year", 
    href: "/fees/academic-year", 
    icon: Calendar 
  },
  { 
    title: "Fee Types",           
    href: "/fees/fee-types",      
    icon: Tags 
  },
  { title: "Fee Structure", href: "/fees/fee-structure", icon: LayoutDashboard },
  { title: "Genrate Fee", href: "/fees/Genrate-Fees", icon: LayoutDashboard }
];

export default function FeesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout roleTitle="Fees" sidebarLinks={sidebarLinks}>
      {children}
    </DashboardLayout>
  );
}



