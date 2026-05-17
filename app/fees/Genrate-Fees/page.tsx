"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Loader2,
  RefreshCw,
  Search,
  Users,
  X,
  Zap,
  CheckSquare,
  Square,
  Info,
  FileText,
  IndianRupee,
} from "lucide-react";

import {
  getAcademicYears,
  getSchoolClasses,
  getFeeWiseClasses,
  getStudentsByFeeWiseClass,
  getExistingStudentFees,
  bulkCreateStudentFees,
  type AcademicYear,
  type SchoolClass,
  type FeeWiseClass,
  type StudentForFee,
  type StudentFee,
  type StudentFeePayload,
} from "@/lib/forms";

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  accent: "#5b5ef4",
  accentSoft: "#eeeeff",
  accentHover: "#4749d6",
  success: "#059669",
  successSoft: "#d1fae5",
  danger: "#dc2626",
  dangerSoft: "#fee2e2",
  warn: "#d97706",
  warnSoft: "#fef3c7",
  border: "#e4e8f0",
  bg: "#f5f7fb",
  card: "#ffffff",
  text: "#111827",
  muted: "#6b7280",
  subtle: "#f3f4f6",
  indigo50: "#eef2ff",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function Spinner({ size = 20, color = C.accent }: { size?: number; color?: string }) {
  return (
    <>
      <Loader2 size={size} color={color} style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

// ─── Select dropdown ──────────────────────────────────────────────────────────
function Select({
  label, value, onChange, options, placeholder, disabled, loading,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled || loading}
          style={{
            width: "100%", padding: "10px 36px 10px 13px",
            border: `1.5px solid ${C.border}`, borderRadius: 10,
            fontSize: 13, fontWeight: 500, color: value ? C.text : C.muted,
            background: disabled ? C.subtle : "#fff",
            appearance: "none", cursor: disabled ? "not-allowed" : "pointer",
            outline: "none", fontFamily: "inherit",
          }}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          {loading ? <Spinner size={13} /> : <ChevronDown size={14} color={C.muted} />}
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error" | "warn"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const styles = {
    success: { bg: C.successSoft, border: "#a7f3d0", color: C.success },
    error:   { bg: C.dangerSoft,  border: "#fca5a5", color: C.danger },
    warn:    { bg: C.warnSoft,    border: "#fcd34d", color: C.warn },
  }[type];
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 2000,
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "13px 16px", borderRadius: 12, maxWidth: 380,
      background: styles.bg, border: `1px solid ${styles.border}`, color: styles.color,
      fontSize: 13, fontWeight: 500, boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    }}>
      {type === "success" ? <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 1 }} /> :
       type === "warn"    ? <Info size={16} style={{ flexShrink: 0, marginTop: 1 }} /> :
                           <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />}
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, display: "flex" }}>
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Status badge for existing fees ──────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    paid:    { bg: C.successSoft, color: C.success, label: "Paid" },
    pending: { bg: "#fef9c3",     color: "#854d0e", label: "Pending" },
    overdue: { bg: C.dangerSoft,  color: C.danger,  label: "Overdue" },
    partial: { bg: "#dbeafe",     color: "#1d4ed8", label: "Partial" },
  };
  const s = map[status] ?? { bg: C.subtle, color: C.muted, label: status };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: s.bg, color: s.color, whiteSpace: "nowrap", letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {s.label}
    </span>
  );
}

// ─── Row in student table ─────────────────────────────────────────────────────
interface StudentRow {
  student: StudentForFee;
  feeWiseClass: FeeWiseClass;
  dueDate: string;
  billingPeriod: string;
  alreadyExists: boolean;
  existingStatus?: string;
  selected: boolean;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GenerateStudentFeesPage() {
  // ── Filters ────────────────────────────────────────────────────────────────
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses]             = useState<SchoolClass[]>([]);
  const [feeWiseList, setFeeWiseList]     = useState<FeeWiseClass[]>([]);

  const [selectedYear,        setSelectedYear]        = useState("");
  const [selectedClass,       setSelectedClass]       = useState("");
  const [selectedFeeWise,     setSelectedFeeWise]     = useState("");
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState("");
  const [dueDate,             setDueDate]             = useState("");
  const [searchQuery,         setSearchQuery]         = useState("");

  // ── Data ───────────────────────────────────────────────────────────────────
  const [rows,       setRows]       = useState<StudentRow[]>([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingFee,  setLoadingFee]  = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [generating,  setGenerating]  = useState(false);
  const [studentsLoaded, setStudentsLoaded] = useState(false);

  // ── UI ─────────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "warn" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" | "warn" = "success") => setToast({ msg, type });

  // ── Load academic years + classes ──────────────────────────────────────────
  useEffect(() => {
    Promise.all([getAcademicYears(), getSchoolClasses()])
      .then(([years, cls]) => {
        setAcademicYears(years);
        setClasses(cls);
        if (years.length > 0) setSelectedYear(String(years[0].id));
      })
      .catch(() => showToast("Failed to load initial data.", "error"))
      .finally(() => setLoadingInit(false));
  }, []);

  // ── Load fee-wise classes when class changes ───────────────────────────────
  useEffect(() => {
    if (!selectedClass) { setFeeWiseList([]); setSelectedFeeWise(""); return; }
    setLoadingFee(true);
    getFeeWiseClasses({ school_class: Number(selectedClass) })
      .then(data => {
        setFeeWiseList(data);
        setSelectedFeeWise("");
        setSelectedBillingPeriod("");
      })
      .catch(() => showToast("Failed to load fee types for this class.", "error"))
      .finally(() => setLoadingFee(false));
  }, [selectedClass]);

  // ── Reset billing period when fee type changes ─────────────────────────────
  useEffect(() => {
    setSelectedBillingPeriod("");
    setStudentsLoaded(false);
    setRows([]);
  }, [selectedFeeWise]);

  // ── Selected fee-wise class object ────────────────────────────────────────
  const selectedFeeWiseObj = feeWiseList.find(f => String(f.id) === selectedFeeWise) ?? null;

  // ── Billing periods from selected academic year ───────────────────────────
  const selectedYearObj = academicYears.find(y => String(y.id) === selectedYear) ?? null;
  const billingPeriods: { value: string; label: string }[] = selectedYearObj?.billing_periods?.map(p => ({
    value: p,
    label: new Date(p + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" }) + ` (${p})`,
  })) ?? [];

  const isSingleFee = selectedFeeWiseObj?.billing_cycle === "single";

  // ── Load students ─────────────────────────────────────────────────────────
  const handleLoadStudents = useCallback(async () => {
    if (!selectedYear || !selectedClass || !selectedFeeWise || !dueDate) {
      showToast("Please fill Academic Year, Class, Fee Type, and Due Date.", "warn");
      return;
    }
    if (!isSingleFee && !selectedBillingPeriod) {
      showToast("Please select a billing period.", "warn");
      return;
    }
 
    setLoadingStudents(true);
    setStudentsLoaded(false);
    setRows([]);
 
    try {
      const [students, existingFees] = await Promise.all([
        // CHANGED: was getStudentsByClass(Number(selectedClass))
        getStudentsByFeeWiseClass(
          Number(selectedFeeWise),   // feeWiseClassId
          Number(selectedClass)      // schoolClassId
        ),
        getExistingStudentFees({
          school_class:   Number(selectedClass),
          billing_period: isSingleFee ? "" : selectedBillingPeriod,
          academic_year:  Number(selectedYear),
          fee_wise_class: Number(selectedFeeWise),   // ← ADDED
        }),
      ]);
 
      // Build a lookup: "studentId-feeWiseClassId-billingPeriod" → existing fee
      const existingMap = new Map<string, StudentFee>();
      existingFees.forEach((ef) => {
        const key = `${ef.student}-${ef.fee_wise_class}-${ef.billing_period ?? ""}`;
        existingMap.set(key, ef);
      });
 
      const built: StudentRow[] = students.map((s) => {
        const key = `${s.id}-${selectedFeeWise}-${isSingleFee ? "" : selectedBillingPeriod}`;
        const existing = existingMap.get(key);
        return {
          student:        s,
          feeWiseClass:   selectedFeeWiseObj!,
          dueDate,
          billingPeriod:  isSingleFee ? "" : selectedBillingPeriod,
          alreadyExists:  !!existing,
          existingStatus: existing?.status,
          selected:       !existing, // pre-select students who don't have this fee yet
        };
      });
 
      setRows(built);
      setStudentsLoaded(true);
    } catch (e: any) {
      showToast(e.message ?? "Failed to load students.", "error");
    } finally {
      setLoadingStudents(false);
    }
  }, [
    selectedYear,
    selectedClass,
    selectedFeeWise,
    selectedBillingPeriod,
    dueDate,
    isSingleFee,
    selectedFeeWiseObj,
  ]);

  // ── Toggle selection ──────────────────────────────────────────────────────
  const toggleRow = (idx: number) => {
    setRows(prev => prev.map((r, i) => i === idx && !r.alreadyExists ? { ...r, selected: !r.selected } : r));
  };

  const toggleAll = () => {
    const selectableRows = filteredRows.filter(r => !r.alreadyExists);
    const allSelected = selectableRows.every(r => r.selected);
    const selectableIds = new Set(selectableRows.map(r => r.student.id));
    setRows(prev => prev.map(r =>
      selectableIds.has(r.student.id) ? { ...r, selected: !allSelected } : r
    ));
  };

  // ── Filter rows by search ─────────────────────────────────────────────────
  const filteredRows = rows.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.student.name.toLowerCase().includes(q) ||
      (r.student.surname ?? "").toLowerCase().includes(q) ||
      r.student.admission_number.toLowerCase().includes(q)
    );
  });

  const selectedRows = filteredRows.filter(r => r.selected && !r.alreadyExists);
  const allSelectable = filteredRows.filter(r => !r.alreadyExists);
  const allSelected = allSelectable.length > 0 && allSelectable.every(r => r.selected);
  const someSelected = allSelectable.some(r => r.selected);

  // ── Generate fees ─────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (selectedRows.length === 0) {
      showToast("No students selected.", "warn");
      return;
    }

    setGenerating(true);
    try {
      const payloads: StudentFeePayload[] = selectedRows.map(r => ({
        student: r.student.id,
        academic_year: Number(selectedYear),
        fee_wise_class: Number(selectedFeeWise),
        billing_period: r.billingPeriod,
        due_date: r.dueDate,
      }));

      const { success, failed } = await bulkCreateStudentFees(payloads);

      // Mark successfully generated as existing
      const successStudentIds = new Set(success.map(s => s.student));
      setRows(prev => prev.map(r =>
        successStudentIds.has(r.student.id)
          ? { ...r, alreadyExists: true, existingStatus: "pending", selected: false }
          : r
      ));

      if (failed.length === 0) {
        showToast(`✓ Generated fees for ${success.length} student${success.length !== 1 ? "s" : ""}.`, "success");
      } else {
        showToast(`Generated ${success.length}, failed ${failed.length}. Check and retry.`, "warn");
      }
    } catch (e: any) {
      showToast(e.message ?? "Fee generation failed.", "error");
    } finally {
      setGenerating(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loadingInit) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: 12 }}>
        <Spinner size={32} />
        <p style={{ margin: 0, fontSize: 14, color: C.muted }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: 24, fontFamily: "inherit" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box}`}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IndianRupee size={19} color={C.accent} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: C.text }}>Generate Student Fees</h1>
            <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Select class, fee type & billing period, then generate fees for students</p>
          </div>
        </div>
      </div>

      {/* ── Filter Card ── */}
      <div style={{ background: C.card, borderRadius: 14, border: `1.5px solid ${C.border}`, padding: 24, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 16 }}>
          {/* Academic Year */}
          <Select
            label="Academic Year"
            value={selectedYear}
            onChange={setSelectedYear}
            options={academicYears.map(y => ({ value: String(y.id), label: y.name }))}
            placeholder="Select year…"
          />

          {/* Class */}
          <Select
            label="Class"
            value={selectedClass}
            onChange={v => { setSelectedClass(v); setStudentsLoaded(false); setRows([]); }}
            options={classes.map(c => ({ value: String(c.id), label: c.school_class }))}
            placeholder="Select class…"
          />

          {/* Fee Type */}
          <Select
            label="Fee Type"
            value={selectedFeeWise}
            onChange={setSelectedFeeWise}
            options={feeWiseList.map(f => ({ value: String(f.id), label: `${f.feetype_name} (₹${Number(f.amount).toLocaleString("en-IN")})` }))}
            placeholder={selectedClass ? "Select fee…" : "Select class first"}
            disabled={!selectedClass}
            loading={loadingFee}
          />

          {/* Billing Period — only for non-single fees */}
          {!isSingleFee && (
            <Select
              label="Billing Period"
              value={selectedBillingPeriod}
              onChange={setSelectedBillingPeriod}
              options={billingPeriods}
              placeholder={selectedFeeWise ? "Select period…" : "Select fee first"}
              disabled={!selectedFeeWise || isSingleFee}
            />
          )}

          {/* Due Date */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Due Date <span style={{ color: C.danger }}>*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              style={{
                padding: "10px 13px", border: `1.5px solid ${C.border}`, borderRadius: 10,
                fontSize: 13, fontWeight: 500, color: dueDate ? C.text : C.muted,
                background: "#fff", outline: "none", fontFamily: "inherit", width: "100%",
              }}
            />
          </div>
        </div>

        {/* Selected fee info strip */}
        {selectedFeeWiseObj && (
           <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.indigo50,
            borderRadius: 9, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.accent, fontWeight: 600 }}>
              <FileText size={13} />
              {selectedFeeWiseObj.feetype_name}
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>
              Amount: <strong style={{ color: C.text }}>₹{Number(selectedFeeWiseObj.amount).toLocaleString("en-IN")}</strong>
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>
              Cycle: <strong style={{ color: C.text }}>{selectedFeeWiseObj.billing_cycle === "single" ? "One-time" : selectedFeeWiseObj.billing_cycle}</strong>
            </div>
            {selectedFeeWiseObj.late_fee_enabled && (
              <div style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#fef3c7", color: "#92400e" }}>
                Late fee: ₹{selectedFeeWiseObj.late_fee_amount} / {selectedFeeWiseObj.late_fee_type === "per_day" ? "day" : "flat"}
              </div>
            )}
          </div>
        )}

        {/* Load Students button */}
        <button
          onClick={handleLoadStudents}
          disabled={loadingStudents}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "11px 24px", borderRadius: 10, border: "none",
            background: C.accent, color: "#fff", fontSize: 13, fontWeight: 700,
            cursor: loadingStudents ? "not-allowed" : "pointer",
            opacity: loadingStudents ? 0.75 : 1,
            boxShadow: "0 4px 14px rgba(91,94,244,0.3)",
          }}
        >
          {loadingStudents ? <Spinner size={15} color="#fff" /> : <Users size={15} />}
          {loadingStudents ? "Loading Students…" : "Load Students"}
        </button>
      </div>

      {/* ── Students Table ── */}
      {studentsLoaded && (
        <div style={{ background: C.card, borderRadius: 14, border: `1.5px solid ${C.border}`, overflow: "hidden" }}>

          {/* Table toolbar */}
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GraduationCap size={17} color={C.accent} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.text }}>
                  Students List ({rows.length})
                </p>
                <p style={{ margin: 0, fontSize: 11, color: C.muted }}>
                  {rows.filter(r => r.alreadyExists).length} already generated · {allSelectable.length} available
                </p>
              </div>
            </div>

            {/* Search */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.subtle, border: `1.5px solid ${C.border}`, borderRadius: 9, padding: "0 12px", height: 36, minWidth: 220 }}>
              <Search size={13} color={C.muted} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name or admission no…"
                style={{ flex: 1, border: "none", background: "transparent", fontSize: 12, outline: "none", color: C.text }}
              />
            </div>
          </div>

          {/* Column headers */}
          <div style={{
            display: "grid", gridTemplateColumns: "44px 40px 1fr 140px 130px 110px 90px 80px",
            padding: "9px 20px", background: C.bg, borderBottom: `1px solid ${C.border}`,
            alignItems: "center", gap: 8,
          }}>
            {/* Select all */}
            <div
              onClick={toggleAll}
              style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {allSelected
                ? <CheckSquare size={16} color={C.accent} />
                : someSelected
                  ? <div style={{ width: 16, height: 16, border: `2px solid ${C.accent}`, borderRadius: 4, background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 8, height: 2, background: C.accent, borderRadius: 2 }} />
                    </div>
                  : <Square size={16} color={C.muted} />
              }
            </div>
            {["#", "Student Name", "Admission No.", "Fee Type", "Amount (₹)", "Due Date", "Status"].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {filteredRows.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: C.muted }}>
              <Users size={28} style={{ display: "block", margin: "0 auto 10px", opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: 14 }}>{searchQuery ? "No students match your search" : "No students found for this class"}</p>
            </div>
          ) : (
            filteredRows.map((row, idx) => {
              const fullIdx = rows.findIndex(r => r.student.id === row.student.id);
              return (
                <div
                  key={row.student.id}
                  onClick={() => !row.alreadyExists && toggleRow(fullIdx)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "44px 40px 1fr 140px 130px 110px 90px 80px",
                    padding: "13px 20px",
                    borderBottom: `1px solid ${C.border}`,
                    alignItems: "center",
                    gap: 8,
                    cursor: row.alreadyExists ? "default" : "pointer",
                    background: row.alreadyExists
                      ? "#fafbfc"
                      : row.selected
                        ? C.indigo50
                        : C.card,
                    transition: "background 0.1s",
                    opacity: row.alreadyExists ? 0.75 : 1,
                  }}
                >
                  {/* Checkbox */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {row.alreadyExists ? (
                      <CheckCircle2 size={16} color={C.success} />
                    ) : row.selected ? (
                      <CheckSquare size={16} color={C.accent} />
                    ) : (
                      <Square size={16} color={C.muted} />
                    )}
                  </div>

                  {/* # */}
                  <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{idx + 1}</span>

                  {/* Name */}
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                      background: `hsl(${(row.student.id * 47) % 360}, 60%, 88%)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: `hsl(${(row.student.id * 47) % 360}, 50%, 35%)`,
                    }}>
                      {((row.student.surname ?? row.student.name)[0] ?? "?").toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text }}>
                        {[row.student.surname, row.student.name].filter(Boolean).join(" ")}
                      </p>
                      {row.student.gr_no && (
                        <p style={{ margin: 0, fontSize: 11, color: C.muted }}>GR: {row.student.gr_no}</p>
                      )}
                    </div>
                  </div>

                  {/* Admission No */}
                  <span style={{ fontSize: 12, color: C.muted, fontFamily: "monospace" }}>{row.student.admission_number}</span>

                  {/* Fee Type */}
                  <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{row.feeWiseClass.feetype_name}</span>

                  {/* Amount */}
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                    ₹{Number(row.feeWiseClass.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>

                  {/* Due Date */}
                  <span style={{ fontSize: 12, color: C.muted }}>{fmt(row.dueDate)}</span>

                  {/* Status */}
                  {row.alreadyExists
                    ? <StatusBadge status={row.existingStatus ?? "pending"} />
                    : <span style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>Not yet</span>
                  }
                </div>
              );
            })
          )}

          {/* Footer */}
          <div style={{
            padding: "14px 20px", borderTop: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                Total Selected: <span style={{ color: C.accent }}>{selectedRows.length}</span> student{selectedRows.length !== 1 ? "s" : ""}
              </span>
              {selectedRows.length > 0 && selectedFeeWiseObj && (
                <span style={{ fontSize: 12, color: C.muted }}>
                  Total: <strong style={{ color: C.text }}>
                    ₹{(selectedRows.length * Number(selectedFeeWiseObj.amount)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </strong>
                </span>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={selectedRows.length === 0 || generating}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "11px 28px", borderRadius: 10, border: "none",
                background: selectedRows.length === 0 ? C.subtle : C.accent,
                color: selectedRows.length === 0 ? C.muted : "#fff",
                fontSize: 13, fontWeight: 700,
                cursor: selectedRows.length === 0 || generating ? "not-allowed" : "pointer",
                opacity: generating ? 0.7 : 1,
                boxShadow: selectedRows.length > 0 ? "0 4px 14px rgba(91,94,244,0.3)" : "none",
                transition: "all 0.15s",
              }}
            >
              {generating ? <Spinner size={15} color={selectedRows.length > 0 ? "#fff" : C.muted} /> : <Zap size={15} />}
              {generating ? "Generating…" : `Generate Fees (${selectedRows.length})`}
            </button>
          </div>
        </div>
      )}

      {/* ── Empty state before loading ── */}
      {!studentsLoaded && !loadingStudents && (
        <div style={{
          background: C.card, borderRadius: 14, border: `1.5px dashed ${C.border}`,
          padding: "52px 24px", textAlign: "center",
        }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Users size={26} color={C.accent} />
          </div>
          <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: C.text }}>No students loaded yet</h3>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: C.muted, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
            Select an academic year, class, fee type, and due date above, then click <strong>Load Students</strong> to see the list.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
            {[
              { icon: <CalendarDays size={14} />, text: "Pick academic year" },
              { icon: <GraduationCap size={14} />, text: "Select class & fee" },
              { icon: <Users size={14} />, text: "Load students" },
              { icon: <Zap size={14} />, text: "Generate fees" },
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted }}>
                <span style={{ color: C.accent }}>{step.icon}</span>
                <span style={{ fontWeight: 500 }}>{step.text}</span>
                {i < 3 && <span style={{ color: "#d1d5db", marginLeft: 6 }}>→</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}