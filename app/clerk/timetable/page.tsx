"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Save,
  Eye,
  Clock,
  BookOpen,
  Coffee,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Wand2,
  GripVertical,
  Info,
  RefreshCw,
  Calendar,
  ArrowLeft,
  Download,
  Share2,
} from "lucide-react";

import {
  getTeachers,
  getDivisions,
  getSubjects,
  getTimetable,
  createTimetable,
  updateTimetable,
  getAssignedTeachers, // ← NEW import
} from "@/lib/forms";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const DAY_SHORT = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};
const DAY_FULL = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};
// const ACADEMIC_YEARS = ["2024-2025", "2025-2026", "2026-2027", "2027-2028"];

const SLOT_COLORS = [
  {
    bg: "bg-violet-100",
    text: "text-violet-700",
    border: "border-violet-200",
    icon: "bg-violet-600",
    badge: "bg-violet-100 text-violet-700",
    dot: "bg-violet-500",
  },
  {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: "bg-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: "bg-blue-600",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  {
    bg: "bg-pink-100",
    text: "text-pink-700",
    border: "border-pink-200",
    icon: "bg-pink-600",
    badge: "bg-pink-100 text-pink-700",
    dot: "bg-pink-500",
  },
  {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: "bg-amber-600",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  {
    bg: "bg-teal-100",
    text: "text-teal-700",
    border: "border-teal-200",
    icon: "bg-teal-600",
    badge: "bg-teal-100 text-teal-700",
    dot: "bg-teal-500",
  },
];

// ─── SMALL HELPERS ────────────────────────────────────────────────────────────
function fmtTime(t) {
  if (!t) return "";
  const parts = t.split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return t;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

function toApiTime(t) {
  if (!t) return "00:00:00";
  const parts = t.split(":");
  if (parts.length === 2) return `${t}:00`;
  return t;
}

function minutesBetween(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm));
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  const cfg = {
    success: { cls: "bg-emerald-600", Icon: CheckCircle2 },
    error: { cls: "bg-red-600", Icon: AlertCircle },
    info: { cls: "bg-blue-600", Icon: Info },
    warning: { cls: "bg-amber-500", Icon: AlertCircle },
  };
  const { cls, Icon } = cfg[type] ?? cfg.info;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold ${cls}`}
      style={{ animation: "slideUp 0.3s ease" }}
    >
      <Icon size={16} className="flex-shrink-0" />
      <span className="max-w-xs">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

// ─── SELECT FIELD ─────────────────────────────────────────────────────────────
function SelectField({
  value,
  onChange,
  children,
  placeholder,
  disabled = false,
  accent = "violet",
  icon: Icon,
}) {
  const ring = {
    violet: "focus:ring-violet-300 focus:border-violet-400",
    emerald: "focus:ring-emerald-300 focus:border-emerald-400",
    orange: "focus:ring-orange-300 focus:border-orange-400",
  };
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
        />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full border border-gray-200 rounded-xl py-2.5 text-sm text-gray-700 bg-white appearance-none focus:outline-none focus:ring-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${ring[accent] ?? ring.violet} ${Icon ? "pl-9 pr-10" : "px-3.5 pr-10"}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown
        size={15}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}

// ─── FIELD LABEL ─────────────────────────────────────────────────────────────
function Label({ children, required }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

// ─── STEP INDICATOR ──────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  const steps = [
    { id: 1, label: "Basic Information" },
    { id: 2, label: "Add Time Slots" },
    { id: 3, label: "Preview & Save" },
  ];
  const display = Math.min(Math.max(current, 1), 3);

  return (
    <div className="flex overflow-x-auto pb-2 mb-8">
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${display > s.id ? "bg-violet-600 text-white" : display === s.id ? "bg-violet-600 text-white ring-4 ring-violet-100" : "bg-gray-100 text-gray-400"}`}
            >
              {display > s.id ? <CheckCircle2 size={16} /> : s.id}
            </div>
            <span
              className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${display >= s.id ? "text-gray-800" : "text-gray-400"}`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 w-12 mx-3 rounded-full flex-shrink-0 ${display > s.id ? "bg-violet-500" : "bg-gray-200"}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── LIVE PREVIEW PANEL ───────────────────────────────────────────────────────
function LivePreviewPanel({ slots, day }) {
  const lectureCount = slots.filter((s) => s.is_lecture).length;
  const breakCount = slots.filter((s) => s.is_break).length;
  const totalMin = slots.reduce(
    (acc, s) => acc + minutesBetween(s.slot_start_time, s.slot_end_time),
    0,
  );
  const startTime = slots[0]?.slot_start_time ?? "";
  const endTime = slots[slots.length - 1]?.slot_end_time ?? "";
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  let lectureIndex = 0;

  return (
    <div className="w-full flex-shrink-0 bg-white flex flex-col h-full">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
          <Eye size={15} className="text-violet-500" /> Live Timetable Preview
        </h3>
        {day && (
          <span className="text-xs bg-violet-100 text-violet-700 font-bold px-3 py-1 rounded-full">
            {DAY_SHORT[day] ?? day}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {slots.length === 0 ? (
          <div className="text-center py-10">
            <Clock size={32} className="mx-auto mb-2 text-gray-200" />
            <p className="text-xs text-gray-300 font-medium">
              Add slots to see preview
            </p>
          </div>
        ) : (
          slots.map((slot, i) => {
            if (slot.is_break) {
              return (
                <div key={slot.id ?? i} className="flex items-center gap-3">
                  <div className="text-right w-20 flex-shrink-0">
                    <p className="text-[10px] text-gray-500 font-semibold">
                      {fmtTime(slot.slot_start_time)}
                    </p>
                    <p className="text-[10px] text-gray-300">
                      {fmtTime(slot.slot_end_time)}
                    </p>
                  </div>
                  <div className="flex-1 bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Coffee size={15} className="text-orange-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-orange-700">
                        Break Time
                      </p>
                      <p className="text-[10px] text-orange-400">
                        Relax & Refresh
                      </p>
                    </div>
                    <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">
                      Break
                    </span>
                  </div>
                </div>
              );
            }
            const color = SLOT_COLORS[lectureIndex % SLOT_COLORS.length];
            lectureIndex++;
            const hasSubject = !!(slot.subject_name || slot.subject);
            const hasTeacher = !!(slot.teacher_name || slot.teacher);
            return (
              <div key={slot.id ?? i} className="flex items-center gap-3">
                <div className="text-right w-20 flex-shrink-0">
                  <p className="text-[10px] text-gray-500 font-semibold">
                    {fmtTime(slot.slot_start_time)}
                  </p>
                  <p className="text-[10px] text-gray-300">
                    {fmtTime(slot.slot_end_time)}
                  </p>
                </div>
                <div className="flex-1 bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-2.5 hover:shadow-sm transition-shadow">
                  <div
                    className={`w-9 h-9 ${color.icon} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <BookOpen size={14} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800 truncate">
                      {hasSubject ? (
                        slot.subject_name || `Subject ${slot.subject}`
                      ) : (
                        <span className="text-gray-300">No subject</span>
                      )}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {hasTeacher ? (
                        slot.teacher_name || `Teacher ${slot.teacher}`
                      ) : (
                        <span className="text-gray-300">No teacher</span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] ${color.badge} font-bold px-2 py-0.5 rounded-full flex-shrink-0`}
                  >
                    Lecture
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-gray-100 px-5 py-4 bg-white">
        <h4 className="text-sm font-bold text-gray-800 mb-4">
          Schedule Summary
        </h4>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            {
              icon: BookOpen,
              label: "Total Lectures",
              value: lectureCount,
              color: "text-violet-600",
              bg: "bg-violet-50",
            },
            {
              icon: Coffee,
              label: "Total Breaks",
              value: breakCount,
              color: "text-orange-500",
              bg: "bg-orange-50",
            },
            {
              icon: Clock,
              label: "Total Duration",
              value: `${hours}h ${String(mins).padStart(2, "0")}m`,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              icon: Calendar,
              label: "Time Range",
              value:
                startTime && endTime
                  ? `${fmtTime(startTime)}\nto ${fmtTime(endTime)}`
                  : "—",
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-3`}>
              <Icon size={16} className={`${color} mb-1.5`} />
              <p className="text-sm font-black text-gray-800 whitespace-pre-line leading-tight">
                {String(value)}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
          <CheckCircle2 size={13} className="flex-shrink-0" />
          Preview updates automatically as you make changes
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 1 — Basic Information
// ═══════════════════════════════════════════════════════════════════
function Step1BasicInfo({ divisions, form, setForm, onNext }) {
  const [toast, setToast] = useState(null);

  const handleNext = () => {
    if (!form.class_division) {
      setToast({ msg: "Please select a Class & Division.", type: "error" });
      return;
    }
    if (!form.day) {
      setToast({ msg: "Please select a day.", type: "error" });
      return;
    }
    if (!form.start_time || !form.end_time) {
      setToast({ msg: "Please set start & end times.", type: "error" });
      return;
    }
    if (form.start_time >= form.end_time) {
      setToast({ msg: "End time must be after start time.", type: "error" });
      return;
    }
    onNext();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Info size={17} className="text-violet-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-800">Basic Information</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Set up the core details for this timetable
          </p>
        </div>
      </div>

      {/* ── Row 1: Day / Class / Lectures / Breaks — 4 columns ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        {/* Day */}
        <div>
          <Label required>Day</Label>
          <SelectField
            value={form.day}
            onChange={(v) => setForm((f) => ({ ...f, day: v }))}
            placeholder="Select day"
            icon={Calendar}
            accent="violet"
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {DAY_FULL[d]}
              </option>
            ))}
          </SelectField>
        </div>

        {/* Class & Division */}
        <div>
          <Label required>Class & Division</Label>
          <SelectField
            value={form.class_division}
            onChange={(v) => setForm((f) => ({ ...f, class_division: v }))}
            placeholder="Select class"
            accent="violet"
          >
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.class_name} - {d.division}
              </option>
            ))}
          </SelectField>
        </div>

        {/* Total Lectures */}
        <div>
          <Label required>Total Lectures</Label>
          <SelectField
            value={form.total_lecture}
            onChange={(v) =>
              setForm((f) => ({ ...f, total_lecture: Number(v) }))
            }
            accent="violet"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </SelectField>
        </div>

        {/* Total Breaks */}
        <div>
          <Label required>Total Breaks</Label>
          <SelectField
            value={form.total_breaks}
            onChange={(v) =>
              setForm((f) => ({ ...f, total_breaks: Number(v) }))
            }
            accent="orange"
          >
            {[0, 1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </SelectField>
        </div>
      </div>

      {/* ── Row 2: Start / End time ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <Label required>Start Time</Label>
          <div className="relative">
            <Clock
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
            />
            <input
              type="time"
              value={form.start_time}
              onChange={(e) =>
                setForm((f) => ({ ...f, start_time: e.target.value }))
              }
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 bg-white"
            />
          </div>
        </div>
        <div>
          <Label required>End Time</Label>
          <div className="relative">
            <Clock
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
            />
            <input
              type="time"
              value={form.end_time}
              onChange={(e) =>
                setForm((f) => ({ ...f, end_time: e.target.value }))
              }
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center pt-4 border-t border-gray-100">
        <div />
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-200"
        >
          Continue to Time Slots <ChevronRight size={15} />
        </button>
      </div>

      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 2 — Add Time Slots
// ═══════════════════════════════════════════════════════════════════
function Step2TimeSlots({
  form,
  subjects,
  teachers,
  assignedTeachers,
  slots,
  setSlots,
  onNext,
  onBack,
}) {
  const [toast, setToast] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const dragOver = useRef(null);

  // ── auto-generate ──────────────────────────────────────────────
  const autoGenerate = useCallback(() => {
    const lectureCount = form.total_lecture || 4;
    const breakCount = form.total_breaks ?? 1;
    const [sh, sm] = (form.start_time || "08:00").split(":").map(Number);
    const perLecture = 45;
    const perBreak = 15;

    // First lecture → class teacher (is_class_teacher === true)
    const classTeacherEntry = (assignedTeachers || []).find(
      (t) => t.is_class_teacher === true,
    );

    // Distribute break positions evenly between lectures
    const breakPositions = new Set();
    if (breakCount > 0) {
      const spacing = Math.floor(lectureCount / (breakCount + 1));
      for (let b = 1; b <= breakCount; b++) breakPositions.add(b * spacing);
    }

    const fmt = (m) =>
      `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

    const generated = [];
    let currentMin = sh * 60 + sm;
    let slotNumber = 1;
    let lecturesAdded = 0;
    let breaksAdded = 0;

    for (let i = 0; i < lectureCount; i++) {
      lecturesAdded++;
      const isFirst = i === 0;

      generated.push({
        id: genId(),
        slot_number: slotNumber++,
        is_lecture: true,
        is_break: false,
        slot_start_time: fmt(currentMin),
        slot_end_time: fmt(currentMin + perLecture),
        subject:
          isFirst && classTeacherEntry
            ? String(classTeacherEntry.subject ?? "")
            : "",
        teacher:
          isFirst && classTeacherEntry
            ? String(classTeacherEntry.teacher ?? "")
            : "",
        subject_name:
          isFirst && classTeacherEntry
            ? (classTeacherEntry.subject_name ?? "")
            : "",
        teacher_name:
          isFirst && classTeacherEntry
            ? (classTeacherEntry.teacher_name ?? "")
            : "",
      });
      currentMin += perLecture;

      if (breakPositions.has(lecturesAdded) && breaksAdded < breakCount) {
        generated.push({
          id: genId(),
          slot_number: slotNumber++,
          is_lecture: false,
          is_break: true,
          slot_start_time: fmt(currentMin),
          slot_end_time: fmt(currentMin + perBreak),
          subject: null,
          teacher: null,
        });
        currentMin += perBreak;
        breaksAdded++;
      }
    }

    setSlots(generated);
    setToast({
      msg: `Generated ${lectureCount} lectures & ${breaksAdded} breaks!`,
      type: "success",
    });
  }, [form, assignedTeachers, setSlots]);

  // ── helpers to compute continuous next start time ──────────────
  const nextStart = (prev) =>
    prev[prev.length - 1]?.slot_end_time ?? form.start_time ?? "";
  const fmt = (m) =>
    `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

  const addLecture = () =>
    setSlots((prev) => {
      const startTime = nextStart(prev);
      const [sh2, sm2] = startTime ? startTime.split(":").map(Number) : [0, 0];
      const endTime = startTime ? fmt(sh2 * 60 + sm2 + 45) : "";
      return [
        ...prev,
        {
          id: genId(),
          slot_number: prev.length + 1,
          is_lecture: true,
          is_break: false,
          slot_start_time: startTime,
          slot_end_time: endTime,
          subject: "",
          teacher: "",
          subject_name: "",
          teacher_name: "",
        },
      ];
    });

  const addBreak = () =>
    setSlots((prev) => {
      const startTime = nextStart(prev);
      const [sh2, sm2] = startTime ? startTime.split(":").map(Number) : [0, 0];
      const endTime = startTime ? fmt(sh2 * 60 + sm2 + 15) : "";
      return [
        ...prev,
        {
          id: genId(),
          slot_number: prev.length + 1,
          is_lecture: false,
          is_break: true,
          slot_start_time: startTime,
          slot_end_time: endTime,
          subject: null,
          teacher: null,
        },
      ];
    });

  const removeSlot = (id) =>
    setSlots((prev) =>
      prev
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, slot_number: i + 1 })),
    );

  const updateSlot = (id, field, value) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, [field]: value };
        if (field === "subject") {
          const subj = subjects.find((x) => x.id === Number(value));
          updated.subject_name = subj?.name ?? "";
        }
        if (field === "teacher") {
          const tchr = teachers.find((x) => x.id === Number(value));
          updated.teacher_name = tchr?.name ?? "";
        }
        return updated;
      }),
    );
  };

  // ── drag reorder ───────────────────────────────────────────────
  const onDragStart = (i) => setDragIndex(i);
  const onDragEnter = (i) => {
    dragOver.current = i;
  };
  const onDragEnd = () => {
    if (
      dragIndex === null ||
      dragOver.current === null ||
      dragIndex === dragOver.current
    ) {
      setDragIndex(null);
      dragOver.current = null;
      return;
    }
    setSlots((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIndex, 1);
      arr.splice(dragOver.current, 0, moved);
      return arr.map((s, idx) => ({ ...s, slot_number: idx + 1 }));
    });
    setDragIndex(null);
    dragOver.current = null;
  };

  const handleNext = () => {
    if (slots.length === 0) {
      setToast({ msg: "Add at least one slot.", type: "error" });
      return;
    }
    const noTime = slots.filter((s) => !s.slot_start_time || !s.slot_end_time);
    if (noTime.length > 0) {
      setToast({ msg: "Fill all slot start and end times.", type: "error" });
      return;
    }
    const invalidTime = slots.find(
      (s) =>
        s.slot_start_time &&
        s.slot_end_time &&
        s.slot_start_time >= s.slot_end_time,
    );
    if (invalidTime) {
      setToast({
        msg: `Slot ${invalidTime.slot_number}: end time must be after start time.`,
        type: "error",
      });
      return;
    }
    const incomplete = slots.filter(
      (s) => s.is_lecture && (!s.subject || !s.teacher),
    );
    if (incomplete.length > 0) {
      setToast({
        msg: `${incomplete.length} lecture(s) missing subject or teacher.`,
        type: "warning",
      });
      return;
    }
    onNext();
  };

  let lectureColorIdx = 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock size={17} className="text-violet-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Time Slots</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Add lectures and breaks for the selected day
            </p>
          </div>
        </div>
        <button
          onClick={autoGenerate}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-white border-2 border-violet-200 hover:border-violet-400 text-violet-700 rounded-xl text-xs font-bold transition-all hover:bg-violet-50"
        >
          <Wand2 size={13} /> Auto Generate Slots
        </button>
      </div>

      {slots.length > 0 && (
        <div className="hidden md:grid grid-cols-12 gap-2 px-3 pb-2 text-[10px] text-gray-400 font-bold uppercase tracking-wide">
          <div className="xl:col-span-1">#</div>

          <div className="xl:col-span-2">Time</div>

          <div className="xl:col-span-2">Type</div>

          <div className="xl:col-span-3">Subject *</div>

          <div className="xl:col-span-3">Teacher *</div>

          <div className="xl:col-span-1">Action</div>
        </div>
      )}

      <div className="space-y-2.5 mb-5">
        {slots.map((slot, i) => {
          const isBreak = slot.is_break;
          const color = isBreak
            ? null
            : SLOT_COLORS[lectureColorIdx % SLOT_COLORS.length];
          if (!isBreak) lectureColorIdx++;

          return (
            <div
              key={slot.id}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragEnter={() => onDragEnter(i)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`grid grid-cols-1 xl:grid-cols-12 gap-3 items-center rounded-2xl px-3 py-3 border-2 transition-all group cursor-grab active:cursor-grabbing ${
                isBreak
                  ? "bg-orange-50 border-orange-100 hover:border-orange-200"
                  : "bg-white border-gray-100 hover:border-violet-200 hover:shadow-sm"
              } ${dragIndex === i ? "opacity-50 scale-95" : ""}`}
            >
              {/* Drag + Number */}
              <div className="col-span-1 flex items-center gap-1">
                <GripVertical
                  size={14}
                  className="text-gray-300 flex-shrink-0"
                />
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0 ${isBreak ? "bg-orange-400" : color.icon}`}
                >
                  {slot.slot_number}
                </div>
              </div>

              {/* Time */}
              <div className="xl:col-span-2">
                <input
                  type="time"
                  value={slot.slot_start_time}
                  onChange={(e) =>
                    updateSlot(slot.id, "slot_start_time", e.target.value)
                  }
                  className={`w-full border rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 bg-white mb-1 ${isBreak ? "border-orange-200 focus:ring-orange-300" : "border-gray-200 focus:ring-violet-300"}`}
                />
                <input
                  type="time"
                  value={slot.slot_end_time}
                  onChange={(e) =>
                    updateSlot(slot.id, "slot_end_time", e.target.value)
                  }
                  className={`w-full border rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 bg-white ${isBreak ? "border-orange-200 focus:ring-orange-300" : "border-gray-200 focus:ring-violet-300"}`}
                />
              </div>

              {/* Type Badge */}
              <div className="col-span-2">
                {isBreak ? (
                  <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg">
                    <Coffee size={10} /> BREAK
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 ${color.badge} text-[10px] font-bold px-2.5 py-1.5 rounded-lg`}
                  >
                    <BookOpen size={10} /> LECTURE
                  </span>
                )}
              </div>

              {/* Subject */}
              <div className="xl:col-span-3">
                {isBreak ? (
                  <p className="text-[11px] text-orange-400 italic pl-1">
                    No subject or teacher required
                  </p>
                ) : (
                  <div className="relative">
                    <select
                      value={slot.subject}
                      onChange={(e) =>
                        updateSlot(slot.id, "subject", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white appearance-none pr-7 cursor-pointer"
                    >
                      <option value="">Subject *</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={12}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                )}
              </div>

              {/* Teacher */}
              <div className="col-span-3">
                {!isBreak && (
                  <div className="relative">
                    <select
                      value={slot.teacher}
                      onChange={(e) =>
                        updateSlot(slot.id, "teacher", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white appearance-none pr-7 cursor-pointer"
                    >
                      <option value="">Teacher *</option>
                      {/* Show only teachers assigned to this division */}
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={12}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                )}
              </div>

              {/* Delete */}
              <div className="col-span-1 flex justify-center">
                <button
                  onClick={() => removeSlot(slot.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-200 hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {slots.length === 0 && (
          <div className="text-center py-14 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <Clock size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-semibold text-gray-400">
              No slots added yet
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Click &ldquo;Add Lecture&rdquo; or &ldquo;Auto Generate
              Slots&rdquo; to get started
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-5">
        <button
          onClick={addLecture}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-2.5 border-2 border-violet-200 hover:border-violet-400 text-violet-700 rounded-xl text-sm font-bold hover:bg-violet-50 transition-all"
        >
          <Plus size={15} /> Add Lecture
        </button>
        <button
          onClick={addBreak}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-2.5 border-2 border-orange-200 hover:border-orange-400 text-orange-600 rounded-xl text-sm font-bold hover:bg-orange-50 transition-all"
        >
          <Plus size={15} /> Add Break
        </button>
        {slots.length > 0 && (
          <button
            onClick={() => setSlots([])}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-red-500 text-sm font-medium transition-colors ml-auto"
          >
            <Trash2 size={14} /> Clear All Slots
          </button>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center gap-2 mb-6">
        <span className="text-base">💡</span>
        <p className="text-xs text-amber-700 font-medium">
          Tip: Drag and drop the slots to reorder them
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={onBack}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-200"
        >
          Preview & Save <ChevronRight size={15} />
        </button>
      </div>

      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 3 — Preview & Save
// ═══════════════════════════════════════════════════════════════════
function Step3PreviewSave({
  form,
  slots,
  subjects,
  teachers,
  divisions,
  existingId,
  onSaved,
  onBack,
}) {
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(existingId ?? null);
  const [toast, setToast] = useState(null);

  const divName = divisions.find((d) => d.id === Number(form.class_division));

  const buildPayload = () => ({
    day: form.day,
    class_division: Number(form.class_division),
    total_lecture: Number(form.total_lecture),
    start_time: toApiTime(form.start_time),
    end_time: toApiTime(form.end_time),
    slots: slots.map((s, i) => ({
      slot_number: i + 1,
      is_lecture: !!s.is_lecture,
      is_break: !!s.is_break,
      slot_start_time: toApiTime(s.slot_start_time),
      slot_end_time: toApiTime(s.slot_end_time),
      subject: s.is_lecture ? Number(s.subject) || null : null,
      teacher: s.is_lecture ? Number(s.teacher) || null : null,
    })),
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      let record;
      if (savedId) {
        record = await updateTimetable(savedId, buildPayload());
        setToast({ msg: "Timetable updated successfully!", type: "success" });
      } else {
        record = await createTimetable(buildPayload());
        setSavedId(record.id);
        setToast({ msg: "Timetable saved successfully!", type: "success" });
      }
      setTimeout(() => onSaved(record), 1200);
    } catch (e) {
      setToast({ msg: e.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  let lectureIdx = 0;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Eye size={17} className="text-purple-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-800">Preview & Save</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Review everything before saving to the server
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Day", value: DAY_FULL[form.day] ?? form.day },
          {
            label: "Class",
            value: divName
              ? `${divName.class_name} (${divName.division})`
              : "—",
          },
          { label: "Year", value: form.academicYear ?? "—" },
          {
            label: "Time",
            value: `${fmtTime(form.start_time)} – ${fmtTime(form.end_time)}`,
          },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
              {label}
            </p>
            <p className="text-sm font-black text-gray-800 mt-0.5 leading-tight">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-2.5 mb-6">
        {slots.map((slot, i) => {
          const isBreak = slot.is_break;
          const color = isBreak
            ? null
            : SLOT_COLORS[lectureIdx % SLOT_COLORS.length];
          if (!isBreak) lectureIdx++;
          return (
            <div
              key={slot.id ?? i}
              className={`flex items-center gap-4 rounded-2xl p-4 border-2 ${isBreak ? "bg-orange-50 border-orange-100" : "bg-white border-gray-100 hover:shadow-sm"} transition-shadow`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isBreak ? "bg-orange-100" : color.icon}`}
              >
                {isBreak ? (
                  <Coffee size={18} className="text-orange-500" />
                ) : (
                  <BookOpen size={16} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {isBreak ? (
                  <>
                    <p className="font-bold text-orange-700">Break Time</p>
                    <p className="text-xs text-orange-400">
                      {fmtTime(slot.slot_start_time)} –{" "}
                      {fmtTime(slot.slot_end_time)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className={`font-bold ${color.text}`}>
                      {slot.subject_name ||
                        subjects.find((s) => s.id === Number(slot.subject))
                          ?.name ||
                        "—"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fmtTime(slot.slot_start_time)} –{" "}
                      {fmtTime(slot.slot_end_time)} ·{" "}
                      {slot.teacher_name ||
                        teachers.find((t) => t.id === Number(slot.teacher))
                          ?.name ||
                        "—"}
                    </p>
                  </>
                )}
              </div>
              <div className="flex-shrink-0 text-right">
                <span
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${isBreak ? "bg-orange-100 text-orange-600" : color.badge}`}
                >
                  {isBreak ? "Break" : `Period ${slot.slot_number}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={onBack}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
            <Download size={14} /> Export PDF
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-200"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {saving
              ? "Saving…"
              : savedId
                ? "Update Timetable"
                : "Save Timetable"}
          </button>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SUCCESS VIEW
// ═══════════════════════════════════════════════════════════════════
function SuccessView({
  form,
  slots,
  subjects,
  teachers,
  divisions,
  savedRecord,
  onCreateNew,
}) {
  const divName = divisions.find((d) => d.id === Number(form.class_division));
  let lectureIdx = 0;

  return (
    <div>
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={28} className="text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-emerald-800 text-lg">
            Timetable Saved Successfully!
          </p>
          <p className="text-sm text-emerald-600 mt-0.5">
            {divName ? `${divName.class_name} (${divName.division})` : ""} ·{" "}
            {DAY_FULL[form.day]} · ID #{savedRecord?.id}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-all">
            <Share2 size={12} /> Share
          </button>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-200"
          >
            <Plus size={12} /> New Timetable
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {slots.map((slot, i) => {
          const isBreak = slot.is_break;
          const color = isBreak
            ? null
            : SLOT_COLORS[lectureIdx % SLOT_COLORS.length];
          if (!isBreak) lectureIdx++;
          return (
            <div
              key={slot.id ?? i}
              className={`flex items-center gap-4 rounded-2xl p-4 border-2 ${isBreak ? "bg-orange-50 border-orange-100" : `${color.bg} ${color.border}`}`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isBreak ? "bg-orange-100" : color.icon}`}
              >
                {isBreak ? (
                  <Coffee size={18} className="text-orange-500" />
                ) : (
                  <BookOpen size={16} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {isBreak ? (
                  <>
                    <p className="font-bold text-orange-700">Break Time</p>
                    <p className="text-xs text-orange-400">
                      {fmtTime(slot.slot_start_time)} –{" "}
                      {fmtTime(slot.slot_end_time)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className={`font-bold ${color.text}`}>
                      {slot.subject_name ||
                        subjects.find((s) => s.id === Number(slot.subject))
                          ?.name ||
                        "—"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fmtTime(slot.slot_start_time)} –{" "}
                      {fmtTime(slot.slot_end_time)} ·{" "}
                      {slot.teacher_name ||
                        teachers.find((t) => t.id === Number(slot.teacher))
                          ?.name ||
                        "—"}
                    </p>
                  </>
                )}
              </div>
              <span
                className={`text-[11px] font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${isBreak ? "bg-orange-100 text-orange-600" : "bg-white/70 " + color.text}`}
              >
                {isBreak ? "Break" : `Period ${slot.slot_number}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROOT EXPORT — CreateTimetablePage
// ═══════════════════════════════════════════════════════════════════
export default function CreateTimetablePage() {
  const [divisions, setDivisions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [assignedTeachers, setAssignedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState(null);

  const [step, setStep] = useState(1);
  const [academicYear, setAcademicYear] = useState("2026-2027");

  const [form, setForm] = useState({
    day: "monday",
    class_division: "",
    total_lecture: 4,
    total_breaks: 1, // ← NEW
    start_time: "08:00",
    end_time: "12:00",
    academicYear: "2026-2027",
  });

  const [slots, setSlots] = useState([]);
  const [existingId, setExistingId] = useState(null);
  const [savedRecord, setSavedRecord] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // ── Load master data on mount ─────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [divs, subs, tchs] = await Promise.all([
          getDivisions(),
          getSubjects(),
          getTeachers(),
        ]);
        setDivisions(Array.isArray(divs) ? divs : []);
        setSubjects(Array.isArray(subs) ? subs : []);
        setTeachers(Array.isArray(tchs) ? tchs : []);
      } catch (e) {
        // ← fix: e was referenced outside catch before
        setLoadErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Fetch assigned teachers whenever division changes ─────────────
  // Single effect — no duplicate
  useEffect(() => {
    if (!form.class_division) return;
    (async () => {
      try {
        const assigned = await getAssignedTeachers(form.class_division);
        setAssignedTeachers(Array.isArray(assigned) ? assigned : []);
      } catch {
        setAssignedTeachers([]);
      }
    })();
  }, [form.class_division]);

  // ── Restore existing timetable when division or day changes ──────
  useEffect(() => {
    if (!form.class_division) return;
    (async () => {
      try {
        const records = await getTimetable(Number(form.class_division));
        const list = Array.isArray(records) ? records : [];
        const match = list.find((r) => r.day === form.day);
        if (match) {
          setExistingId(match.id);
          const restored = (match.slots ?? []).map((s) => ({
            id: genId(),
            slot_number: s.slot_number,
            is_lecture: !!s.is_lecture,
            is_break: !!s.is_break,
            slot_start_time: s.slot_start_time?.slice(0, 5) ?? "",
            slot_end_time: s.slot_end_time?.slice(0, 5) ?? "",
            subject: s.subject ?? "",
            teacher: s.teacher ?? "",
            subject_name: subjects.find((x) => x.id === s.subject)?.name ?? "",
            teacher_name: teachers.find((x) => x.id === s.teacher)?.name ?? "",
          }));
          setSlots(restored);
          setForm((f) => ({
            ...f,
            total_lecture: match.total_lecture ?? f.total_lecture,
            start_time: match.start_time?.slice(0, 5) ?? f.start_time,
            end_time: match.end_time?.slice(0, 5) ?? f.end_time,
          }));
        } else {
          setExistingId(null);
        }
      } catch {
        // Silently ignore — timetable may not exist yet
      }
    })();
  }, [form.class_division, form.day, subjects, teachers]);

  const handleReset = () => {
    setStep(1);
    setSlots([]);
    setExistingId(null);
    setSavedRecord(null);
    setShowSuccess(false);
    setAcademicYear("2026-2027");
    setForm({
      day: "monday",
      class_division: "",
      total_lecture: 4,
      total_breaks: 1, // ← included in reset
      start_time: "08:00",
      end_time: "12:00",
      academicYear: "2026-2027",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2
            size={36}
            className="animate-spin text-violet-500 mx-auto mb-3"
          />
          <p className="text-sm text-gray-500 font-medium">
            Loading timetable data…
          </p>
        </div>
      </div>
    );
  }

  if (loadErr) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle size={36} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm text-red-600 font-semibold">
            Failed to load data
          </p>
          <p className="text-xs text-gray-400 mt-1">{loadErr}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#f8f7ff]"
      style={{ fontFamily: "'DM Sans', 'Nunito', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
        @keyframes slideUp { from { transform:translateY(16px); opacity:0; } to { transform:translateY(0); opacity:1; } }
        .animate-slide-up { animation: slideUp 0.25s ease; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:#f3f4f6; }
        ::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:99px; }
      `}</style>

      {/* ── Page header ── */}
      <div className="px-3 sm:px-6 pt-4 sm:pt-6 pb-4">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <span className="hover:text-violet-600 cursor-pointer transition-colors">
            Timetable
          </span>
          <ChevronRight size={12} />
          <span className="text-gray-700 font-semibold">Create Timetable</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              Create Timetable
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Create and manage class schedules easily.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
            {existingId && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-2 rounded-xl">
                <RefreshCw size={12} /> Editing existing timetable
              </div>
            )}
            {/* <div className="relative">
              <Calendar
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <select
                value={academicYear}
                onChange={(e) => {
                  setAcademicYear(e.target.value);
                  setForm((f) => ({ ...f, academicYear: e.target.value }));
                }}
                className="border border-gray-200 bg-white rounded-xl pl-9 pr-9 py-2.5 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300 appearance-none cursor-pointer"
              >
                {ACADEMIC_YEARS.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div> */}
            <button className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 border-2 border-violet-200 text-violet-700 bg-white rounded-xl text-sm font-bold hover:bg-violet-50 transition-all">
              <Eye size={15} /> Preview
            </button>
            <button
              onClick={() => {
                if (!showSuccess && step < 3) setStep(3);
              }}
              className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-200"
            >
              <Save size={15} /> Save Timetable
            </button>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-col xl:flex-row min-h-0 px-3 sm:px-6 pb-6 sm:pb-8 gap-4 sm:gap-6 items-start overflow-x-hidden">
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-6 overflow-hidden">
            {!showSuccess && <StepIndicator current={step} />}
            <div
              className="animate-slide-up"
              key={showSuccess ? "success" : step}
            >
              {showSuccess ? (
                <SuccessView
                  form={form}
                  slots={slots}
                  subjects={subjects}
                  teachers={teachers}
                  divisions={divisions}
                  savedRecord={savedRecord}
                  onCreateNew={handleReset}
                />
              ) : step === 1 ? (
                <Step1BasicInfo
                  divisions={divisions}
                  form={form}
                  setForm={setForm}
                  onNext={() => {
                    setStep(2);
                    // Auto-generate slots if none exist yet
                    if (slots.length === 0) {
                      const lectureCount = form.total_lecture || 4;
                      const breakCount = form.total_breaks ?? 1;
                      const [sh, sm] = (form.start_time || "08:00")
                        .split(":")
                        .map(Number);
                      const perLecture = 45;
                      const perBreak = 15;

                      const classTeacherEntry = (assignedTeachers || []).find(
                        (t) => t.is_class_teacher === true,
                      );

                      const breakPositions = new Set();
                      if (breakCount > 0) {
                        const spacing = Math.floor(
                          lectureCount / (breakCount + 1),
                        );
                        for (let b = 1; b <= breakCount; b++)
                          breakPositions.add(b * spacing);
                      }

                      const fmt = (m) =>
                        `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

                      const generated = [];
                      let currentMin = sh * 60 + sm;
                      let slotNumber = 1;
                      let lecturesAdded = 0;
                      let breaksAdded = 0;

                      for (let i = 0; i < lectureCount; i++) {
                        lecturesAdded++;
                        const isFirst = i === 0;

                        generated.push({
                          id:
                            Math.random().toString(36).slice(2) +
                            Date.now().toString(36),
                          slot_number: slotNumber++,
                          is_lecture: true,
                          is_break: false,
                          slot_start_time: fmt(currentMin),
                          slot_end_time: fmt(currentMin + perLecture),
                          subject:
                            isFirst && classTeacherEntry
                              ? String(classTeacherEntry.subject ?? "")
                              : "",
                          teacher:
                            isFirst && classTeacherEntry
                              ? String(classTeacherEntry.teacher ?? "")
                              : "",
                          subject_name:
                            isFirst && classTeacherEntry
                              ? (classTeacherEntry.subject_name ?? "")
                              : "",
                          teacher_name:
                            isFirst && classTeacherEntry
                              ? (classTeacherEntry.teacher_name ?? "")
                              : "",
                        });
                        currentMin += perLecture;

                        if (
                          breakPositions.has(lecturesAdded) &&
                          breaksAdded < breakCount
                        ) {
                          generated.push({
                            id:
                              Math.random().toString(36).slice(2) +
                              Date.now().toString(36),
                            slot_number: slotNumber++,
                            is_lecture: false,
                            is_break: true,
                            slot_start_time: fmt(currentMin),
                            slot_end_time: fmt(currentMin + perBreak),
                            subject: null,
                            teacher: null,
                          });
                          currentMin += perBreak;
                          breaksAdded++;
                        }
                      }

                      setSlots(generated);
                    }
                  }}
                />
              ) : step === 2 ? (
                <Step2TimeSlots
                  form={form}
                  subjects={subjects}
                  teachers={teachers}
                  assignedTeachers={assignedTeachers}
                  slots={slots}
                  setSlots={setSlots}
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
                />
              ) : (
                <Step3PreviewSave
                  form={form}
                  slots={slots}
                  subjects={subjects}
                  teachers={teachers}
                  divisions={divisions}
                  existingId={existingId}
                  onBack={() => setStep(2)}
                  onSaved={(record) => {
                    setSavedRecord(record);
                    setShowSuccess(true);
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="hidden 2xl:block w-[300px] flex-shrink-0">
          <div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
            style={{
              maxHeight: "calc(100vh - 130px)",
              position: "sticky",
              top: "24px",
            }}
          >
            <LivePreviewPanel slots={slots} day={form.day} />
          </div>
        </div>
      </div>
    </div>
  );
}
