"use client";

import { BookOpen, Calendar, CreditCard, Bell } from "lucide-react";
import { motion } from "framer-motion";

export default function ParentDashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Parent Dashboard
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Stay updated with your child's school activities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Attendance",
            value: "92%",
            icon: Calendar,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Subjects",
            value: "8",
            icon: BookOpen,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Fee Status",
            value: "Paid",
            icon: CreditCard,
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
          {
            label: "Notices",
            value: "3",
            icon: Bell,
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4"
            >
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 leading-tight">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Child Info Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Child Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Student Name", value: "Ali Hassan" },
            { label: "Class", value: "Grade 7 - Section A" },
            { label: "Roll Number", value: "2024-0042" },
            { label: "Date of Birth", value: "12 March 2012" },
            { label: "School", value: "Sunrise Public School" },
            { label: "Academic Year", value: "2024 - 2025" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
            >
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {item.label}
              </p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Notices */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Notices
        </h3>
        <ul className="space-y-3">
          {[
            {
              title: "Parent-Teacher Meeting",
              date: "20 Jan 2025",
              color: "bg-blue-500",
            },
            {
              title: "Winter Break Schedule",
              date: "15 Jan 2025",
              color: "bg-emerald-500",
            },
            {
              title: "Fee Submission Reminder",
              date: "10 Jan 2025",
              color: "bg-orange-500",
            },
          ].map((notice, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${notice.color} shrink-0`}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {notice.title}
                </p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {notice.date}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}