"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Edit2,
  Loader2,
  Plus,
  RefreshCw,
  Settings2,
  Trash2,
  X,
  Check,
  DollarSign,
  Bus,
  FlaskConical,
  Library,
  GraduationCap,
  FileText,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  Info,
} from "lucide-react";

import {
  getFeeTypes,
  getSchoolClasses,
  getFeeWiseClasses,
  createFeeWiseClass,
  updateFeeWiseClass,
  deleteFeeWiseClass,
  type FeeType,
  type FeeWiseClass,
  type FeeWiseClassPayload,
  type LateFeeType,
} from "@/lib/forms";

// ─── Zod schema ───────────────────────────────────────────────────────────────

const feeFormSchema = z
  .object({
    feetype: z.number().min(1, "Select a fee type"),
    amount: z
      .string()
      .min(1, "Amount is required")
      .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount"),
    late_fee_enabled: z.boolean(),
    grace_days: z.string().optional(),
    late_fee_type: z.enum(["per_day", "flat"]).optional(),
    late_fee_amount: z.string().optional(),
    max_late_fee: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.late_fee_enabled) {
      if (!data.grace_days || isNaN(Number(data.grace_days)))
        ctx.addIssue({ code: "custom", path: ["grace_days"], message: "Required" });
      if (!data.late_fee_type)
        ctx.addIssue({ code: "custom", path: ["late_fee_type"], message: "Required" });
      if (!data.late_fee_amount || !/^\d+(\.\d{1,2})?$/.test(data.late_fee_amount))
        ctx.addIssue({ code: "custom", path: ["late_fee_amount"], message: "Required" });
      if (!data.max_late_fee || !/^\d+(\.\d{1,2})?$/.test(data.max_late_fee))
        ctx.addIssue({ code: "custom", path: ["max_late_fee"], message: "Required" });
    }
  });

type FeeFormValues = z.infer<typeof feeFormSchema>;

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  accent: "#6366f1",
  accentSoft: "#ede9fe",
  accentHover: "#4f46e5",
  danger: "#ef4444",
  dangerSoft: "#fee2e2",
  success: "#16a34a",
  successSoft: "#dcfce7",
  warn: "#d97706",
  warnSoft: "#fef3c7",
  border: "#e2e8f0",
  bg: "#f8fafc",
  card: "#ffffff",
  text: "#0f172a",
  muted: "#94a3b8",
  subtle: "#f1f5f9",
};

// ─── Icon helper ──────────────────────────────────────────────────────────────
function FeeIcon({ name, size = 18 }: { name: string; size?: number }) {
  const n = name.toLowerCase();
  if (n.includes("tuition")) return <BookOpen size={size} />;
  if (n.includes("transport")) return <Bus size={size} />;
  if (n.includes("exam")) return <FileText size={size} />;
  if (n.includes("library")) return <Library size={size} />;
  if (n.includes("lab")) return <FlaskConical size={size} />;
  if (n.includes("admission")) return <GraduationCap size={size} />;
  return <DollarSign size={size} />;
}

const iconBgMap: Record<string, string> = {
  tuition: "#ede9fe",
  transport: "#ffedd5",
  exam: "#dbeafe",
  library: "#d1fae5",
  lab: "#f3e8ff",
  admission: "#fce7f3",
};
function iconBg(name: string) {
  for (const k of Object.keys(iconBgMap)) {
    if (name.toLowerCase().includes(k)) return iconBgMap[k];
  }
  return "#e0e7ff";
}
function iconColor(name: string) {
  const n = name.toLowerCase();
  if (n.includes("tuition")) return "#7c3aed";
  if (n.includes("transport")) return "#ea580c";
  if (n.includes("exam")) return "#2563eb";
  if (n.includes("library")) return "#059669";
  if (n.includes("lab")) return "#9333ea";
  if (n.includes("admission")) return "#db2777";
  return "#4f46e5";
}

// ─── Billing cycle badge ──────────────────────────────────────────────────────
const cycleMap: Record<string, { label: string; bg: string; color: string }> = {
  single:      { label: "One-time",    bg: "#dbeafe", color: "#1d4ed8" },
  monthly:     { label: "Monthly",     bg: "#f3e8ff", color: "#7c3aed" },
  quarterly:   { label: "Quarterly",   bg: "#ffedd5", color: "#c2410c" },
  half_yearly: { label: "Half-Yearly", bg: "#d1fae5", color: "#065f46" },
  yearly:      { label: "Yearly",      bg: "#dcfce7", color: "#15803d" },
};
function CycleBadge({ cycle }: { cycle: string }) {
  const c = cycleMap[cycle] ?? { label: cycle, bg: C.subtle, color: C.muted };
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: c.bg, color: c.color, whiteSpace: "nowrap" }}>
      {c.label}
    </span>
  );
}

// ─── Late fee badge ───────────────────────────────────────────────────────────
function LateBadge({ enabled }: { enabled: boolean }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap",
      background: enabled ? C.successSoft : C.subtle,
      color: enabled ? C.success : C.muted,
    }}>
      {enabled ? "Enabled" : "Disabled"}
    </span>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ size = 24 }: { size?: number }) {
  return (
    <>
      <Loader2 size={size} color={C.accent} style={{ animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

// ─── Label ────────────────────────────────────────────────────────────────────
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5, letterSpacing: "0.03em" }}>
      {children} {required && <span style={{ color: C.danger }}>*</span>}
    </label>
  );
}

// ─── Input style ──────────────────────────────────────────────────────────────
const inp = (err?: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "9px 12px",
  border: `1.5px solid ${err ? C.danger : C.border}`,
  borderRadius: 8,
  fontSize: 13,
  color: C.text,
  background: err ? "#fff8f8" : "#fff",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
});

// ─── Error text ───────────────────────────────────────────────────────────────
function ErrMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p style={{ margin: "4px 0 0", fontSize: 11, color: C.danger, display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} />{msg}</p>;
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
        background: checked ? "#10b981" : "#cbd5e1",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: checked ? 23 : 3,
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children, width = 520 }: {
  title: string; subtitle?: string; onClose: () => void;
  children: React.ReactNode; width?: number;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }} onClick={onClose}>
      <div style={{ background: C.card, borderRadius: 16, width, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "22px 24px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>{title}</h3>
            {subtitle && <p style={{ margin: "3px 0 0", fontSize: 13, color: C.muted }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ background: C.subtle, border: "none", cursor: "pointer", width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>
            <X size={15} />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 2000,
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 16px", borderRadius: 12,
      background: type === "success" ? C.successSoft : C.dangerSoft,
      border: `1px solid ${type === "success" ? "#bbf7d0" : "#fecaca"}`,
      color: type === "success" ? C.success : C.danger,
      fontSize: 13, fontWeight: 500, maxWidth: 360,
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    }}>
      {type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {msg}
      <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex", alignItems: "center" }}><X size={14} /></button>
    </div>
  );
}

// ─── Late Fee Settings Panel ──────────────────────────────────────────────────
function LateFeePanel({ fee }: { fee: FeeWiseClass }) {
  if (!fee.late_fee_enabled) return null;
  return (
    <div style={{ margin: "0 24px 20px", background: "#fafbff", border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
      <h4 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: C.text }}>
        Late Fee Settings — {fee.feetype_name}
      </h4>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
        {[
          { label: "Late Fee Enabled", value: <Toggle checked={true} onChange={() => {}} /> },
          { label: "Grace Days", value: <div style={{ ...inp(), padding: "8px 12px", display: "inline-block" }}>{fee.grace_days}</div> },
          { label: "Late Fee Type", value: <div style={{ ...inp(), padding: "8px 12px", display: "inline-block" }}>{fee.late_fee_type === "per_day" ? "Per Day" : "Flat"}</div> },
          { label: "Late Fee Amount (₹)", value: <div style={{ ...inp(), padding: "8px 12px", display: "inline-block" }}>{fee.late_fee_amount}</div> },
          { label: "Max Late Fee (₹)", value: <div style={{ ...inp(), padding: "8px 12px", display: "inline-block" }}>{fee.max_late_fee}</div> },
        ].map(item => (
          <div key={item.label}>
            <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
            {item.value}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Add / Edit Fee Modal ─────────────────────────────────────────────────────
function FeeModal({
  feeTypes, classId, editing, onClose, onSave,
}: {
  feeTypes: FeeType[];
  classId: number;
  editing: FeeWiseClass | null;
  onClose: () => void;
  onSave: (data: FeeWiseClassPayload) => Promise<void>;
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<FeeFormValues>({
    resolver: zodResolver(feeFormSchema),
    defaultValues: {
      feetype: editing ? feeTypes.find(ft => ft.name === editing.feetype_name)?.id ?? 0 : 0,
      amount: editing?.amount ?? "",
      late_fee_enabled: editing?.late_fee_enabled ?? false,
      grace_days: editing?.grace_days?.toString() ?? "",
      late_fee_type: (editing?.late_fee_type ?? "per_day") as LateFeeType,
      late_fee_amount: editing?.late_fee_amount ?? "",
      max_late_fee: editing?.max_late_fee ?? "",
    },
  });

  const lateEnabled = watch("late_fee_enabled");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (vals: FeeFormValues) => {
    setSaving(true);
    try {
      const payload: FeeWiseClassPayload = {
        feetype: vals.feetype,
        school_class: classId,
        amount: vals.amount,
        late_fee_enabled: vals.late_fee_enabled,
        ...(vals.late_fee_enabled && {
          grace_days: Number(vals.grace_days),
          late_fee_type: vals.late_fee_type as LateFeeType,
          late_fee_amount: vals.late_fee_amount,
          max_late_fee: vals.max_late_fee,
        }),
        ...(!vals.late_fee_enabled && {
          grace_days: null,
          late_fee_type: null,
          late_fee_amount: null,
          max_late_fee: null,
        }),
      };
      await onSave(payload);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editing ? "Edit Fee" : "Add New Fee"}
      subtitle={editing ? "Update fee details for this class" : "Configure a new fee for this class"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Fee Type */}
        <div>
          <Label required>Fee Type</Label>
          <div style={{ position: "relative" }}>
            <select
              {...register("feetype", { valueAsNumber: true })}
              style={{ ...inp(!!errors.feetype), appearance: "none", paddingRight: 36, cursor: "pointer" }}
            >
              <option value={0}>Select fee type…</option>
              {feeTypes.map(ft => (
                <option key={ft.id} value={ft.id}>{ft.name}</option>
              ))}
            </select>
            <ChevronDown size={14} color={C.muted} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>
          <ErrMsg msg={errors.feetype?.message} />
        </div>

        {/* Amount */}
        <div>
          <Label required>Amount (₹)</Label>
          <input {...register("amount")} placeholder="e.g. 1500.00" style={inp(!!errors.amount)} />
          <ErrMsg msg={errors.amount?.message} />
        </div>

        {/* Late Fee Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: C.subtle, borderRadius: 10 }}>
          <Toggle
            checked={lateEnabled}
            onChange={(v) => setValue("late_fee_enabled", v)}
          />
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text }}>Enable Late Fee</p>
            <p style={{ margin: 0, fontSize: 11, color: C.muted }}>Charge extra after grace period</p>
          </div>
        </div>

        {/* Late fee fields */}
        {lateEnabled && (
          <div style={{ background: "#fafbff", border: `1.5px solid #e0e7ff`, borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.accent, display: "flex", alignItems: "center", gap: 6 }}>
              <Info size={13} /> Late Fee Configuration
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <Label required>Grace Days</Label>
                <input {...register("grace_days")} type="number" min={0} placeholder="5" style={inp(!!errors.grace_days)} />
                <ErrMsg msg={errors.grace_days?.message} />
              </div>
              <div>
                <Label required>Late Fee Type</Label>
                <div style={{ position: "relative" }}>
                  <select {...register("late_fee_type")} style={{ ...inp(!!errors.late_fee_type), appearance: "none", paddingRight: 36, cursor: "pointer" }}>
                    <option value="per_day">Per Day</option>
                    <option value="flat">Flat</option>
                  </select>
                  <ChevronDown size={14} color={C.muted} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                </div>
                <ErrMsg msg={errors.late_fee_type?.message} />
              </div>
              <div>
                <Label required>Late Fee Amount (₹)</Label>
                <input {...register("late_fee_amount")} placeholder="20.00" style={inp(!!errors.late_fee_amount)} />
                <ErrMsg msg={errors.late_fee_amount?.message} />
              </div>
              <div>
                <Label required>Max Late Fee (₹)</Label>
                <input {...register("max_late_fee")} placeholder="500.00" style={inp(!!errors.max_late_fee)} />
                <ErrMsg msg={errors.max_late_fee?.message} />
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1.5px solid ${C.border}`, background: "#fff", fontSize: 13, fontWeight: 600, color: C.muted, cursor: "pointer" }}>
            Cancel
          </button>
          <button type="submit" disabled={saving} style={{ flex: 2, padding: "10px 0", borderRadius: 8, border: "none", background: C.accent, color: "#fff", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: saving ? 0.7 : 1 }}>
            {saving ? <Spinner size={15} /> : <Check size={15} />}
            {editing ? "Save Changes" : "Add Fee"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ name, onConfirm, onCancel, deleting }: {
  name: string; onConfirm: () => void; onCancel: () => void; deleting: boolean;
}) {
  return (
    <Modal title="Delete Fee" subtitle={`"${name}" will be permanently removed from this class.`} onClose={onCancel} width={400}>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1.5px solid ${C.border}`, background: "#fff", fontSize: 13, fontWeight: 600, color: C.muted, cursor: "pointer" }}>Cancel</button>
        <button onClick={onConfirm} disabled={deleting} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: C.danger, color: "#fff", fontSize: 13, fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: deleting ? 0.7 : 1 }}>
          {deleting ? <Spinner size={14} /> : <Trash2 size={14} />}
          Delete
        </button>
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FeeStructurePage() {
  const [classes, setClasses] = useState<{ id: number; school_class: string }[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [fees, setFees] = useState<FeeWiseClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<{ id: number; school_class: string } | null>(null);
  const [expandedLateFee, setExpandedLateFee] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [feesLoading, setFeesLoading] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeWiseClass | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeeWiseClass | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error") => setToast({ msg, type });

  // ── Load initial data ──────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([getFeeTypes(), getSchoolClasses()])
      .then(([ft, cls]) => {
        setFeeTypes(ft);
        setClasses(cls);
        if (cls.length > 0) setSelectedClass(cls[0]);
      })
      .catch(() => setError("Failed to load data. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  // ── Load fees when class changes ───────────────────────────────────────────
  const loadFees = useCallback(async (classId: number) => {
    setFeesLoading(true);
    setError("");
    try {
      const data = await getFeeWiseClasses({ school_class: classId });
      setFees(data);
    } catch {
      setError("Failed to load fee structure.");
    } finally {
      setFeesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClass) loadFees(selectedClass.id);
  }, [selectedClass, loadFees]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSave = async (payload: FeeWiseClassPayload) => {
    try {
      if (editingFee) {
        const updated = await updateFeeWiseClass(editingFee.id, payload);
        setFees(prev => prev.map(f => f.id === editingFee.id ? updated : f));
        showToast("Fee updated successfully!", "success");
      } else {
        const created = await createFeeWiseClass(payload);
        setFees(prev => [...prev, created]);
        showToast("Fee added successfully!", "success");
      }
    } catch (e: any) {
      showToast(e.message ?? "Something went wrong.", "error");
      throw e;
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteFeeWiseClass(deleteTarget.id);
      setFees(prev => prev.filter(f => f.id !== deleteTarget.id));
      if (expandedLateFee === deleteTarget.id) setExpandedLateFee(null);
      showToast("Fee deleted.", "success");
      setDeleteTarget(null);
    } catch {
      showToast("Failed to delete fee.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const openAdd = () => { setEditingFee(null); setShowModal(true); };
  const openEdit = (fee: FeeWiseClass) => { setEditingFee(fee); setShowModal(true); };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Spinner size={32} />
          <p style={{ margin: 0, fontSize: 14, color: C.muted }}>Loading fee structure…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: 24 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} * { box-sizing: border-box; }`}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>Fee Structure</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>Configure class-wise fees and late fee policies</p>
      </div>

      {error && (
        <div style={{ background: C.dangerSoft, color: C.danger, borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          <AlertCircle size={15} /> {error}
          <button onClick={() => selectedClass && loadFees(selectedClass.id)} style={{ marginLeft: "auto", background: "none", border: "none", color: C.danger, cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* ── Left: Class list ── */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <div style={{ background: C.card, borderRadius: 14, border: `1.5px solid ${C.border}`, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>Select Class</p>
            </div>
            <div style={{ padding: 8 }}>
              {classes.map(cls => {
                const isSelected = selectedClass?.id === cls.id;
                return (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    style={{
                      width: "100%", textAlign: "left", padding: "10px 12px",
                      border: "none", borderRadius: 9, cursor: "pointer",
                      background: isSelected ? C.accentSoft : "transparent",
                      color: isSelected ? C.accent : C.text,
                      fontSize: 13, fontWeight: isSelected ? 600 : 400,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      transition: "background 0.15s",
                    }}
                  >
                    {cls.school_class}
                    {isSelected && <Settings2 size={13} color={C.accent} />}
                  </button>
                );
              })}
              {classes.length === 0 && (
                <p style={{ margin: "12px 8px", fontSize: 12, color: C.muted }}>No classes found</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Fee table ── */}
        <div style={{ flex: 1, background: C.card, borderRadius: 14, border: `1.5px solid ${C.border}`, overflow: "hidden" }}>

          {/* Table header */}
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>
                {selectedClass ? `${selectedClass.school_class} Fee Structure` : "Fee Structure"}
              </h2>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>
                {fees.length} fee{fees.length !== 1 ? "s" : ""} configured
              </p>
            </div>
            {selectedClass && (
              <button
                onClick={openAdd}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 9, border: "none", background: C.accent, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.28)" }}
              >
                <Plus size={15} />
                Add New Fee
              </button>
            )}
          </div>

          {/* Table content */}
          {!selectedClass ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: C.muted }}>
              <ChevronRight size={28} style={{ display: "block", margin: "0 auto 10px", opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: 14 }}>Select a class to view its fee structure</p>
            </div>
          ) : feesLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
              <Spinner size={26} />
            </div>
          ) : fees.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: C.muted }}>
              <DollarSign size={32} style={{ display: "block", margin: "0 auto 12px", opacity: 0.3 }} />
              <p style={{ margin: "0 0 16px", fontSize: 14 }}>No fees configured for this class yet</p>
              <button onClick={openAdd} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 9, border: "none", background: C.accent, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                <Plus size={14} /> Add First Fee
              </button>
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: "0 8px", padding: "10px 24px", background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                {["Fee Type", "Amount (₹)", "Billing Cycle", "Late Fee", "Action"].map(h => (
                  <span key={h} style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>

              {/* Rows */}
              {fees.map((fee, i) => (
                <React.Fragment key={fee.id}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                      gap: "0 8px",
                      padding: "16px 24px",
                      borderBottom: i < fees.length - 1 || expandedLateFee === fee.id ? `1px solid ${C.border}` : "none",
                      alignItems: "center",
                      background: expandedLateFee === fee.id ? "#fafbff" : C.card,
                      transition: "background 0.15s",
                    }}
                  >
                    {/* Fee Type */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: iconBg(fee.feetype_name), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: iconColor(fee.feetype_name) }}>
                        <FeeIcon name={fee.feetype_name} size={17} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text }}>{fee.feetype_name}</p>
                        {fee.late_fee_enabled && (
                          <button
                            onClick={() => setExpandedLateFee(expandedLateFee === fee.id ? null : fee.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 11, color: C.accent, fontWeight: 500, display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}
                          >
                            <Settings2 size={10} />
                            {expandedLateFee === fee.id ? "Hide" : "View"} late fee settings
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text }}>
                      {Number(fee.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>

                    {/* Billing Cycle */}
                    <CycleBadge cycle={fee.billing_cycle} />

                    {/* Late Fee */}
                    <LateBadge enabled={fee.late_fee_enabled} />

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => openEdit(fee)}
                        style={{ width: 32, height: 32, borderRadius: 7, border: `1.5px solid ${C.border}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(fee)}
                        style={{ width: 32, height: 32, borderRadius: 7, border: `1.5px solid #fecaca`, background: "#fff8f8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.danger }}
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Late fee expanded panel */}
                  {expandedLateFee === fee.id && <LateFeePanel fee={fee} />}
                </React.Fragment>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && selectedClass && (
        <FeeModal
          feeTypes={feeTypes}
          classId={selectedClass.id}
          editing={editingFee}
          onClose={() => { setShowModal(false); setEditingFee(null); }}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.feetype_name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}