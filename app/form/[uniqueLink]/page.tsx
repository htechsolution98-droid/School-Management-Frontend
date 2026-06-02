"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdmissionRedirectPage({
  params,
}: {
  params: Promise<{ uniqueLink: string }>;
}) {
  const { uniqueLink } = use(params);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const response = await fetch(
          `https://school-management-system-sms-z8kv.onrender.com/api/admission/${uniqueLink}/`
        );

        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(data?.message || "The link you followed may be broken or expired.");
          setIsLoading(false);
          return;
        }

        localStorage.setItem("school_id", data.school_id.toString());
        localStorage.setItem("school_slug", data.school_slug);

        window.location.href = "/signup";
      } catch (error) {
        console.error(error);
        setErrorMessage("We encountered a technical issue. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchSchoolData();
  }, [uniqueLink]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden px-4">
      {/* Decorative Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-100 rounded-full blur-[120px] opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[480px]"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[2.5rem] p-8 md:p-12 text-center">

          {isLoading ? (
            <div className="py-10">
              <div className="relative size-20 mx-auto mb-8">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full"
                />
              </div>
              <h1 className="text-2xl font-black text-slate-900 mapping-tight">Validating Link...</h1>
              <p className="text-slate-500 mt-2 font-medium">Please wait while we set up your application.</p>
            </div>
          ) : (
            <>
              {/* Error Icon */}
              <div className="size-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <AlertCircle className="text-rose-500" size={40} />
              </div>

              {/* Text Content */}
              <h1 className="text-3xl font-black text-slate-900 mapping-tight leading-tight">
                Oops! Link <span className="text-rose-500">Invalid</span>
              </h1>

              <div className="mt-4 p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                <p className="text-slate-600 text-sm font-semibold leading-relaxed">
                  {errorMessage}
                </p>
              </div>

              <p className="text-slate-400 mt-6 text-sm font-medium">
                If you believe this is a mistake, please contact your school administrator for a new admission link.
              </p>

              {/* Action Buttons */}
              <div className="mt-10 flex flex-col gap-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl h-14 font-bold transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Try Again
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Brand Footer */}
        <p className="text-center mt-8 text-slate-400 text-xs font-bold uppercase mapping-[0.2em]">
          Powered by <span className="text-indigo-600">EduManage</span>
        </p>
      </motion.div>
    </div>
  );
}