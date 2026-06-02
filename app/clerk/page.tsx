"use client";

import { motion } from "framer-motion";

export default function ClerkDashboard() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md space-y-4"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#4F46E5]/20 bg-[#4F46E5]/10 text-[#4F46E5] shadow-sm">
          <span className="text-2xl font-bold">CL</span>
        </div>
        <h2 className="text-3xl font-bold mapping-tight text-gray-900">Welcome, Clerk!</h2>
        <p className="text-lg leading-relaxed text-gray-500">
          Your dashboard layout is ready. Soon you&apos;ll be able to manage daily administrative tasks, correspondence, and records here.
        </p>
      </motion.div>
    </div>
  );
}
