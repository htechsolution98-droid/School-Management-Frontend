"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Script from "next/script";
import { toast } from "sonner";
import {
  User,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  CreditCard,
  CheckCircle2,
  Upload,
  Sparkles,
  Shield,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
  getTempUsers,
  getPublicFormFields,
  createSubmission,
  updateSubmission,
  getClasses,
  createRazorOrder,
  verifyRazorPayment,
  createOfflinePayment,
} from "@/lib/forms";
import { submitDocuments } from "@/lib/forms";

// ────────────────────────────────────────────
// Static Data─
// ─────────────────────────────────────────────

const PARENT_NAME = "Future Student";

const STEPS = [
  {
    id: 1,
    label: "Student Details",
    icon: User,
    title: "Student Details",
    desc: "Fill in the primary details for admission.",
  },
  {
    id: 2,
    label: "Documents",
    icon: Upload,
    title: "Upload Documents",
    desc: "Upload scans (PDF/JPG, max 5 MB each).",
  },
  {
    id: 3,
    label: "Review & Pay",
    icon: CreditCard,
    title: "Review & Submit",
    desc: "Everything looks good! Finalize your payment below.",
  },
];

// ─────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────
// REPLACE the useEffect + return in AdmissionPortal:

export default function AdmissionPortal() {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>(null);
  const [selectedChild, setSelectedChild] = useState<null | any>(null);

  const fetchData = async () => {
    try {
      const data = await getTempUsers();
      const formattedData = data.map((item: any) => ({
        id: item.admission_number,
        admission_number: item.admission_number,
        name:
          item.sections?.[0]?.field_values?.find(
            (f: any) => f.field_label === "Student Full Name",
          )?.value || "Student",
        grade: `Form ${item.form}`,
        status: item.status,
        lastUpdated: "Recently",
        fee_data: item.fee_data ?? null,
        progress: item.fee_data
          ? 100
          : item.sections?.some((s: any) => s?.field_values?.length > 0)
            ? 65
            : 35,
        sections: item.sections,
      }));
      setChildren(formattedData);
      const formResponse = await getPublicFormFields();
      setFormData(formResponse);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ handleBack is now at the TOP LEVEL of AdmissionPortal — not inside handlePaymentSuccess
  const handleBack = async () => {
    setSelectedChild(null);
    await fetchData();
  };

  const handlePaymentSuccess = (paidAdmissionNumber: string) => {
    // Optimistically update the paid student
    setChildren((prev) =>
      prev.map((c) =>
        c.admission_number === paidAdmissionNumber
          ? {
              ...c,
              fee_data: {
                amount: 0,
                payment_mode: "online",
                paid_at: new Date().toISOString(),
              },
              progress: 100,
            }
          : c,
      ),
    );

    // Go back to dashboard
    setSelectedChild(null);

    // Re-fetch in background to sync with server
    setTimeout(async () => {
      try {
        const data = await getTempUsers();
        const formattedData = data.map((item: any) => ({
          id: item.admission_number,
          admission_number: item.admission_number,
          name:
            item.sections?.[0]?.field_values?.find(
              (f: any) => f.field_label === "Student Full Name",
            )?.value || "Student",
          grade: `Form ${item.form}`,
          status: item.status,
          fee_data: item.fee_data,
          lastUpdated: "Recently",
          progress:
            item.fee_data
              ? 100
              : item.sections?.some((s: any) => s?.field_values?.length > 0)
                ? 65
                : 35,
          sections: item.sections,
        }));
        setChildren(
          formattedData.map((fresh: any) => {
            if (fresh.admission_number === paidAdmissionNumber) {
              return {
                ...fresh,
                fee_data: fresh.fee_data ?? { payment_status: "completed" },
                progress: 100,
              };
            }
            return fresh;
          }),
        );
      } catch (error) {
        console.log(error);
      }
    }, 1500);
  };

  return (
    <div
      className={`w-full bg-slate-50 flex flex-col font-sans ${selectedChild ? "h-screen overflow-hidden" : "min-h-screen"}`}
    >
      <AnimatePresence mode="wait">
        {!selectedChild ? (
          <ChildrenList
            key="list"
            onSelect={setSelectedChild}
            children={children}
          />
        ) : (
          <MultiStepForm
            key="form"
            child={selectedChild}
            formData={formData}
            onBack={handleBack} // now defined above, no error
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// Avatar color palette
// ─────────────────────────────────────────────
const AVATAR_COLORS = [
  {
    bg: "bg-indigo-600",
    light: "bg-indigo-100",
    text: "text-indigo-600",
    bar: "bg-indigo-600",
    glow: "rgba(99,102,241,0.18)",
  },
];

const STATUS_STYLES: Record<string, string> = {
  Incomplete: "bg-amber-50 text-amber-600 border border-amber-200",
  "Action Required": "bg-rose-50 text-rose-600 border border-rose-200",
  "Under Review": "bg-emerald-50 text-emerald-600 border border-emerald-200",
  Submitted: "bg-indigo-50 text-indigo-600 border border-indigo-200",
  pending: "bg-amber-50 text-amber-600 border border-amber-200", // ← ADD
  completed: "bg-emerald-50 text-emerald-600 border border-emerald-200", // ← ADD
};

// ─────────────────────────────────────────────
// ChildrenList
// ─────────────────────────────────────────────
function ChildrenList({
  onSelect,
  children,
}: {
  onSelect: (c: any) => void;
  children: any[];
}) {
  const [receiptChild, setReceiptChild] = useState<any>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex-1 w-full"
    >
      {/* ── RECEIPT MODAL ── */}
      <AnimatePresence>
        {receiptChild && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReceiptChild(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Modal header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-6 text-white">
                  <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
                  <div className="absolute right-10 -bottom-8 w-20 h-20 rounded-full bg-white/10" />
                  <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30">
                      <CheckCircle2 size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="font-black text-lg leading-tight">
                        Payment Confirmed!
                      </p>
                      <p className="text-emerald-100 text-xs font-medium mt-0.5">
                        Admission fee received successfully
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modal body */}
                <div className="px-7 py-6 space-y-4">
                  {/* Student info */}
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Student
                      </span>
                      <span className="text-sm font-black text-slate-800">
                        {receiptChild.name}
                      </span>
                    </div>
                    <div className="h-px bg-slate-200" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Admission No.
                      </span>
                      <span className="text-sm font-black text-indigo-600 font-mono">
                        {receiptChild.admission_number || receiptChild.id}
                      </span>
                    </div>
                    <div className="h-px bg-slate-200" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Class
                      </span>
                      <span className="text-sm font-black text-slate-800">
                        {receiptChild.grade}
                      </span>
                    </div>
                    <div className="h-px bg-slate-200" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Status
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        ✓ Paid
                      </span>
                    </div>
                  </div>

                  {/* Info note */}
                  <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3">
                    <Shield
                      size={15}
                      className="text-indigo-500 shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-indigo-600 font-medium leading-relaxed">
                      Your official receipt has been generated. Download it for
                      your records or collect it from the school office.
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-1">
                    <Button
                      variant="outline"
                      onClick={() => setReceiptChild(null)}
                      className="flex-1 rounded-2xl h-11 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 text-sm"
                    >
                      Close
                    </Button>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1"
                    >
                      <Button
                        onClick={() => {
                          window.open(
                            `/receipts/${receiptChild.admission_number || receiptChild.id}.pdf`,
                            "_blank",
                          );
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-11 font-bold shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 text-sm transition-all"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        Download Receipt
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full px-6 md:px-10 pt-8 pb-6 border-b border-slate-100 bg-white"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full mb-3"
            >
              <motion.span
                animate={{ rotate: [0, 15, -10, 0] }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Sparkles size={11} />
              </motion.span>
              Admission Portal
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.15,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight"
            >
              Welcome back,{" "}
              <motion.span
                className="text-indigo-600 inline-block"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {PARENT_NAME}!
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="text-slate-500 mt-1.5 text-base font-medium"
            >
              Select a profile below to continue the application process.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="flex gap-3 shrink-0"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() =>
                  onSelect({
                    id: `NEW-${Date.now()}`,
                    name: "New Student",
                    grade: "Form 1",
                    status: "Incomplete",
                    lastUpdated: "Just now",
                    progress: 0,
                  })
                }
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-11 px-5 font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all"
              >
                New Application <ArrowRight size={15} />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.35 }}
        className="w-full px-6 md:px-10 py-3.5 bg-slate-50/60 border-b border-slate-100"
      >
        <div className="flex items-center gap-8 text-sm font-semibold text-slate-500">
          <span>
            <motion.span
              className="text-slate-900 font-black text-lg mr-1 tabular-nums"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {children.length}
            </motion.span>
            Active Applications
          </span>
        </div>
      </motion.div>

      {/* Cards */}
      <div className="w-full px-6 md:px-10 py-6 space-y-3">
        {children.map((child, i) => {
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const badgeClass =
            STATUS_STYLES[child.status] ??
            "bg-slate-100 text-slate-500 border border-slate-200";
          const isPaid = !!child.fee_data;

          return (
            <motion.div
              key={`${child.id}-${i}`}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: i * 0.08 + 0.35,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{
                y: -4,
                scale: 1.005,
                boxShadow: `0 20px 60px -12px ${color.glow}, 0 4px 16px -4px rgba(0,0,0,0.06)`,
                borderColor: isPaid
                  ? "rgba(16,185,129,0.2)"
                  : "rgba(99,102,241,0.2)",
              }}
              whileTap={{ scale: 0.995 }}
              onClick={() => {
                // ← KEY CHANGE: paid cards open receipt modal, not the form
                if (isPaid) {
                  setReceiptChild(child);
                  return;
                }
                const hasData = child?.sections?.some(
                  (s: any) => s?.field_values?.length > 0,
                );
                onSelect({
                  ...child,
                  currentStep: hasData ? 2 : 1,
                });
              }}
              className={`group bg-white border rounded-3xl p-5 cursor-pointer transition-colors duration-300 shadow-sm ${
                isPaid ? "border-emerald-200" : "border-slate-200"
              }`}
              style={{ willChange: "transform" }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: i * 0.08 + 0.5,
                    type: "spring",
                    stiffness: 300,
                  }}
                  className={`shrink-0 w-12 h-12 ${isPaid ? "bg-emerald-500" : color.bg} rounded-2xl flex items-center justify-center shadow-lg`}
                >
                  {isPaid ? (
                    <CheckCircle2 size={22} className="text-white" />
                  ) : (
                    <User size={24} className="text-white" />
                  )}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5 mb-1">
                    <h3 className="text-base md:text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {child.name}
                    </h3>
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 + 0.55 }}
                      className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${badgeClass}`}
                    >
                      {child.status}
                    </motion.span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap size={13} /> {child.grade}
                    </span>
                    <span className="font-mono text-[11px] text-slate-300 hidden sm:block">
                      {child.id}
                    </span>
                  </div>
                </div>

                <div className="hidden lg:block w-52">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-2">
                    <span>Application Progress</span>
                    <motion.span
                      className={`${isPaid ? "text-emerald-600" : color.text} font-black`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.08 + 0.7 }}
                    >
                      {child.progress}%
                    </motion.span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${child.progress}%` }}
                      transition={{
                        duration: 1.2,
                        delay: i * 0.08 + 0.6,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className={`h-full ${isPaid ? "bg-emerald-500" : color.bar} rounded-full`}
                    />
                  </div>
                </div>

                <motion.div whileHover={{ x: 3 }} className="shrink-0 ml-2">
                  {isPaid ? (
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 h-10 font-semibold text-sm flex items-center gap-2 shadow-md shadow-emerald-100 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReceiptChild(child); // ← open modal on button click too
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                      </svg>
                      Download Receipt
                    </Button>
                  ) : (
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 h-10 font-semibold text-sm flex items-center gap-2 shadow-md shadow-indigo-100 transition-all group-hover:shadow-indigo-200 group-hover:shadow-lg">
                      Open Application
                      <motion.span
                        animate={{ x: [0, 3, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.2,
                        }}
                      >
                        <ArrowRight size={14} />
                      </motion.span>
                    </Button>
                  )}
                </motion.div>
              </div>

              {/* Mobile progress bar */}
              <div className="mt-4 lg:hidden">
                <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1.5">
                  <span>Application Progress</span>
                  <span
                    className={`${isPaid ? "text-emerald-600" : color.text} font-black`}
                  >
                    {child.progress}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${child.progress}%` }}
                    transition={{
                      duration: 1.2,
                      delay: i * 0.08 + 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`h-full ${isPaid ? "bg-emerald-500" : color.bar} rounded-full`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
        <div className="h-4" />
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// MultiStepForm
// ─────────────────────────────────────────────
function MultiStepForm({
  child,
  formData,
  onBack,
  onPaymentSuccess, // ← ADD
}: {
  child: any;
  formData: any;
  onBack: () => void;
  onPaymentSuccess: (admissionNumber: string) => void; // ← ADD
}) {
  // If field_values exist, student has completed step 1, start at step 2
  const hasExistingData = child?.sections?.some(
    (s: any) => s?.field_values?.length > 0,
  );
  const [step, setStep] = useState(hasExistingData ? 2 : 1);

  const getInitialFormValues = () => {
    const values: any = {};
    child?.sections?.forEach((section: any) => {
      section?.field_values?.forEach((item: any) => {
        if (item.field && item.value !== undefined) {
          values[item.field] = item.value;
        }
      });
    });
    if (child?.savedFormValues) {
      Object.assign(values, child.savedFormValues);
    }
    return values;
  };
  const [formValues, setFormValues] = useState<any>(getInitialFormValues());
  const [docValues, setDocValues] = useState<any>({});
  const [docErrors, setDocErrors] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [docSubmitting, setDocSubmitting] = useState(false);

  const [applicationId, setApplicationId] = useState(
    child.admission_number || child.id,
  );

  const [paymentMode, setPaymentMode] = useState<"online" | "offline">(
    "online",
  );

  // CHANGE THIS in validateDocuments():
  const validateDocuments = () => {
    const newErrors: any = {};
    const docs = formData?.documents ?? formData?.document_fields ?? [];

    docs.forEach((doc: any) => {
      if (!docValues[doc.id]) {
        // ← ALL docs required now, no is_required check
        newErrors[doc.id] = true;
      }
    });

    setDocErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStepTwoSubmit = async () => {
    const isValid = validateDocuments();
    if (!isValid) return;

    try {
      setDocSubmitting(true);

      // Build documents array from docValues: { [fieldId]: File }
      const documents = Object.entries(docValues)
        .filter(([_, file]) => file instanceof File)
        .map(([fieldId, file]) => ({
          document_field: Number(fieldId),
          file: file as File,
        }));

      if (documents.length > 0) {
        const response = await submitDocuments({
          admission_number: applicationId,
          documents,
        });

        // alert(response.message);

        if (response?.message === "Documents uploaded successfully") {
          setStep(3);
        }
      }
    } catch (error) {
      console.error("Document submission failed:", error);

      alert(
        error instanceof Error ? error.message : "Document submission failed",
      );
    } finally {
      setDocSubmitting(false);
    }
  };

  // ✅ KEY FIX: sync formValues whenever child.sections loads
  useEffect(() => {
    const values: any = {};
    child?.sections?.forEach((section: any) => {
      section?.field_values?.forEach((item: any) => {
        if (item.field && item.value !== undefined) {
          values[item.field] = item.value;
        }
      });
    });
    if (child?.savedFormValues) {
      Object.assign(values, child.savedFormValues);
    }
    if (Object.keys(values).length > 0) {
      setFormValues(values);
    }
  }, [child.sections, child.savedFormValues]); // ← depend on specific props

  const validateStepOne = () => {
    const newErrors: any = {};

    formData?.sections?.forEach((section: any) => {
      const fields = section.fields || [];
      fields.forEach((field: any) => {
        const value = formValues[field.id];
        // Temporarily treat ALL fields as required to test red box:
        if (
          value === undefined ||
          value === null ||
          String(value).trim() === ""
        ) {
          newErrors[field.id] = `${field.label} is required`;
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearDocError = (id: number) => {
    setDocErrors((prev: any) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const buildSubmissionPayload = () => {
    const fieldValues: any[] = [];

    Object.entries(docValues).forEach(([fieldId, value]) => {
      fieldValues.push({
        field: Number(fieldId),
        value,
      });
    });
    formData?.sections?.forEach((section: any) => {
      const fields = section.fields || [];

      fields.forEach((field: any) => {
        const value = formValues[field.id];

        if (
          value !== undefined &&
          value !== null &&
          value.toString().trim() !== ""
        ) {
          fieldValues.push({
            field: field.id,
            value,
          });
        }
      });
    });

    return {
      admission_number: child?.admission_number || null,
      form: formData.id,
      school: formData.school,
      school_slug: formData.school_slug,

      school_class: Number(
        Object.keys(formValues).find((key) => {
          const field = formData?.sections
            ?.flatMap((s: any) => s.fields || [])
            ?.find((f: any) => f.id === Number(key));

          return field?.map_to_student_field === "school_class";
        })
          ? formValues[
              Object.keys(formValues).find((key) => {
                const field = formData?.sections
                  ?.flatMap((s: any) => s.fields || [])
                  ?.find((f: any) => f.id === Number(key));

                return field?.map_to_student_field === "school_class";
              }) as any
            ]
          : null,
      ),

      field_values: fieldValues,
    };
  };

  // Inside MultiStepForm, BEFORE the return statement — add this:
  const payNow = async () => {
    try {
      const amount = formData?.fees ? Number(formData.fees) : 0;

      const admission_number = applicationId;

      // CREATE ORDER
      const orderData = await createRazorOrder({
        amount,
        admission_number,
      });

      console.log("ORDER DATA:", orderData);

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.id,

        name: "School Admission",
        description: "Admission Fee Payment",

        handler: async function (response: any) {
          try {
            const verifyData = await verifyRazorPayment({
              razorpay_order_id: response.razorpay_order_id,

              razorpay_payment_id: response.razorpay_payment_id,

              razorpay_signature: response.razorpay_signature,

              admission_number,
            });

            console.log("VERIFY DATA:", verifyData);

            if (verifyData.status === "success") {
              toast.success("Online Payment Successful! 🎉");
              setTimeout(() => onPaymentSuccess(admission_number), 500);
            } else {
              alert("Payment Verification Failed");
            }
          } catch (error) {
            console.log(error);
            alert("Payment Verification Failed");
          }
        },

        prefill: {
          name: child.name,
          email: "",
          contact: "",
        },

        theme: {
          color: "#6366f1",
        },
      };

      const rzp = new (window as any).Razorpay(options);

      // when payment fails
      rzp.on("payment.failed", function () {
        toast.error("Payment Cancelled");
        onBack(); // ← go dashboard
      });

      // when user closes popup manually
      rzp.on("modal.closed", function () {
        toast.error("Payment Not Completed");
        onBack(); // ← go dashboard
      });

      rzp.open();
    } catch (error) {
      console.log(error);

      alert(error instanceof Error ? error.message : "Payment Failed");
    }
  };

  const payOffline = async () => {
    try {
      const amount = formData?.fees ? Number(formData.fees) : 0;

      const response = await createOfflinePayment({
        amount,
        admission_number: applicationId,
      });

      console.log("OFFLINE PAYMENT:", response);

      if (response?.status === "success") {
        toast.success("Offline Payment Successfully! 🎉");
        setTimeout(() => {
          onPaymentSuccess(applicationId);
        }, 500);
      }
    } catch (error) {
      console.log(error);

      toast.error(
        error instanceof Error ? error.message : "Offline payment failed",
      );
    }
  };
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // REPLACE the entire handleStepOneSubmit function with this:

  const handleStepOneSubmit = async () => {
    const isValid = validateStepOne();
    if (!isValid) return;

    try {
      setSubmitting(true);

      const payload = buildSubmissionPayload();
      console.log("SUBMISSION PAYLOAD:", payload);

      let response;

      // If applicationId is a real admission_number (not a NEW-... temp id), update
      const isExisting =
        child?.admission_number &&
        !String(child.admission_number).startsWith("NEW-");

      if (isExisting) {
        // UPDATE — pass admission_number directly, same as Step 2 uses applicationId
        response = await updateSubmission(child.admission_number, payload);
        console.log("UPDATED EXISTING USER:", child.admission_number);
      } else {
        // CREATE — new student
        response = await createSubmission(payload);
        console.log("CREATED NEW USER");
      }

      console.log("SUBMISSION RESPONSE:", response);

      if (response?.admission_number) {
        setApplicationId(response.admission_number);
        child.savedFormValues = formValues;
        child.currentStep = 2;
      }

      setStep(2);
    } catch (error) {
      console.log(error);
      toast.error(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const hasSections = formData?.sections && formData.sections.length > 0;

  if (!hasSections) {
    return (
      <div className="flex-1 min-h-screen bg-white flex flex-col">
        {/* Top Header */}
        <div className="h-[72px] border-b border-slate-100 flex items-center px-8 bg-white shadow-sm">
          <motion.button
            onClick={onBack}
            whileHover={{ x: -3 }}
            className="flex items-center gap-3 text-slate-500 hover:text-indigo-600 font-bold transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
              <ArrowLeft
                size={17}
                className="transition-transform group-hover:-translate-x-0.5"
              />
            </div>

            <span className="text-sm">Back to Dashboard</span>
          </motion.button>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-lg"
          >
            <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-8">
              <Shield size={42} className="text-slate-400" />
            </div>

            <h1 className="text-4xl font-black text-slate-800 mb-4">
              Currently No Active Form
            </h1>

            <p className="text-slate-400 text-base font-medium leading-relaxed">
              There is no admission form available right now. Please contact the
              school administration or try again later.
            </p>
          </motion.div>
        </div>

        {/* {error && (
            <p className="mt-1 text-xs font-semibold text-rose-500">{error}</p>
          )} */}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 flex flex-col bg-white overflow-hidden"
    >
      {/* ── TOP NAV ── */}
      <header className="h-[72px] border-b border-slate-100 flex items-center justify-between px-8 md:px-12 shrink-0 bg-white z-30 shadow-sm">
        <motion.button
          onClick={onBack}
          whileHover={{ x: -3 }}
          className="flex items-center gap-3 text-slate-500 hover:text-indigo-600 font-bold transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
            <ArrowLeft
              size={17}
              className="transition-transform group-hover:-translate-x-0.5"
            />
          </div>
          <span className="hidden sm:block text-sm">Back to Dashboard</span>
        </motion.button>

        {/* Mobile step indicator */}
        <div className="flex lg:hidden items-center gap-2">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === s.id
                  ? "w-8 bg-indigo-600"
                  : step > s.id
                    ? "w-2 bg-emerald-500"
                    : "w-2 bg-slate-200"
              }`}
            />
          ))}
        </div>

        {step > 1 && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">
                Application ID
              </p>

              <p className="text-sm font-bold text-indigo-600 font-mono">
                {applicationId}
              </p>
            </div>

            <div className="size-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-200">
              {child.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
          </div>
        )}
      </header>

      {/* ── BODY ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-80 border-r border-slate-100 bg-slate-50/50 p-8 hidden lg:flex flex-col shrink-0">
          <div className="mb-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">
              Currently on
            </p>
            <motion.h3
              key={step}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-black text-slate-900"
            >
              {STEPS[step - 1].label}
            </motion.h3>
          </div>

          <nav className="flex-1 space-y-2">
            {STEPS.map((s) => {
              const isCompleted = step > s.id;
              const isCurrent = step === s.id;
              return (
                <motion.div
                  key={s.id}
                  animate={{
                    opacity: isCurrent ? 1 : isCompleted ? 0.9 : 0.45,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    isCurrent
                      ? "bg-white shadow-md shadow-slate-100 border border-indigo-100"
                      : isCompleted
                        ? "bg-emerald-50/60"
                        : ""
                  }`}
                >
                  <div
                    className={`size-11 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                          : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <s.icon size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Step 0{s.id}
                    </p>
                    <p
                      className={`text-sm font-bold ${isCurrent ? "text-indigo-700" : "text-slate-700"}`}
                    >
                      {s.label}
                    </p>
                  </div>
                  {isCurrent && (
                    <motion.div
                      layoutId="active-dot"
                      className="size-2 rounded-full bg-indigo-600"
                    />
                  )}
                </motion.div>
              );
            })}
          </nav>

          <div className="p-5 bg-white rounded-3xl border border-slate-100 mt-6 shadow-sm">
            <p className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-1.5">
              <Shield size={13} className="text-indigo-500" />
              Auto-saved & Secure
            </p>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              All changes are saved in real-time. You can return anytime without
              losing progress.
            </p>
          </div>
        </aside>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Step title */}
          <div className="shrink-0 px-8 md:px-12 lg:px-16 pt-6 pb-5 bg-white border-b border-slate-100">
            <AnimatePresence mode="wait">
              <motion.div
                key={`title-${step}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-1.5">
                  Step 0{step} of 03
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                  {STEPS[step - 1].title}
                </h2>
                <p className="text-slate-400 text-sm font-medium mt-0.5">
                  {STEPS[step - 1].desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── SCROLLABLE CONTENT ── */}
          <main className="flex-1 overflow-y-auto px-6 md:px-10 lg:px-12 py-6 bg-slate-50/40">
            <div className="max-w-5xl mx-auto">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <StudentDetailsStep
                    key="s1"
                    child={child}
                    formData={formData}
                    formValues={formValues}
                    setFormValues={setFormValues}
                    errors={errors}
                    setErrors={setErrors} // ← add this
                  />
                )}
                {step === 2 && (
                  <DocumentsStep
                    key="s2"
                    formData={formData}
                    docValues={docValues}
                    setDocValues={setDocValues}
                    docErrors={docErrors}
                    clearDocError={clearDocError} // ← ADD
                  />
                )}
                {step === 3 && (
                  <ReviewStep
                    formData={formData}
                    paymentMode={paymentMode}
                    setPaymentMode={setPaymentMode}
                  />
                )}
              </AnimatePresence>
            </div>
          </main>

          {/* ── FOOTER ── */}
          <footer className="shrink-0 border-t border-slate-100 px-8 md:px-12 py-5 flex items-center justify-between bg-white z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
            <div>
              <Button
                variant="ghost"
                onClick={() => (step === 1 ? onBack() : setStep(step - 1))}
                className={`font-bold rounded-2xl h-13 px-7 text-sm transition-all ${
                  step === 1
                    ? "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    : "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                }`}
              >
                {step === 1 ? "Cancel" : "← Previous Step"}
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400 lg:hidden">
                {step} / {STEPS.length}
              </span>

              {step < 3 ? (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    disabled={
                      (step === 1 && submitting) ||
                      (step === 2 && docSubmitting)
                    }
                    onClick={() => {
                      if (step === 1) {
                        handleStepOneSubmit();
                      } else if (step === 2) {
                        handleStepTwoSubmit(); // ← add this
                      } else {
                        setStep(step + 1);
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-13 px-10 font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2.5 text-sm"
                  >
                    {step === 1 && submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : step === 2 && docSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        Continue to Step 0{step + 1}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    onClick={() => {
                      if (paymentMode === "online") {
                        payNow();
                      } else {
                        payOffline();
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-13 px-10 font-bold shadow-lg shadow-emerald-200 transition-all flex items-center gap-2.5 text-sm"
                  >
                    <Shield size={16} />
                    Confirm & Pay ₹
                    {formData?.fees
                      ? Number(formData.fees).toLocaleString("en-IN")
                      : "1,500"}
                  </Button>
                </motion.div>
              )}
            </div>
          </footer>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Step 1 — Student Details
// Clean 2-column grid. No column labels, no animated divider.
// ─────────────────────────────────────────────
function StudentDetailsStep({
  child,
  formData,
  formValues,
  setFormValues,
  errors,
  setErrors,
}: {
  child: any;
  formData: any;
  formValues: any;
  setFormValues: any;
  errors: any;
  setErrors: any;
}) {
  const [classOptions, setClassOptions] = useState<any[]>([]);

  if (!formData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Loading form fields…</p>
      </div>
    );
  }

  const handleChange = (fieldId: number, value: string) => {
    setFormValues((prev: any) => ({ ...prev, [fieldId]: value }));
    // ← add this block:
    if (errors[fieldId]) {
      setErrors((prev: any) => {
        const updated = { ...prev };
        delete updated[fieldId];
        return updated;
      });
    }
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getClasses();

        const formatted = data.map((item: any) => ({
          label: item.school_class,
          value: item.id,
        }));

        setClassOptions(formatted);
      } catch (error) {
        console.log("CLASS FETCH ERROR:", error);
      }
    };

    fetchClasses();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {formData.sections?.map((section: any, sectionIndex: number) => {
        const fields = section.fields || section.form_fields || [];

        return (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: sectionIndex * 0.1,
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
          >
            {/* Section header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500">
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-4 rounded-full bg-white/60" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-white">
                  {section.title}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-indigo-100 bg-white/15 px-2.5 py-1 rounded-full">
                {fields.length} fields
              </span>
            </div>

            {/* 2-column field grid — clean, no divider, no sub-headers */}
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {fields.map((field: any, fi: number) => {
                  const updatedField =
                    field.map_to_student_field === "school_class"
                      ? {
                          ...field,
                          options: classOptions,
                        }
                      : field;

                  return (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: sectionIndex * 0.06 + fi * 0.04 + 0.12,
                        duration: 0.3,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className={
                        field.field_type === "textarea" || field.full_width
                          ? "sm:col-span-2"
                          : ""
                      }
                    >
                      <DynamicField
                        field={updatedField}
                        value={formValues?.[field.id] ?? ""}
                        error={errors[field.id]}
                        onChange={(value: string) =>
                          handleChange(field.id, value)
                        }
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Section completion bar */}
            <SectionCompletionBar
              fields={fields}
              formValues={formValues}
              sectionIndex={sectionIndex}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Section completion bar
// ─────────────────────────────────────────────
function SectionCompletionBar({
  fields,
  formValues,
  sectionIndex,
}: {
  fields: any[];
  formValues: any;
  sectionIndex: number;
}) {
  const filled = fields.filter((f: any) => !!formValues[f.id]).length;
  const pct =
    fields.length > 0 ? Math.round((filled / fields.length) * 100) : 0;
  const allDone = pct === 100;

  return (
    <div
      className={`px-6 py-3 border-t flex items-center gap-3 transition-colors duration-500 ${
        allDone
          ? "border-emerald-100 bg-emerald-50/60"
          : "border-slate-100 bg-slate-50/50"
      }`}
    >
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full transition-colors duration-500 ${
            allDone ? "bg-emerald-400" : "bg-indigo-400"
          }`}
        />
      </div>
      <span
        className={`text-[10px] font-black tabular-nums whitespace-nowrap transition-colors duration-300 ${
          allDone ? "text-emerald-500" : "text-slate-400"
        }`}
      >
        {filled}/{fields.length} filled{allDone && " ✓"}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// DynamicField — polished animated input
// ─────────────────────────────────────────────
function DynamicField({
  field,
  value,
  onChange,
  error,
}: {
  field: any;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  const isFilled = !!value;

  const inputBase = [
    "w-full h-[48px] px-4 rounded-xl outline-none font-medium text-[14px] text-slate-800",
    "transition-all duration-200 border-2",

    error
      ? "border-rose-400 bg-rose-50 shadow-[0_0_0_3px_rgba(244,63,94,0.10)]"
      : focused
        ? "border-indigo-400 bg-white shadow-[0_0_0_3px_rgba(99,102,241,0.10)]"
        : isFilled
          ? "border-emerald-300 bg-white"
          : "border-slate-200 bg-white hover:border-indigo-200",

    "placeholder:text-slate-300",
  ].join(" ");

  const labelClass = [
    "flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest mb-1.5 transition-colors duration-200",
    error
      ? "text-rose-500"
      : focused
        ? "text-indigo-600"
        : isFilled
          ? "text-emerald-600"
          : "text-slate-400",
  ].join(" ");

  if (field.field_type === "select") {
    return (
      <div>
        <label className={labelClass}>
          {isFilled && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"
            />
          )}
          {field.label}
          {field.is_required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`${inputBase} cursor-pointer appearance-none pr-10`}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <motion.div
              animate={{ rotate: focused ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
                <path
                  stroke={
                    focused ? "#6366f1" : isFilled ? "#34d399" : "#94a3b8"
                  }
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                  d="M6 8l4 4 4-4"
                />
              </svg>
            </motion.div>
          </div>
        </div>

        {error && (
          <p className="mt-1 text-xs font-semibold text-rose-500">{error}</p>
        )}
      </div>
    );
  }

  if (field.field_type === "textarea") {
    return (
      <div>
        <label className={labelClass}>
          {isFilled && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"
            />
          )}
          {field.label}
          {field.is_required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={
            field.placeholder || `Enter ${(field.label || "").toLowerCase()}`
          }
          rows={3}
          className={[
            "w-full px-4 py-3 rounded-xl outline-none font-medium text-[14px] text-slate-800 resize-none",
            "transition-all duration-200 border-2",
            error
              ? "border-rose-400 bg-rose-50 shadow-[0_0_0_3px_rgba(244,63,94,0.10)]"
              : focused
                ? "border-indigo-400 bg-white shadow-[0_0_0_3px_rgba(99,102,241,0.10)]"
                : isFilled
                  ? "border-emerald-300 bg-white"
                  : "border-slate-200 bg-white hover:border-indigo-200",
          ].join(" ")}
        />

        {error && (
          <p className="mt-1 text-xs font-semibold text-rose-500">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <label className={labelClass}>
        {isFilled && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"
          />
        )}
        {field.label}
        {field.is_required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type={field.field_type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={
            field.placeholder || `Enter ${(field.label || "").toLowerCase()}`
          }
          className={inputBase}
        />
        <AnimatePresence>
          {isFilled && !focused && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2 6l3 3 5-5"
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p className="mt-1 text-xs font-semibold text-rose-500">{error}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Step 2 — Documents
// ─────────────────────────────────────────────
function DocumentsStep({
  formData,
  docValues,
  setDocValues,
  docErrors,
  clearDocError, // ← ADD
}: {
  formData: any;
  docValues: any;
  setDocValues: any;
  docErrors: any;
  clearDocError: (id: number) => void; // ← ADD
}) {
  const docs: any[] = React.useMemo(() => {
    const raw = formData?.documents ?? formData?.document_fields ?? [];

    return [...raw].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  }, [formData]);

  // const [docValues, setDocValues] = useState<Record<number, string | File>>({});
  const handleFile = (id: number, file: File) =>
    setDocValues((p) => ({ ...p, [id]: file }));
  const handleText = (id: number, val: string) =>
    setDocValues((p) => ({ ...p, [id]: val }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-4 mb-6">
        <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
          <Upload size={17} className="text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-indigo-800 mb-1">
            Upload Guidelines
          </p>
          <p className="text-xs text-indigo-600/80 font-medium leading-relaxed">
            Accepted formats: PDF, JPG, PNG. Maximum file size: 5 MB per
            document. Ensure documents are clear and legible.
          </p>
        </div>
      </div>

      {docs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
          <Upload size={28} className="opacity-40" />
          <p className="font-semibold text-sm">No documents required.</p>
        </div>
      )}

      {docs.map((doc, i) => (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07 }}
        >
          <DocRow
            doc={doc}
            value={docValues[doc.id]}
            error={docErrors?.[doc.id]}
            onFile={(f) => handleFile(doc.id, f)}
            onText={(v) => handleText(doc.id, v)}
            onClearError={() => clearDocError(doc.id)} // ← ADD
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

function isFileField(label: string) {
  const l = label.toLowerCase();
  return l.includes("file") || l.includes("photo") || l.includes("image");
}

function DocRow({
  doc,
  value,
  error,
  onFile,
  onText,
  onClearError,
}: {
  doc: any;
  value: string | File | undefined;
  error?: boolean;
  onFile: (f: File) => void;
  onText: (v: string) => void;
  onClearError?: () => void; // ← ADD
}) {
  const [focused, setFocused] = useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const isFile = true;
  const isFilled = !!value;
  const fileName = value instanceof File ? value.name : null;

  return (
    <div
      className={`flex items-center justify-between p-6 border-2 rounded-3xl group transition-all duration-200 ${
        error
          ? "bg-rose-50 border-rose-400"
          : isFilled
            ? "bg-emerald-50 border-emerald-200"
            : focused
              ? "border-indigo-300 bg-white"
              : "bg-white border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30"
      }`}
    >
      <div className="flex items-center gap-5">
        <div
          className={`size-14 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${
            isFilled
              ? "bg-emerald-500 text-white"
              : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"
          }`}
        >
          {isFilled ? <CheckCircle2 size={24} /> : <Upload size={22} />}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="block font-bold text-slate-800 text-base">
              {doc.label}
            </span>
            {doc.is_required && (
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                Required
              </span>
            )}
            {isFilled && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200"
              >
                ✓ Done
              </motion.span>
            )}
          </div>
          <span className="text-xs font-medium text-slate-400">
            {fileName
              ? `📎 ${fileName}`
              : doc.is_required
                ? "Required document"
                : "Optional document"}
          </span>
        </div>
      </div>

      <>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              onFile(f);
              onClearError?.(); // ← ADD THIS
            }
          }}
        />
        <Button
          variant={isFilled ? "ghost" : "outline"}
          className={`rounded-xl font-bold h-11 px-6 text-sm transition-all min-w-[110px] ${
            isFilled
              ? "text-emerald-600 hover:bg-emerald-100"
              : "border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600"
          }`}
          onClick={() => fileRef.current?.click()}
        >
          {isFilled ? "✓ Uploaded" : "Choose File"}
        </Button>
      </>
    </div>
  );
}
// ─────────────────────────────────────────────
// Step 3 — Review & Pay
// ─────────────────────────────────────────────
function ReviewStep({
  formData,
  paymentMode,
  setPaymentMode,
}: {
  formData: any;
  paymentMode: "online" | "offline";
  setPaymentMode: React.Dispatch<React.SetStateAction<"online" | "offline">>;
}) {
  const fees =
    formData?.fee_structures?.length > 0
      ? formData.fee_structures
      : formData?.fees
        ? [{ label: "Admission Fee", amount: formData.fees }]
        : [
            { label: "Registration Fee", amount: "1,200" },
            { label: "Prospectus Fee", amount: "300" },
          ];

  const total = formData?.fees
    ? Number(formData.fees).toFixed(2)
    : fees
        .reduce((sum: number, f: any) => sum + Number(f.amount), 0)
        .toFixed(2);

  const feesEnabled = formData?.fees_enable !== false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5 max-w-4xl mx-auto"
    >
      {/* ── SUCCESS BANNER ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white shadow-xl shadow-emerald-100"
      >
        {/* Background decoration */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -right-4 -bottom-10 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute right-24 -bottom-6 w-16 h-16 rounded-full bg-white/10" />

        <div className="relative flex items-center gap-5">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 border border-white/30"
          >
            <CheckCircle2 size={28} className="text-white" />
          </motion.div>
          <div>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="font-black text-xl mb-0.5 tracking-tight"
            >
              Application Complete! 🎉
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-emerald-100 text-sm font-medium"
            >
              All steps done. One last step — complete your payment to confirm
              your seat.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* ── LEFT: ORDER SUMMARY (3 cols) ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
        >
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setPaymentMode("online")}
              className={`px-5 py-3 rounded-2xl border-2 font-bold transition-all ${
                paymentMode === "online"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              Online Payment
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode("offline")}
              className={`px-5 py-3 rounded-2xl border-2 font-bold transition-all ${
                paymentMode === "offline"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              Offline Payment
            </button>
          </div>
          {/* Card header */}
          <div className="px-7 py-5 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                <CreditCard size={17} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Breakdown
                </p>
                <p className="text-sm font-black text-slate-800 leading-tight">
                  Order Summary
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              ✓ Verified
            </span>
          </div>

          {/* Fee rows */}
          <div className="px-7 py-5 space-y-1">
            {fees.map((fee: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      {fee.label || fee.fee_type || `Fee ${i + 1}`}
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                      {fee.description || "One-time payment"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-slate-800">
                    ₹{Number(fee.amount).toLocaleString("en-IN")}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Total */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mx-5 mb-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 px-6 py-5 flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-0.5">
                Amount Payable
              </p>
              <p className="text-lg font-black text-slate-900">Total Due</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Inclusive of all taxes & fees
              </p>
            </div>
            <div className="text-right">
              <motion.p
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="text-3xl font-black text-indigo-600 tracking-tight"
              >
                ₹{Number(total).toLocaleString("en-IN")}
              </motion.p>
              <p className="text-[10px] font-bold text-indigo-400 mt-0.5">
                INR
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* ── RIGHT: PAYMENT INFO + CHECKLIST (2 cols) ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Payment methods card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#4F46E5] via-[#6366F1] to-[#8B5CF6] p-7 text-white shadow-2xl shadow-indigo-200/50"
          >
            {/* Animated Background Elements */}
            <div className="absolute -right-4 -top-4 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute -bottom-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-indigo-400/20 blur-3xl" />

            <div className="relative z-10">
              {/* Header Section */}
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-md border border-white/30">
                  <Shield size={22} className="text-white drop-shadow-md" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight leading-none">
                    Secure Checkout
                  </h3>
                  {/* <div className="mt-1 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-100/80">
                      256-bit SSL Encrypted
                    </p>
                  </div> */}
                </div>
              </div>

              <p className="mb-6 text-sm font-medium leading-relaxed text-indigo-50/90">
                Your payment is protected by industry-standard encryption. We do
                not store your sensitive card information.
              </p>

              {/* Payment method chips */}
              <div className="flex flex-wrap gap-2">
                {["UPI", "Debit Card", "Credit Card", "Net Banking"].map(
                  (method, i) => (
                    <motion.span
                      key={method}
                      whileHover={{
                        scale: 1.05,
                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="cursor-default rounded-xl border border-white/20 bg-white/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-colors"
                    >
                      {method}
                    </motion.span>
                  ),
                )}
              </div>

              {/* Warning State - Refined */}
              {!feesEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-200/20 bg-amber-500/20 p-3 backdrop-blur-md"
                >
                  <div className="flex-shrink-0 text-amber-300">
                    <AlertCircle size={18} />
                  </div>
                  <p className="text-[11px] font-bold leading-tight text-amber-100">
                    Online payment is currently disabled. Please contact the
                    school office to proceed.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// UploadRow
// ─────────────────────────────────────────────
function UploadRow({
  label,
  description,
  required,
}: {
  label: string;
  description: string;
  required?: boolean;
}) {
  const [uploaded, setUploaded] = useState(false);

  return (
    <div
      className={`flex items-center justify-between p-6 border-2 rounded-3xl group transition-all duration-200 ${
        uploaded
          ? "bg-emerald-50 border-emerald-200"
          : "bg-white border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30"
      }`}
    >
      <div className="flex items-center gap-5">
        <div
          className={`size-14 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${
            uploaded
              ? "bg-emerald-500 text-white"
              : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"
          }`}
        >
          {uploaded ? <CheckCircle2 size={24} /> : <Upload size={22} />}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="block font-bold text-slate-800 text-base">
              {label}
            </span>
            {required && (
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                Required
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-slate-400">
            {description}
          </span>
        </div>
      </div>
      <Button
        variant={uploaded ? "ghost" : "outline"}
        className={`rounded-xl font-bold h-11 px-6 text-sm transition-all min-w-[110px] ${
          uploaded
            ? "text-emerald-600 hover:bg-emerald-100"
            : "border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600"
        }`}
        onClick={() => setUploaded(!uploaded)}
      >
        {uploaded ? "✓ Uploaded" : "Choose File"}
      </Button>
    </div>
  );
}
