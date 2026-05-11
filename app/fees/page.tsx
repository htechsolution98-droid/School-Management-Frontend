// "use client";

// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import {
//   CheckCircle2, Clock, AlertCircle, User, Hash,
//   IndianRupee, Loader2, RefreshCw, BadgeCheck,
//   CreditCard, Wifi, WifiOff, Calendar, Receipt,
// } from "lucide-react";
// import { getFeeVerifyList, verifyFee, type FeeVerifyRecord } from "@/lib/forms";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { cn } from "@/lib/utils";

// export default function ClerkDashboard() {
//   const [records, setRecords] = useState<FeeVerifyRecord[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [verifyingId, setVerifyingId] = useState<number | null>(null);
//   const [selectedRecord, setSelectedRecord] = useState<FeeVerifyRecord | null>(null);
//   const [verifyModalOpen, setVerifyModalOpen] = useState(false);

//   const fetchRecords = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const data = await getFeeVerifyList();
//       setRecords(data);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to load records");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchRecords(); }, []);

//   const handleVerify = async (record: FeeVerifyRecord) => {
//     setVerifyingId(record.id);
//     try {
//       await verifyFee(record.admission_number);
//       setRecords((prev) =>
//         prev.map((r) =>
//           r.id === record.id
//             ? { ...r, fee_verified: true, fee_verified_at: new Date().toISOString() }
//             : r
//         )
//       );
//     } catch (err) {
//       alert(err instanceof Error ? err.message : "Verification failed");
//     } finally {
//       setVerifyingId(null);
//     }
//   };

//   const pending = records.filter((r) => !r.fee_verified).length;
//   const verified = records.filter((r) => r.fee_verified).length;
//   const totalAmount = records.reduce((sum, r) => sum + (r.fee_data?.amount ?? 0), 0);

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">Fee Verification</h1>
//           <p className="text-sm text-slate-500 mt-0.5">
//             Review and verify student admission fee payments
//           </p>
//         </div>
//         <Button variant="outline" size="sm" onClick={fetchRecords} disabled={loading} className="gap-2">
//           <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
//           Refresh
//         </Button>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <Card className="border-slate-200">
//           <CardContent className="p-4">
//             <p className="text-xs text-slate-500 mb-1">Total Applications</p>
//             <p className="text-2xl font-bold text-slate-900">{records.length}</p>
//           </CardContent>
//         </Card>
//         <Card className="border-amber-200 bg-amber-50">
//           <CardContent className="p-4">
//             <p className="text-xs text-amber-600 mb-1">Pending</p>
//             <p className="text-2xl font-bold text-amber-700">{pending}</p>
//           </CardContent>
//         </Card>
//         <Card className="border-emerald-200 bg-emerald-50">
//           <CardContent className="p-4">
//             <p className="text-xs text-emerald-600 mb-1">Verified</p>
//             <p className="text-2xl font-bold text-emerald-700">{verified}</p>
//           </CardContent>
//         </Card>
//         <Card className="border-indigo-200 bg-indigo-50">
//           <CardContent className="p-4">
//             <p className="text-xs text-indigo-600 mb-1">Total Amount</p>
//             <p className="text-2xl font-bold text-indigo-700">₹{totalAmount.toLocaleString()}</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Loading */}
//       {loading && (
//         <div className="flex items-center justify-center py-20">
//           <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
//         </div>
//       )}

//       {/* Error */}
//       {!loading && error && (
//         <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
//           <AlertCircle className="h-5 w-5 shrink-0" />
//           <span className="text-sm">{error}</span>
//         </div>
//       )}

//       {/* Empty */}
//       {!loading && !error && records.length === 0 && (
//         <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
//           <BadgeCheck className="h-12 w-12 mb-3 text-slate-300" />
//           <p className="font-medium">No records found</p>
//           <p className="text-sm mt-1">There are no fee verification requests yet</p>
//         </div>
//       )}

//       {/* Records */}
//       {!loading && !error && records.length > 0 && (
//         <div className="space-y-4">
//           {records.map((record, index) => (
//             <motion.div
//               key={record.id}
//               initial={{ opacity: 0, y: 16 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.05 }}
//             >
//               <Card className={cn(
//                 "border rounded-2xl transition-all",
//                 record.fee_verified
//                   ? "border-emerald-200 bg-emerald-50/40"
//                   : "border-slate-200 bg-white"
//               )}>
//                 <CardHeader className="pb-3 pt-4 px-5">
//                   <div className="flex items-start justify-between gap-4">
//                     {/* Student name + admission number */}
//                     <div className="flex items-center gap-3">
//                       <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
//                         <User className="h-5 w-5 text-indigo-600" />
//                       </div>
//                       <div>
//                         <CardTitle className="text-base font-semibold text-slate-800">
//                           {record.field_values.find((f) =>
//                             f.field_label.toLowerCase().includes("full name") ||
//                             f.field_label.toLowerCase() === "student full name"
//                           )?.value ??
//                             record.field_values.find((f) =>
//                               f.field_label.toLowerCase().includes("name")
//                             )?.value ?? "—"}
//                         </CardTitle>
//                         <div className="flex items-center gap-2 mt-0.5">
//                           <Hash className="h-3.5 w-3.5 text-slate-400" />
//                           <span className="text-xs text-slate-500 font-mono">
//                             {record.admission_number}
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
//                       {/* Payment mode badge */}
//                       {record.fee_data && (
//                         <Badge
//                           className={cn(
//                             "text-xs px-2.5 py-1 rounded-full font-medium gap-1",
//                             record.fee_data.payment_mode === "online"
//                               ? "bg-blue-100 text-blue-700 border-blue-200"
//                               : "bg-purple-100 text-purple-700 border-purple-200"
//                           )}
//                           variant="outline"
//                         >
//                           {record.fee_data.payment_mode === "online"
//                             ? <Wifi className="h-3 w-3 inline mr-1" />
//                             : <WifiOff className="h-3 w-3 inline mr-1" />}
//                           {record.fee_data.payment_mode === "online" ? "Online" : "Offline"}
//                         </Badge>
//                       )}

//                       {/* Verified / Pending badge */}
//                       <Badge
//                         className={cn(
//                           "text-xs px-2.5 py-1 rounded-full font-medium",
//                           record.fee_verified
//                             ? "bg-emerald-100 text-emerald-700 border-emerald-200"
//                             : "bg-amber-100 text-amber-700 border-amber-200"
//                         )}
//                         variant="outline"
//                       >
//                         {record.fee_verified ? (
//                           <><CheckCircle2 className="h-3.5 w-3.5 mr-1 inline" />Verified</>
//                         ) : (
//                           <><Clock className="h-3.5 w-3.5 mr-1 inline" />Pending</>
//                         )}
//                       </Badge>

//                       {/* Verify button */}
//                       {!record.fee_verified && (
//                         <Button
//                           size="sm"
//                           className="h-8 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
//                           onClick={() => { setSelectedRecord(record); setVerifyModalOpen(true); }}
//                           disabled={verifyingId === record.id}
//                         >
//                           {verifyingId === record.id
//                             ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                             : "Verify"}
//                         </Button>
//                       )}
//                     </div>
//                   </div>
//                 </CardHeader>

//                 <CardContent className="px-5 pb-4 space-y-4">
//                   {/* Fee data row */}
//                   {record.fee_data && (
//                     <div className="flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm">
//                       <div className="flex items-center gap-1.5">
//                         <IndianRupee className="h-4 w-4 text-slate-400" />
//                         <span className="text-slate-500">Amount:</span>
//                         <span className="font-semibold text-emerald-700">
//                           ₹{record.fee_data.amount.toLocaleString()} {record.fee_data.currency}
//                         </span>
//                       </div>

//                       <div className="flex items-center gap-1.5">
//                         <Calendar className="h-4 w-4 text-slate-400" />
//                         <span className="text-slate-500">Paid:</span>
//                         <span className="font-medium text-slate-700">
//                           {new Date(record.fee_data.paid_at).toLocaleDateString("en-IN", {
//                             day: "2-digit", month: "short", year: "numeric"
//                           })}
//                         </span>
//                       </div>

//                       {record.fee_data.razorpay_order_id && (
//                         <div className="flex items-center gap-1.5">
//                           <Receipt className="h-4 w-4 text-slate-400" />
//                           <span className="text-slate-500">Order ID:</span>
//                           <span className="font-mono text-xs text-slate-700">
//                             {record.fee_data.razorpay_order_id}
//                           </span>
//                         </div>
//                       )}

//                       {record.fee_data.razorpay_payment_id && (
//                         <div className="flex items-center gap-1.5">
//                           <CreditCard className="h-4 w-4 text-slate-400" />
//                           <span className="text-slate-500">Payment ID:</span>
//                           <span className="font-mono text-xs text-slate-700">
//                             {record.fee_data.razorpay_payment_id}
//                           </span>
//                         </div>
//                       )}

//                       {record.fee_verified_at && (
//                         <div className="flex items-center gap-1.5 ml-auto">
//                           <CheckCircle2 className="h-4 w-4 text-emerald-500" />
//                           <span className="text-xs text-emerald-600 font-medium">
//                             Verified {new Date(record.fee_verified_at).toLocaleDateString("en-IN")}
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   {/* Field values */}
//                   <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
//                     {record.field_values.map((fv) => (
//                       <div key={fv.id} className="text-sm">
//                         <span className="text-xs text-slate-400 block leading-tight mb-0.5">
//                           {fv.field_label}
//                         </span>
//                         <span className="text-slate-700 font-medium">{fv.value || "—"}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           ))}
//         </div>
//       )}

//       {/* VERIFY MODAL */}
//       {verifyModalOpen && selectedRecord && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95, y: 20 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
//           >
//             {/* Modal Header */}
//             <div className="bg-indigo-600 px-6 py-5 text-white">
//               <h2 className="text-xl font-bold">Verify Admission Fee</h2>
//               <p className="text-indigo-100 text-sm mt-1">Review all details before confirming</p>
//             </div>

//             <div className="p-6 space-y-5">
//               {/* Admission + Fee Amount */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="rounded-2xl border border-slate-200 p-4">
//                   <p className="text-xs text-slate-400 mb-1">Admission Number</p>
//                   <p className="font-bold text-slate-800 font-mono text-sm">
//                     {selectedRecord.admission_number}
//                   </p>
//                 </div>
//                 <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
//                   <p className="text-xs text-emerald-600 mb-1">Fee Amount</p>
//                   <p className="font-bold text-emerald-700 text-lg">
//                     ₹{selectedRecord.fee_data?.amount?.toLocaleString() ?? "N/A"}
//                     <span className="text-xs font-normal ml-1 text-emerald-600">
//                       {selectedRecord.fee_data?.currency}
//                     </span>
//                   </p>
//                 </div>
//               </div>

//               {/* Payment Details */}
//               {selectedRecord.fee_data && (
//                 <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
//                   <h3 className="text-sm font-semibold text-slate-700">Payment Details</h3>
//                   <div className="grid grid-cols-2 gap-3 text-sm">
//                     <div>
//                       <p className="text-xs text-slate-400 mb-0.5">Payment Mode</p>
//                       <Badge
//                         className={cn(
//                           "text-xs",
//                           selectedRecord.fee_data.payment_mode === "online"
//                             ? "bg-blue-100 text-blue-700 border-blue-200"
//                             : "bg-purple-100 text-purple-700 border-purple-200"
//                         )}
//                         variant="outline"
//                       >
//                         {selectedRecord.fee_data.payment_mode === "online" ? "Online" : "Offline"}
//                       </Badge>
//                     </div>
//                     <div>
//                       <p className="text-xs text-slate-400 mb-0.5">Paid At</p>
//                       <p className="font-medium text-slate-700">
//                         {new Date(selectedRecord.fee_data.paid_at).toLocaleString("en-IN")}
//                       </p>
//                     </div>
//                     {selectedRecord.fee_data.razorpay_order_id && (
//                       <div className="col-span-2">
//                         <p className="text-xs text-slate-400 mb-0.5">Razorpay Order ID</p>
//                         <p className="font-mono text-xs text-slate-700 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
//                           {selectedRecord.fee_data.razorpay_order_id}
//                         </p>
//                       </div>
//                     )}
//                     {selectedRecord.fee_data.razorpay_payment_id && (
//                       <div className="col-span-2">
//                         <p className="text-xs text-slate-400 mb-0.5">Razorpay Payment ID</p>
//                         <p className="font-mono text-xs text-slate-700 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
//                           {selectedRecord.fee_data.razorpay_payment_id}
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Student Fields */}
//               <div>
//                 <h3 className="text-sm font-semibold text-slate-700 mb-3">Student Information</h3>
//                 <div className="grid grid-cols-2 gap-3">
//                   {selectedRecord.field_values.map((field) => (
//                     <div key={field.id} className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
//                       <p className="text-xs text-slate-400 mb-0.5">{field.field_label}</p>
//                       <p className="font-medium text-slate-800 text-sm">{field.value || "—"}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Modal Footer */}
//             <div className="border-t border-slate-100 px-6 py-4 flex justify-end gap-3 bg-slate-50">
//               <Button
//                 variant="outline"
//                 onClick={() => { setVerifyModalOpen(false); setSelectedRecord(null); }}
//                 className="rounded-xl"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
//                 disabled={verifyingId === selectedRecord.id}
//                 onClick={async () => {
//                   await handleVerify(selectedRecord);
//                   setVerifyModalOpen(false);
//                   setSelectedRecord(null);
//                 }}
//               >
//                 {verifyingId === selectedRecord.id ? (
//                   <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying...</>
//                 ) : (
//                   <><CheckCircle2 className="h-4 w-4 mr-2" />Confirm Verify</>
//                 )}
//               </Button>
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Hash,
  IndianRupee,
  Loader2,
  RefreshCw,
  BadgeCheck,
  CreditCard,
  Wifi,
  WifiOff,
  Calendar,
  Receipt,
  ShieldCheck,
  Banknote,
  X,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  getFeeVerifyList,
  verifyFee,
  getClasses,
  type FeeVerifyRecord,
} from "@/lib/forms";
import { cn } from "@/lib/utils";

/* ─── Animated counter ───────────────────────────────────────────────────── */
function AnimatedNumber({
  value,
  prefix = "",
}: {
  value: number;
  prefix?: string;
}) {
  const spring = useSpring(0, { stiffness: 60, damping: 16 });
  const display = useTransform(
    spring,
    (v) => `${prefix}${Math.round(v).toLocaleString("en-IN")}`,
  );
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);
  return <motion.span>{display}</motion.span>;
}

/* ─── Stat card ──────────────────────────────────────────────────────────── */
const STAT_STYLES = {
  total: {
    from: "#111827",
    to: "#1f2937",
    accent: "#60a5fa",
    label: "text-slate-300",
  },

  pending: {
    from: "#78350f",
    to: "#b45309",
    accent: "#fbbf24",
    label: "text-amber-100",
  },

  verified: {
    from: "#064e3b",
    to: "#047857",
    accent: "#34d399",
    label: "text-emerald-100",
  },

  amount: {
    from: "#312e81",
    to: "#4338ca",
    accent: "#818cf8",
    label: "text-indigo-100",
  },
};

function StatCard({
  label,
  value,
  prefix = "",
  icon: Icon,
  variant,
  delay,
}: {
  label: string;
  value: number;
  prefix?: string;
  icon: React.ElementType;
  variant: keyof typeof STAT_STYLES;
  delay: number;
}) {
  const s = STAT_STYLES[variant];
  return (
    <motion.div
      initial={{ opacity: 0, y: 36, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.03, transition: { duration: 0.2 } }}
      style={{
        background: `linear-gradient(140deg, ${s.from} 0%, ${s.to} 100%)`,
      }}
      className="relative rounded-3xl p-5 md:p-7 overflow-hidden cursor-default shadow-2xl"
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full opacity-20"
        style={{ background: s.accent }}
      />
      <div
        className="pointer-events-none absolute -left-4 -bottom-8 h-24 w-24 rounded-full opacity-10"
        style={{ background: s.accent }}
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-4 mb-5">
          <p
            className={cn(
              "text-xs font-black uppercase tracking-[0.18em]",
              s.label,
            )}
          >
            {label}
          </p>
          <div
            className="rounded-2xl p-3 shrink-0"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <p className="text-5xl font-black text-white tabular-nums leading-none tracking-tight">
          <AnimatedNumber value={value} prefix={prefix} />
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Mode badge ─────────────────────────────────────────────────────────── */
function ModeBadge({ mode }: { mode: "online" | "offline" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold border-2 whitespace-nowrap",
        mode === "online"
          ? "bg-sky-50 text-sky-700 border-sky-200"
          : "bg-purple-50 text-purple-700 border-purple-200",
      )}
    >
      {mode === "online" ? (
        <Wifi className="h-3.5 w-3.5" />
      ) : (
        <WifiOff className="h-3.5 w-3.5" />
      )}
      {mode === "online" ? "Online" : "Offline"}
    </span>
  );
}

/* ─── Status badge ───────────────────────────────────────────────────────── */
function StatusBadge({ verified }: { verified: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold border-2 whitespace-nowrap",
        verified
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-amber-50 text-amber-700 border-amber-200",
      )}
    >
      {verified ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <Clock className="h-3.5 w-3.5" />
      )}
      {verified ? "Verified" : "Pending"}
    </span>
  );
}

/* ─── Field item ─────────────────────────────────────────────────────────── */
function FieldItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 mb-1">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800">{value || "—"}</p>
    </div>
  );
}

/* ─── Verify modal ───────────────────────────────────────────────────────── */
function VerifyModal({
  record,
  verifyingId,
  onClose,
  onConfirm,
  getClassName,
}: {
  record: FeeVerifyRecord;
  verifyingId: number | null;
  onClose: () => void;
  onConfirm: () => void;
  getClassName: (value: string) => string;
}) {
  const studentName =
    record.field_values.find((f) =>
      f.field_label.toLowerCase().includes("full name"),
    )?.value ??
    record.field_values.find((f) =>
      f.field_label.toLowerCase().includes("name"),
    )?.value ??
    "Student";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.86, y: 48 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.91, y: 24 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="w-full max-w-xl rounded-[2rem] bg-white shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* header */}
        <div
          className="relative shrink-0 px-8 py-8 text-white overflow-hidden"
          style={{
            background: "linear-gradient(140deg, #4338ca 0%, #7c3aed 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 85% 15%, rgba(255,255,255,0.22), transparent 55%)",
            }}
          />
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-xl bg-white/20 hover:bg-white/35 p-2 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="relative flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <p className="text-indigo-200 text-sm font-bold">
                Confirm Verification
              </p>
              <h2 className="text-2xl font-black leading-tight">
                {studentName}
              </h2>
            </div>
          </div>
          {record.fee_data && (
            <div className="relative rounded-2xl bg-white/15 border border-white/25 px-5 py-4 flex items-center justify-between">
              <span className="text-indigo-200 font-bold">Fee Amount</span>
              <span className="text-3xl font-black">
                ₹{record.fee_data.amount.toLocaleString("en-IN")}
                <span className="text-sm font-semibold text-indigo-300 ml-2">
                  {record.fee_data.currency}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* body */}
        <div className="overflow-y-auto px-8 py-7 space-y-5">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4">
            <Hash className="h-5 w-5 text-slate-400 shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Admission Number
              </p>
              <p className="font-mono font-bold text-slate-800 mt-0.5">
                {record.admission_number}
              </p>
            </div>
          </div>

          {record.fee_data && (
            <div className="rounded-2xl border border-slate-200 p-5 space-y-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                Payment Details
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold mb-2">
                    Mode
                  </p>
                  <ModeBadge mode={record.fee_data.payment_mode} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold mb-1.5">
                    Paid At
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {new Date(record.fee_data.paid_at).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
                {record.fee_data.razorpay_order_id && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold mb-1.5">
                      Order ID
                    </p>
                    <p className="font-mono text-xs bg-slate-100 rounded-xl px-4 py-3 text-slate-700 border border-slate-200 truncate">
                      {record.fee_data.razorpay_order_id}
                    </p>
                  </div>
                )}
                {record.fee_data.razorpay_payment_id && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold mb-1.5">
                      Payment ID
                    </p>
                    <p className="font-mono text-xs bg-slate-100 rounded-xl px-4 py-3 text-slate-700 border border-slate-200 truncate">
                      {record.fee_data.razorpay_payment_id}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
              Student Information
            </p>
            <div className="grid grid-cols-2 gap-3">
              {record.field_values.map((fv) => (
                <FieldItem
                  key={fv.id}
                  label={fv.field_label}
                  value={
                    fv.field_label === "Applying For Class"
                      ? getClassName(fv.value)
                      : fv.value
                  }
                />
              ))}
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-8 py-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border-2 border-slate-200 bg-white py-4 font-bold text-slate-700 hover:bg-slate-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            disabled={verifyingId === record.id}
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 py-4 font-bold text-white shadow-lg shadow-emerald-200/60 transition-colors text-sm flex items-center justify-center gap-2"
          >
            {verifyingId === record.id ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Verifying…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Confirm Verification
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Record card ────────────────────────────────────────────────────────── */
function RecordCard({
  record,
  index,
  verifyingId,
  onVerifyClick,
  getClassName,
}: {
  record: FeeVerifyRecord;
  index: number;
  verifyingId: number | null;
  onVerifyClick: (r: FeeVerifyRecord) => void;
  getClassName: (value: string) => string;
}) {
  const [expanded, setExpanded] = useState(false);

  const studentName =
    record.field_values.find((f) =>
      f.field_label.toLowerCase().includes("full name"),
    )?.value ??
    record.field_values.find((f) =>
      f.field_label.toLowerCase().includes("name"),
    )?.value ??
    "—";

  const initials = studentName
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.09,
        duration: 0.48,
        ease: [0.22, 1, 0.36, 1],
      }}
      layout
    >
      <div
        className={cn(
          "rounded-3xl border-2 transition-all duration-300 overflow-hidden",
          record.fee_verified
            ? "border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white"
            : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-50/80",
        )}
      >
        {/* color stripe */}
        <div
          className={cn(
            "h-1.5 w-full",
            record.fee_verified
              ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
              : "bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500",
          )}
        />

        <div className="px-5 md:px-6 pt-5 pb-0">
          {/* top row */}
          <div className="flex items-center justify-between gap-6 flex-wrap">
            {/* avatar + name */}
            <div className="flex items-center gap-5 min-w-0">
              <div
                className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 text-lg font-black",
                  record.fee_verified
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-indigo-100 text-indigo-700",
                )}
              >
                {initials || <User className="h-6 w-6" />}
              </div>
              <div className="min-w-0">
                <p className="font-black text-2xl text-slate-900 leading-tight">
                  {studentName}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Hash className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-xs text-slate-500">
                    {record.admission_number}
                  </span>
                </div>
              </div>
            </div>

            {/* badges + verify */}
            <div className="flex items-center gap-3 flex-wrap shrink-0">
              {record.fee_data && (
                <ModeBadge mode={record.fee_data.payment_mode} />
              )}
              <StatusBadge verified={record.fee_verified} />
              {!record.fee_verified && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onVerifyClick(record)}
                  disabled={verifyingId === record.id}
                  className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 px-6 py-3 text-sm font-black text-white shadow-xl shadow-indigo-200/70 transition-colors"
                >
                  {verifyingId === record.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Verify Fee
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          {/* fee info strip */}
          {record.fee_data && (
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl bg-slate-50 border border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <IndianRupee className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Amount
                  </p>
                  <p className="text-lg font-black text-emerald-600 leading-tight">
                    ₹{record.fee_data.amount.toLocaleString("en-IN")}
                    <span className="text-xs font-semibold text-slate-400 ml-1">
                      {record.fee_data.currency}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Paid At
                  </p>
                  <p className="text-sm font-bold text-slate-800 leading-tight">
                    {new Date(record.fee_data.paid_at).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>

              {record.fee_data.razorpay_order_id && (
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                    <Receipt className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Order ID
                    </p>
                    <p className="font-mono text-xs text-slate-700 max-w-[140px] truncate leading-tight">
                      {record.fee_data.razorpay_order_id}
                    </p>
                  </div>
                </div>
              )}

              {record.fee_data.razorpay_payment_id && (
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                    <CreditCard className="h-4 w-4 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Payment ID
                    </p>
                    <p className="font-mono text-xs text-slate-700 max-w-[140px] truncate leading-tight">
                      {record.fee_data.razorpay_payment_id}
                    </p>
                  </div>
                </div>
              )}

              {record.fee_verified_at && (
                <div className="ml-auto flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-black text-emerald-600">
                    Verified ·{" "}
                    {new Date(record.fee_verified_at).toLocaleDateString(
                      "en-IN",
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* expand toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-5 mb-6 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <motion.span
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight className="h-4 w-4" />
            </motion.span>
            {expanded ? "Hide student details" : "Show student details"}
            <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[11px] font-black text-indigo-500">
              {record.field_values.length} fields
            </span>
          </button>
        </div>

        {/* expandable fields */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="fields"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="px-5 md:px-6 pb-5 pt-0 border-t border-slate-100">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">
                  {record.field_values.map((fv, i) => (
                    <motion.div
                      key={fv.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.045 }}
                    >
                      <FieldItem
                        label={fv.field_label}
                        value={
                          fv.field_label === "Applying For Class"
                            ? getClassName(fv.value)
                            : fv.value
                        }
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function ClerkDashboard() {
  const [records, setRecords] = useState<FeeVerifyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<FeeVerifyRecord | null>(
    null,
  );
  const [classes, setClasses] = useState<any[]>([]);

  const fetchClasses = async () => {
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (err) {
      console.error("Failed to fetch classes", err);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getFeeVerifyList();
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchClasses();
  }, []);

  const handleVerify = async (record: FeeVerifyRecord) => {
    setVerifyingId(record.id);
    try {
      await verifyFee(record.admission_number);
      setRecords((prev) =>
        prev.map((r) =>
          r.id === record.id
            ? {
                ...r,
                fee_verified: true,
                fee_verified_at: new Date().toISOString(),
              }
            : r,
        ),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifyingId(null);
    }
  };

  const pending = records.filter((r) => !r.fee_verified).length;
  const verified = records.filter((r) => r.fee_verified).length;
  const verifiedAmount = records
    .filter((r) => r.fee_verified)
    .reduce((sum, r) => sum + (r.fee_data?.amount ?? 0), 0);

  const getClassName = (value: string) => {
    const foundClass = classes.find((c) => String(c.id) === String(value));

    return foundClass?.school_class || value;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 xl:px-8 py-6 space-y-6">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-end justify-between gap-6 flex-wrap"
        >
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-300">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.22em] text-indigo-600">
                Clerk Panel
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Fee Verification
            </h1>
            <p className="text-slate-500 mt-3 text-base font-semibold">
              Review and confirm student admission fee payments
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={fetchRecords}
            disabled={loading}
            className="inline-flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-6 py-3.5 text-sm font-black text-slate-700 shadow-md hover:border-indigo-300 hover:text-indigo-700 hover:shadow-xl transition-all disabled:opacity-60"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </motion.button>
        </motion.div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            label="Total"
            value={records.length}
            icon={User}
            variant="total"
            delay={0.1}
          />
          <StatCard
            label="Pending"
            value={pending}
            icon={Clock}
            variant="pending"
            delay={0.18}
          />
          <StatCard
            label="Verified"
            value={verified}
            icon={ShieldCheck}
            variant="verified"
            delay={0.26}
          />
          <StatCard
            label="Verified Amount"
            value={verifiedAmount}
            prefix="₹"
            icon={Banknote}
            variant="amount"
            delay={0.34}
          />
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-36 gap-5">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Loader2 className="h-12 w-12 text-indigo-400" />
            </motion.div>
            <p className="text-slate-400 font-bold text-lg">Loading records…</p>
          </div>
        )}

        {/* ── Error ── */}
        <AnimatePresence>
          {!loading && error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-4 rounded-3xl border-2 border-red-200 bg-red-50 p-7"
            >
              <AlertCircle className="h-7 w-7 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-lg text-red-700">
                  Failed to load records
                </p>
                <p className="text-sm mt-1 text-red-500 font-semibold">
                  {error}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty ── */}
        {!loading && !error && records.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-36 text-center"
          >
            <div className="rounded-3xl bg-slate-100 p-10 mb-6">
              <BadgeCheck className="h-16 w-16 text-slate-300" />
            </div>
            <p className="font-black text-2xl text-slate-700">
              No records found
            </p>
            <p className="text-slate-400 mt-2 font-semibold text-base">
              There are no fee verification requests yet
            </p>
          </motion.div>
        )}

        {/* ── Records ── */}
        {!loading && !error && records.length > 0 && (
          <div className="space-y-4">
            {records.map((record, index) => (
              <RecordCard
                key={record.id}
                record={record}
                index={index}
                verifyingId={verifyingId}
                onVerifyClick={(r) => setSelectedRecord(r)}
                getClassName={getClassName}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {selectedRecord && (
          <VerifyModal
            record={selectedRecord}
            verifyingId={verifyingId}
            getClassName={getClassName}
            onClose={() => setSelectedRecord(null)}
            onConfirm={async () => {
              await handleVerify(selectedRecord);
              setSelectedRecord(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
