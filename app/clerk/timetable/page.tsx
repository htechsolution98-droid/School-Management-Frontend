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
  getAssignedTeachers,
} from "@/lib/forms";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Division {
  id: number;
  class_name: string;
  division: string;
}

interface Subject {
  id: number;
  name: string;
  division?: number;
  school?: number;
}

interface Teacher {
  id: number;
  name: string;
}

interface AssignedTeacher {
  teacher: number | string;
  subject: number | string;
  teacher_name?: string;
  subject_name?: string;
  is_class_teacher?: boolean;
  division?: number | string;
}

interface Slot {
  id: string;
  slot_number: number;
  is_lecture: boolean;
  is_break: boolean;
  slot_start_time: string;
  slot_end_time: string;
  subject: string | number | null;
  teacher: string | number | null;
  subject_name?: string;
  teacher_name?: string;
}

interface FormDataType {
  day: string;
  class_division: string | number;
  total_lecture: number;
  total_breaks: number;
  start_time: string;
  end_time: string;
  academicYear: string;
  lecture_duration: number;
  break_duration: number;
}
interface TimetableRecord {
  id: number;
  day: string;
  class_division: number;
  total_lecture: number;
  start_time: string;
  end_time: string;
  slots: {
    slot_number: number;
    is_lecture: boolean;
    is_break: boolean;
    slot_start_time: string;
    slot_end_time: string;
    subject: number | null;
    teacher: number | null;
  }[];
}

interface ToastData {
  msg: string;
  type: "success" | "error" | "info" | "warning";
}

interface ToastProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose: () => void;
}

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
const DAY_SHORT: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};
const DAY_FULL: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

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
function fmtTime(t: string): string {
  if (!t) return "";
  const parts = t.split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return t;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

function toApiTime(t: string): string {
  if (!t) return "00:00:00";
  const parts = t.split(":");
  if (parts.length === 2) return `${t}:00`;
  return t;
}

function minutesBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm));
}

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function fmtMinutes(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  const cfg: Record<string, { cls: string; Icon: React.ElementType }> = {
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
}: {
  value: string | number;
  onChange: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  accent?: string;
  icon?: React.ElementType;
}) {
  const ring: Record<string, string> = {
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
function Label({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

// ─── STEP INDICATOR ──────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  const steps = [
    { id: 1, label: "Basic Info", fullLabel: "Basic Information" },
    { id: 2, label: "Time Slots", fullLabel: "Add Time Slots" },
    { id: 3, label: "Preview", fullLabel: "Preview & Save" },
  ];
  const display = Math.min(Math.max(current, 1), 3);

  return (
    <div className="flex items-center justify-between w-full mb-6 px-1">
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 flex-shrink-0">
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 transition-all ${display > s.id
                ? "bg-violet-600 text-white"
                : display === s.id
                  ? "bg-violet-600 text-white ring-2 sm:ring-4 ring-violet-100"
                  : "bg-gray-100 text-gray-400"
                }`}
            >
              {display > s.id ? <CheckCircle2 size={14} /> : s.id}
            </div>
            <span
              className={`text-[9px] sm:text-sm font-semibold text-center sm:text-left leading-tight ${display >= s.id ? "text-gray-800" : "text-gray-400"
                }`}
            >
              <span className="sm:hidden">{s.label}</span>
              <span className="hidden sm:inline">{s.fullLabel}</span>
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 flex-1 mx-1 sm:mx-2 rounded-full ${display > s.id ? "bg-violet-500" : "bg-gray-200"
                }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── LIVE PREVIEW PANEL ───────────────────────────────────────────────────────
function LivePreviewPanel({ slots, day }: { slots: Slot[]; day: string }) {
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
    <div className="w-full xl:max-w-[380px] flex-shrink-0 bg-white flex flex-col h-full rounded-2xl">
      <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
          <Eye size={15} className="text-violet-500" /> Live Timetable Preview
        </h3>
        {day && (
          <span className="text-xs bg-violet-100 text-violet-700 font-bold px-3 py-1 rounded-full">
            {DAY_SHORT[day] ?? day}
          </span>
        )}
      </div>

      <div
        className="overflow-y-auto px-4 py-3 space-y-2 max-h-[400px] xl:max-h-[calc(100vh-420px)]"
      >
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
                  <div className="text-right w-[72px] flex-shrink-0">
                    <p className="text-[10px] text-gray-500 font-semibold">
                      {fmtTime(slot.slot_start_time)}
                    </p>
                    <p className="text-[10px] text-gray-300">
                      {fmtTime(slot.slot_end_time)}
                    </p>
                  </div>
                  <div className="flex-1 bg-orange-50 border border-orange-100 rounded-xl px-2.5 py-2 flex items-center gap-2">
                    <div className="w-7 h-7 bg-orange-100 rounded-md flex items-center justify-center flex-shrink-0">
                      <Coffee size={15} className="text-orange-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-orange-700">
                        Break Time
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
                <div className="text-right w-[72px] flex-shrink-0">
                  <p className="text-[10px] text-gray-500 font-semibold">
                    {fmtTime(slot.slot_start_time)}
                  </p>
                  <p className="text-[10px] text-gray-300">
                    {fmtTime(slot.slot_end_time)}
                  </p>
                </div>
                <div className="flex-1 bg-white border border-gray-100 rounded-xl px-2.5 py-2 flex items-center gap-2 hover:shadow-sm transition-shadow">
                  <div
                    className={`w-7 h-7 ${color.icon} rounded-md flex items-center justify-center flex-shrink-0`}
                  >
                    <BookOpen size={14} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800 truncate max-w-[100px]">
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

      <div className="border-t border-gray-100 px-4 py-3 bg-white">
        <h4 className="text-sm font-bold text-gray-800 mb-4">
          Schedule Summary
        </h4>
        <div className="grid grid-cols-2 gap-2 mb-3">
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
          ].map(({ icon: IconComp, label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-2.5`}>
              <IconComp size={16} className={`${color} mb-1.5`} />
              <p className="text-sm font-black text-gray-800 whitespace-pre-line leading-tight">
                {String(value)}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        {/* <div className="flex items-center gap-2 text-[11px] text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
          <CheckCircle2 size={13} className="flex-shrink-0" />
          Preview updates automatically as you make changes
        </div> */}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STEP 1 — Basic Information
// ═══════════════════════════════════════════════════════════════════
function Step1BasicInfo({
  divisions,
  form,
  setForm,
  onNext,
  existingDays,
  onViewDay,
  onPreviewDay,
}: {
  divisions: Division[];
  form: FormDataType;
  setForm: React.Dispatch<React.SetStateAction<FormDataType>>;
  onNext: () => void;
  existingDays: { day: string; id: number }[];
  onViewDay: (day: string) => void;
  onPreviewDay: (day: string) => void;
}) {
  const [toast, setToast] = useState<ToastData | null>(null);

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

    // ← ADD THIS BLOCK HERE, before onNext()
    const totalMinutesAvailable = minutesBetween(
      form.start_time,
      form.end_time,
    );
    const minRequired = form.total_lecture * form.lecture_duration + form.total_breaks * form.break_duration;

    if (totalMinutesAvailable < minRequired) {
      const neededHr = Math.floor(minRequired / 60);
      const neededMin = minRequired % 60;
      setToast({
        msg: `Not enough time! ${form.total_lecture} lectures + ${form.total_breaks} break(s) need at least ${neededHr}h ${neededMin}m. Please increase the time range or reduce lectures/breaks.`,
        type: "error",
      });
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
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

        <div>
          <Label required>Total Lectures</Label>
          <SelectField
            value={form.total_lecture}
            onChange={(v) => setForm((f) => ({ ...f, total_lecture: Number(v) }))}
            accent="violet"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </SelectField>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
        <div>
          <Label required>Total Breaks</Label>
          <SelectField
            value={form.total_breaks}
            onChange={(v) => setForm((f) => ({ ...f, total_breaks: Number(v) }))}
            accent="orange"
          >
            {[0, 1, 2, 3].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </SelectField>
        </div>

        <div>
          <Label required>Lecture Duration (mins)</Label>
          <SelectField
            value={form.lecture_duration}
            onChange={(v) => setForm((f) => ({ ...f, lecture_duration: Number(v) }))}
            accent="violet"
          >
            {[30, 35, 40, 45, 50, 55, 60].map((n) => (
              <option key={n} value={n}>{n} min</option>
            ))}
          </SelectField>
        </div>

        <div>
          <Label required>Break Duration (mins)</Label>
          <SelectField
            value={form.break_duration}
            onChange={(v) => setForm((f) => ({ ...f, break_duration: Number(v) }))}
            accent="orange"
          >
            {[5, 10, 15, 20, 25, 30].map((n) => (
              <option key={n} value={n}>{n} min</option>
            ))}
          </SelectField>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
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
              onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
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
              onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 bg-white"
            />
          </div>
        </div>
      </div>

      {form.class_division && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <Calendar size={13} className="text-violet-500" />
            Weekly timetable status for this class:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row lg:flex-wrap gap-2">

            {DAYS.map((day) => {
              const existing = existingDays.find((e) => e.day === day);
              if (existing) {
                return (
                  <div
                    key={day}
                    className={`w-full min-h-[80px] flex flex-col justify-between gap-2 px-3 py-2.5 rounded-2xl border-2 text-xs font-bold ${form.day === day
                      ? "bg-violet-50 border-violet-300 text-violet-700"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                      }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2
                        size={11}
                        className="text-emerald-500 flex-shrink-0"
                      />
                      <span className="text-sm leading-none">
                        {DAY_FULL[day]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 w-full">
                      <button
                        onClick={() => onPreviewDay(day)}
                        className="flex-1 flex items-center justify-center gap-1 text-[10px] bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg font-bold transition-all min-w-0"
                      >
                        <Eye size={9} />
                        <span>View</span>
                      </button>

                      <button
                        onClick={() => onViewDay(day)}
                        className="flex-1 flex items-center justify-center text-[10px] bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded-lg font-bold transition-all min-w-0"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={day}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-dashed border-gray-200 text-xs font-bold text-gray-300"
                >
                  <Clock size={11} className="flex-shrink-0" />
                  {DAY_FULL[day]}
                  <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-lg font-bold">
                    Not created
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center pt-4 border-t border-gray-100">
        <div />
        <button
          onClick={handleNext}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-200"
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
  divisions,
  slots,
  setSlots,
  onNext,
  onBack,
}: {
  form: FormDataType;
  subjects: Subject[];
  teachers: Teacher[];
  assignedTeachers: AssignedTeacher[];
  divisions: Division[];
  slots: Slot[];
  setSlots: React.Dispatch<React.SetStateAction<Slot[]>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const dragOver = useRef<number | null>(null);

  const autoGenerate = useCallback(() => {
    const lectureCount = form.total_lecture || 4;
    const breakCount = form.total_breaks ?? 1;

    const totalMinutesAvailable = minutesBetween(
      form.start_time,
      form.end_time,
    );
    const minRequired = lectureCount * form.lecture_duration + breakCount * form.break_duration;
    if (totalMinutesAvailable < minRequired) {
      const neededHr = Math.floor(minRequired / 60);
      const neededMin = minRequired % 60;
      setToast({
        msg: `Not enough time! Need at least ${neededHr}h ${neededMin}m for ${lectureCount} lectures + ${breakCount} break(s). Increase the time range or reduce lectures/breaks.`,
        type: "error",
      });
      return;
    }

    const [sh, sm] = (form.start_time || "08:00").split(":").map(Number);
    const perLecture = form.lecture_duration;
    const perBreak = form.break_duration;

    const classTeacherEntry = (assignedTeachers || []).find(
      (t) =>
        t.is_class_teacher === true &&
        String(t.division) === String(form.class_division),
    );


    const breakPositions = new Set<number>();
    if (breakCount > 0) {
      const spacing = Math.floor(lectureCount / (breakCount + 1));
      for (let b = 1; b <= breakCount; b++) breakPositions.add(b * spacing);
    }

    const generated: Slot[] = [];
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
        slot_start_time: fmtMinutes(currentMin),
        slot_end_time: fmtMinutes(currentMin + perLecture),
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
          slot_start_time: fmtMinutes(currentMin),
          slot_end_time: fmtMinutes(currentMin + perBreak),
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

  const nextStart = (prev: Slot[]): string =>
    prev[prev.length - 1]?.slot_end_time ?? form.start_time ?? "";

  const addLecture = () =>
    setSlots((prev) => {
      const startTime = nextStart(prev);
      const [sh2, sm2] = startTime ? startTime.split(":").map(Number) : [0, 0];
      const endTime = startTime ? fmtMinutes(sh2 * 60 + sm2 + 45) : "";
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
      const endTime = startTime ? fmtMinutes(sh2 * 60 + sm2 + 15) : "";
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

  const removeSlot = (id: string) =>
    setSlots((prev) =>
      prev
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, slot_number: i + 1 })),
    );

  const updateSlot = (id: string, field: string, value: string) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated: Slot = { ...s, [field]: value };
        if (field === "subject") {
          const atEntry = assignedTeachers.find(
            (at) => String(at.subject) === String(value),
          );

          updated.subject_name =
            atEntry?.subject_name ??
            subjects.find((s) => String(s.id) === String(value))?.name ??
            "";


          // Auto-fill teacher if only one teacher is assigned to this subject
          const matchingTeachers = assignedTeachers.filter(
            (at) => String(at.subject) === String(value),
          );
          const classTeacher = matchingTeachers.find((at) => at.is_class_teacher === true);
          const autoTeacher = classTeacher ?? (matchingTeachers.length === 1 ? matchingTeachers[0] : null);

          if (autoTeacher) {
            updated.teacher = String(autoTeacher.teacher);
            const tchr = teachers.find(
              (t) => String(t.id) === String(autoTeacher.teacher),
            );
            updated.teacher_name =
              tchr?.name ??
              (autoTeacher as AssignedTeacher & { teacher_name?: string }).teacher_name ??
              "";
          } else {
            // Multiple teachers, none is class teacher — let user pick
            updated.teacher = "";
            updated.teacher_name = "";
          }
        }
        if (field === "teacher") {
          const tchr = teachers.find((x: Teacher) => x.id === Number(value));
          updated.teacher_name = tchr?.name ?? "";
        }
        return updated;
      }),
    );
  };

  const onDragStart = (i: number) => setDragIndex(i);
  const onDragEnter = (i: number) => {
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
      if (dragOver.current !== null) {
        arr.splice(dragOver.current, 0, moved);
      }
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
        {/* Info banner instead of Auto Generate button */}
        <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 border-2 border-violet-100 rounded-xl">
          <div className="flex items-center gap-1.5">
            <BookOpen size={13} className="text-violet-500 flex-shrink-0" />
            <span className="text-xs font-bold text-violet-700">
              {divisions.find((d) => String(d.id) === String(form.class_division))
                ? `${divisions.find((d) => String(d.id) === String(form.class_division))!.class_name} - ${divisions.find((d) => String(d.id) === String(form.class_division))!.division}`
                : "—"}
            </span>
          </div>
          <span className="text-violet-300">·</span>
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-violet-500 flex-shrink-0" />
            <span className="text-xs font-bold text-violet-700">
              {DAY_FULL[form.day] ?? form.day}
            </span>
          </div>
        </div>
      </div>


      <div className="space-y-2.5 mb-5">
        {slots.map((slot, i) => {
          const isBreak = slot.is_break;
          const color = isBreak
            ? null
            : SLOT_COLORS[lectureColorIdx % SLOT_COLORS.length];
          if (!isBreak) lectureColorIdx++;

          return (
            <div
              key={slot.id ?? i}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragEnter={() => onDragEnter(i)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`rounded-2xl p-3 border-2 transition-all ${isBreak
                ? "bg-orange-50 border-orange-100 hover:border-orange-200"
                : "bg-white border-gray-100 hover:border-violet-200 hover:shadow-sm"
                } ${dragIndex === i ? "opacity-50 scale-95" : ""}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GripVertical size={14} className="text-gray-300 flex-shrink-0" />
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0 ${isBreak ? "bg-orange-400" : color?.icon
                      }`}
                  >
                    {slot.slot_number}
                  </div>
                  {isBreak ? (
                    <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                      <Coffee size={10} /> BREAK
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1 ${color?.badge} text-[10px] font-bold px-2.5 py-1 rounded-lg`}
                    >
                      <BookOpen size={10} /> LECTURE
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeSlot(slot.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 hover:text-red-700 transition-all flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <p className="text-[9px] text-gray-400 font-semibold mb-1 uppercase tracking-wide">Start</p>
                  <input
                    type="time"
                    value={slot.slot_start_time}
                    readOnly
                    onChange={(e) => updateSlot(slot.id, "slot_start_time", e.target.value)}
                    className={`w-full border rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 bg-white ${isBreak
                      ? "border-orange-200 focus:ring-orange-300"
                      : "border-gray-200 focus:ring-violet-300"
                      }`}
                  />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-semibold mb-1 uppercase tracking-wide">End</p>
                  <input
                    type="time"
                    value={slot.slot_end_time}
                    readOnly
                    onChange={(e) => updateSlot(slot.id, "slot_end_time", e.target.value)}
                    className={`w-full border rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 bg-white ${isBreak
                      ? "border-orange-200 focus:ring-orange-300"
                      : "border-gray-200 focus:ring-violet-300"
                      }`}
                  />
                </div>
              </div>

              <div className="mb-2">
                {isBreak ? (
                  <p className="text-[11px] text-orange-400 italic pl-1">
                    No subject or teacher required
                  </p>
                ) : (
                  <div className="relative">
                    <select
                      value={String(slot.subject ?? "")}
                      onChange={(e) =>
                        updateSlot(slot.id, "subject", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white appearance-none pr-7 cursor-pointer"
                    >
                      <option value="">Subject *</option>
                      {subjects.map((subj) => (
                        <option key={subj.id} value={String(subj.id)}>
                          {subj.name}
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

              <div className="w-full mt-2">
                {!isBreak && (
                  <div className="relative">
                    <select
                      value={String(slot.teacher ?? "")}
                      onChange={(e) =>
                        updateSlot(slot.id, "teacher", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white appearance-none pr-7 cursor-pointer"
                    >
                      <option value="">Teacher *</option>
                      {slot.subject
                        ? assignedTeachers
                          .filter(
                            (at) =>
                              String(at.subject) === String(slot.subject),
                          )
                          .map((at, index) => {
                            const tchr = teachers.find(
                              (t) => String(t.id) === String(at.teacher),
                            );
                            return tchr ? (
                              <option key={`${tchr.id}-${index}`} value={tchr.id}>
                                {tchr.name}
                              </option>
                            ) : null;
                          })
                        : teachers.map((t) => (
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

      <div className="grid grid-cols-2 sm:flex sm:flex-row sm:flex-wrap gap-2 mb-5">

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

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-4 border-t border-gray-100">
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
}: {
  form: FormDataType;
  slots: Slot[];
  subjects: Subject[];
  teachers: Teacher[];
  divisions: Division[];
  existingId: number | null;
  onSaved: (record: unknown) => void;
  onBack: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(existingId ?? null);
  const [toast, setToast] = useState<ToastData | null>(null);

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
        setSavedId(record?.id);
        setToast({ msg: "Timetable saved successfully!", type: "success" });
      }
      setTimeout(() => onSaved(record), 1200);
    } catch (e: unknown) {
      const error = e as Error;
      setToast({ msg: error.message, type: "error" });
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
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isBreak ? "bg-orange-100" : color?.icon}`}
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
                    <p className={`font-bold ${color?.text}`}>
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
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${isBreak ? "bg-orange-100 text-orange-600" : color?.badge}`}
                >
                  {isBreak ? "Break" : `Period ${slot.slot_number}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-4 border-t border-gray-100">
        <button
          onClick={onBack}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* <button className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
            <Download size={14} /> Export PDF
          </button> */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto justify-center flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-200"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Saving…" : savedId ? "Update Timetable" : "Save Timetable"}
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
}: {
  form: FormDataType;
  slots: Slot[];
  subjects: Subject[];
  teachers: Teacher[];
  divisions: Division[];
  savedRecord: { id?: number } | null;
  onCreateNew: () => void;
}) {
  const divName = divisions.find((d) => d.id === Number(form.class_division));
  let lectureIdx = 0;

  return (
    <div>
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row gap-4 border-2 border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={28} className="text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-emerald-800 text-base sm:text-lg">
            Timetable Saved Successfully!
          </p>
          <p className="text-sm text-emerald-600 mt-0.5">
            {divName ? `${divName.class_name} (${divName.division})` : ""} ·{" "}
            {DAY_FULL[form.day]} · ID #{savedRecord?.id}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {/* <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-all">
            <Share2 size={12} /> Share
          </button> */}
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
              className={`flex items-center gap-4 rounded-2xl p-4 border-2 ${isBreak ? "bg-orange-50 border-orange-100" : `${color?.bg} ${color?.border}`}`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isBreak ? "bg-orange-100" : color?.icon}`}
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
                    <p className="font-bold text-orange-700 text-sm">Break Time</p>
                    <p className="text-xs text-orange-400">
                      {fmtTime(slot.slot_start_time)} –{" "}
                      {fmtTime(slot.slot_end_time)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className={`font-bold ${color?.text} text-sm truncate`}>
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
                className={`text-[11px] font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${isBreak ? "bg-orange-100 text-orange-600" : `bg-white/70 ${color?.text}`}`}
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

function DayPreviewModal({
  isOpen,
  onClose,
  day,
  classDivision,
  subjects,
  teachers,
}: {
  isOpen: boolean;
  onClose: () => void;
  day: string | null;
  classDivision: string | number;
  subjects: Subject[];
  teachers: Teacher[];
}) {
  const [slots, setSlots] = useState<TimetableRecord["slots"]>([]);
  const [loading, setLoading] = useState(false);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    if (!isOpen || !day || !classDivision) return;
    setLoading(true);

    Promise.all([
      getTimetable(Number(classDivision)),
      getSubjects(),
    ])
      .then(([res, subRes]) => {
        const filtered = Array.isArray(res)
          ? res.filter((r) => r.class_division === Number(classDivision))
          : [];
        const match = filtered.find((r) => r.day === day);
        setSlots(match?.slots ?? []);
        setAllSubjects(Array.isArray(subRes) ? (subRes as Subject[]) : []);
      })
      .catch(() => {
        setSlots([]);
        setAllSubjects([]);
      })
      .finally(() => setLoading(false));
  }, [isOpen, day, classDivision]);

  if (!isOpen || !day) return null;

  let lectureIdx = 0;

  // Helper: find subject name from all sources
  const getSubjectName = (subjectId: number | null): string => {
    if (!subjectId) return "—";
    // Try allSubjects first (full list)
    const fromAll = allSubjects.find((s) => s.id === subjectId);
    if (fromAll) return fromAll.name;
    // Fallback to passed subjects prop
    const fromProp = subjects.find((s) => s.id === subjectId);
    if (fromProp) return fromProp.name;
    return "—";
  };

  const getTeacherName = (teacherId: number | null): string => {
    if (!teacherId) return "—";
    const tchr = teachers.find((t) => t.id === teacherId);
    return tchr?.name ?? "—";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {DAY_FULL[day]} Timetable
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Slot-by-slot view</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-violet-500" />
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Clock size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium text-sm">No slots found</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {slots
                .sort((a, b) => a.slot_number - b.slot_number)
                .map((slot) => {
                  const isBreak = slot.is_break;
                  const color = isBreak
                    ? null
                    : SLOT_COLORS[lectureIdx % SLOT_COLORS.length];
                  if (!isBreak) lectureIdx++;
                  return (
                    <div
                      key={slot.slot_number}
                      className={`flex items-center gap-3 rounded-2xl p-3 border-2 ${isBreak
                        ? "bg-orange-50 border-orange-100"
                        : "bg-white border-gray-100"
                        }`}
                    >
                      <div className="text-right w-[68px] flex-shrink-0">
                        <p className="text-[10px] text-gray-500 font-semibold">
                          {fmtTime(slot.slot_start_time?.slice(0, 5))}
                        </p>
                        <p className="text-[10px] text-gray-300">
                          {fmtTime(slot.slot_end_time?.slice(0, 5))}
                        </p>
                      </div>
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isBreak ? "bg-orange-100" : color?.icon
                          }`}
                      >
                        {isBreak ? (
                          <Coffee size={14} className="text-orange-500" />
                        ) : (
                          <BookOpen size={13} className="text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {isBreak ? (
                          <p className="text-xs font-bold text-orange-700">
                            Break Time
                          </p>
                        ) : (
                          <>
                            <p className={`text-xs font-bold truncate ${color?.text}`}>
                              {getSubjectName(slot.subject)}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate">
                              {getTeacherName(slot.teacher)}
                            </p>
                          </>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${isBreak ? "bg-orange-100 text-orange-600" : color?.badge
                          }`}
                      >
                        {isBreak ? "Break" : `P${slot.slot_number}`}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROOT EXPORT — CreateTimetablePage
// ═══════════════════════════════════════════════════════════════════
function TimetablePreviewModal({
  isOpen,
  onClose,
  classDivision,
  divisions,
  subjects,
  teachers,
}: {
  isOpen: boolean;
  onClose: () => void;
  classDivision: string | number;
  divisions: Division[];
  subjects: Subject[];
  teachers: Teacher[];
}) {
  const [data, setData] = useState<TimetableRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !classDivision) return;
    setLoading(true);
    getTimetable(Number(classDivision))
      .then((res) => {
        const filtered = Array.isArray(res)
          ? res.filter((r) => r.class_division === Number(classDivision))
          : [];
        setData(filtered);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [isOpen, classDivision]);

  if (!isOpen) return null;

  const divName = divisions.find((d) => d.id === Number(classDivision));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Timetable Preview
            </h2>
            {divName && (
              <p className="text-sm text-gray-400 mt-0.5">
                {divName.class_name} - {divName.division}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-3 sm:p-5">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-violet-500" />
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Calendar size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No timetable found</p>
              <p className="text-sm mt-1">
                Select a class and create a timetable first
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <div className="min-w-[520px] px-3 sm:px-0">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-violet-50">
                      <th className="px-4 py-3 text-left text-xs font-bold text-violet-700 uppercase tracking-wide border border-violet-100 w-28">
                        Slot
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-violet-700 uppercase tracking-wide border border-violet-100 w-28">
                        Time
                      </th>
                      {data.map((d) => (
                        <th
                          key={d.id}
                          className="px-4 py-3 text-center text-xs font-bold text-violet-700 uppercase tracking-wide border border-violet-100"
                        >
                          {DAY_FULL[d.day] ?? d.day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Use the day with the most slots as the row template
                      const templateDay = data.reduce((max, d) =>
                        d.slots.length > max.slots.length ? d : max, data[0]
                      );
                      return templateDay.slots
                        .sort((a, b) => a.slot_number - b.slot_number)
                        .map((templateSlot) => {
                          const isBreak = templateSlot.is_break;
                          return (
                            <tr
                              key={templateSlot.slot_number}
                              className={
                                isBreak ? "bg-orange-50" : "hover:bg-gray-50"
                              }
                            >
                              <td className="px-4 py-3 border border-gray-100 text-center">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white mx-auto ${isBreak ? "bg-orange-400" : "bg-violet-600"}`}
                                >
                                  {templateSlot.slot_number}
                                </div>
                              </td>
                              <td className="px-4 py-3 border border-gray-100">
                                <p className="text-xs font-semibold text-gray-700">
                                  {fmtTime(
                                    templateSlot.slot_start_time?.slice(0, 5),
                                  )}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  {fmtTime(
                                    templateSlot.slot_end_time?.slice(0, 5),
                                  )}
                                </p>
                              </td>
                              {data.map((dayRecord) => {
                                const slot = dayRecord.slots.find(
                                  (s) =>
                                    s.slot_number === templateSlot.slot_number,
                                );
                                if (!slot)
                                  return (
                                    <td
                                      key={dayRecord.id}
                                      className="px-4 py-3 border border-gray-100 text-center text-gray-300 text-xs"
                                    >
                                      —
                                    </td>
                                  );
                                if (slot.is_break)
                                  return (
                                    <td
                                      key={dayRecord.id}
                                      className="px-4 py-3 border border-orange-100 text-center"
                                    >
                                      <div className="flex items-center justify-center gap-1 text-orange-500">
                                        <Coffee size={13} />
                                        <span className="text-xs font-bold">
                                          Break
                                        </span>
                                      </div>
                                    </td>
                                  );
                                const subj = subjects.find(
                                  (s) => s.id === slot.subject,
                                );
                                const tchr = teachers.find(
                                  (t) => t.id === slot.teacher,
                                );
                                return (
                                  <td
                                    key={dayRecord.id}
                                    className="px-4 py-3 border border-gray-100"
                                  >
                                    <p className="text-xs font-bold text-gray-800 truncate max-w-[120px]">
                                      {subj?.name ??
                                        (slot.subject
                                          ? `Subject ${slot.subject}`
                                          : "—")}
                                    </p>
                                    <p className="text-[10px] text-gray-400 truncate max-w-[120px] mt-0.5">
                                      {tchr?.name ??
                                        (slot.teacher
                                          ? `Teacher ${slot.teacher}`
                                          : "—")}
                                    </p>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TIMETABLE LIST PAGE — shown before the create form
// ═══════════════════════════════════════════════════════════════════
function TimetableListPage({
  divisions,
  teachers,
  subjects,
  onCreateNew,
}: {
  divisions: Division[];
  teachers: Teacher[];
  subjects: Subject[];
  onCreateNew: (classDivision: string, day: string) => void;
}) {
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [timetableData, setTimetableData] = useState<TimetableRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDayPreview, setSelectedDayPreview] = useState<string | null>(null);
  const [allTimetables, setAllTimetables] = useState<Record<number, TimetableRecord[]>>({});
  const [loadingAll, setLoadingAll] = useState(false);
  const [previewDivision, setPreviewDivision] = useState<string>("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);


  // Load all timetables for all divisions on mount
  useEffect(() => {
    if (!divisions.length) return;
    setLoadingAll(true);
    Promise.all(
      divisions.map((d) =>
        getTimetable(d.id)
          .then((res) => ({
            id: d.id,
            data: Array.isArray(res)
              ? (res as TimetableRecord[]).filter((r) => r.class_division === d.id)
              : [],
          }))
          .catch(() => ({ id: d.id, data: [] }))
      )
    )
      .then((results) => {
        const map: Record<number, TimetableRecord[]> = {};
        results.forEach((r) => { map[r.id] = r.data; });
        setAllTimetables(map);
      })
      .finally(() => setLoadingAll(false));
  }, [divisions]);

  // Also update when selectedDivision changes (for single division fetch)
  useEffect(() => {
    if (!selectedDivision) { setTimetableData([]); return; }
    const cached = allTimetables[Number(selectedDivision)];
    if (cached) {
      setTimetableData(cached);
    }
  }, [selectedDivision, allTimetables]);

  return (
    <div className="min-h-screen bg-[#f8f7ff]" style={{ fontFamily: "'DM Sans', 'Nunito', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
        @keyframes slideUp { from { transform:translateY(16px); opacity:0; } to { transform:translateY(0); opacity:1; } }
        .animate-slide-up { animation: slideUp 0.25s ease; }
      `}</style>

      {/* Header */}
      <div className="px-3 sm:px-6 pt-4 sm:pt-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Timetable</h1>
            <p className="text-sm text-gray-400 mt-1">View and manage all class timetables.</p>
          </div>
          <button
            onClick={() => onCreateNew("", "monday")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-200 flex-shrink-0"
          >
            <Plus size={15} /> Create Timetable
          </button>
        </div>
      </div>

      <div className="px-3 sm:px-6 pb-8">
        {loadingAll ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Loader2 size={36} className="animate-spin text-violet-500 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">Loading all timetables...</p>
          </div>
        ) : divisions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="text-base font-bold text-gray-400">No classes found</p>
            <p className="text-sm text-gray-300 mt-1">Add divisions first to manage timetables</p>
          </div>
        ) : (
          <div className="space-y-4">
            {divisions.map((division) => {
              const records = allTimetables[division.id] ?? [];
              const createdCount = records.length;
              const totalDays = DAYS.length;

              return (
                <div key={division.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Class Header */}
                  <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen size={18} className="text-violet-600" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900 text-base">
                          {division.class_name}
                          <span className="ml-2 text-xs font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-lg">
                            Division {division.division}
                          </span>
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <CheckCircle2 size={10} /> {createdCount}/{totalDays} days
                          </span>
                          {createdCount < totalDays && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                              <Clock size={10} /> {totalDays - createdCount} pending
                            </span>
                          )}
                          {createdCount === totalDays && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">
                              ✓ Complete
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setPreviewDivision(String(division.id));
                          setShowPreviewModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all">
                        <Eye size={12} /> Full Preview
                      </button>
                      <button
                        onClick={() => onCreateNew(String(division.id), "monday")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-200 text-violet-700 rounded-xl text-xs font-bold hover:bg-violet-100 transition-all">
                        <Plus size={12} /> Add Day
                      </button>
                    </div>
                  </div>

                  {/* Days Row */}
                  <div className="p-3 overflow-x-auto">
                    <div className="grid grid-cols-7 gap-1.5 min-w-[420px]">
                      {DAYS.map((day) => {
                        const record = records.find((r) => r.day === day);
                        const isCreated = !!record;
                        const lectureCount = record?.slots.filter((s) => s.is_lecture).length ?? 0;
                        const breakCount = record?.slots.filter((s) => s.is_break).length ?? 0;

                        return (
                          <div
                            key={day}
                            className={`rounded-xl border-2 p-2 flex flex-col gap-1.5 transition-all min-w-0 ${isCreated

                              ? "border-emerald-200 bg-emerald-50/50 hover:border-emerald-300"
                              : "border-dashed border-gray-200 bg-gray-50/50 hover:border-violet-200"
                              }`}
                          >
                            {/* Day label */}
                            <div className="flex items-center justify-between">
                              <div className={`text-[11px] font-black ${isCreated ? "text-emerald-700" : "text-gray-400"}`}>
                                {DAY_SHORT[day]}
                              </div>
                              {isCreated && <CheckCircle2 size={11} className="text-emerald-500" />}
                            </div>

                            {isCreated ? (
                              <>
                                {/* Stats */}
                                <div className="flex gap-1">
                                  <div className="flex-1 bg-white rounded-md py-1 text-center">
                                    <p className="text-xs font-black text-violet-700 leading-none">{lectureCount}</p>
                                    <p className="text-[9px] text-violet-400 font-semibold leading-tight">Lec</p>
                                  </div>
                                  <div className="flex-1 bg-white rounded-md py-1 text-center">
                                    <p className="text-xs font-black text-orange-500 leading-none">{breakCount}</p>
                                    <p className="text-[9px] text-orange-400 font-semibold leading-tight">Brk</p>
                                  </div>
                                </div>
                                {/* Action buttons */}
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => { setSelectedDivision(String(division.id)); setSelectedDayPreview(day); }}
                                    className="w-full flex items-center justify-center gap-0.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-md text-[10px] font-bold hover:bg-emerald-100 transition-all"
                                  >
                                    <Eye size={9} />
                                    <span>View</span>
                                  </button>
                                  <button
                                    onClick={() => onCreateNew(String(division.id), day)}
                                    className="w-full flex items-center justify-center gap-0.5 py-1 bg-violet-50 border border-violet-200 text-violet-600 rounded-md text-[10px] font-bold hover:bg-violet-100 transition-all"
                                  >
                                    <RefreshCw size={9} />
                                    <span>Edit</span>
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex-1 flex items-center justify-center py-1">
                                  <Clock size={16} className="text-gray-200" />
                                </div>
                                <button
                                  onClick={() => onCreateNew(String(division.id), day)}
                                  className="w-full flex items-center justify-center py-1 bg-violet-50 border border-dashed border-violet-200 text-violet-500 rounded-md text-[10px] font-bold hover:bg-violet-100 transition-all"
                                >
                                  <Plus size={10} />
                                </button>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DayPreviewModal
        isOpen={selectedDayPreview !== null}
        onClose={() => setSelectedDayPreview(null)}
        day={selectedDayPreview}
        classDivision={selectedDivision}
        subjects={subjects}
        teachers={teachers}
      />

      <TimetablePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        classDivision={previewDivision}
        divisions={divisions}
        subjects={subjects}
        teachers={teachers}
      />
    </div>
  );
}


export default function CreateTimetablePage() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignedTeachers, setAssignedTeachers] = useState<AssignedTeacher[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDivision, setPreviewDivision] = useState<string>("");
  const [step, setStep] = useState(1);

  const [form, setForm] = useState<FormDataType>({
    day: "monday",
    class_division: "",
    total_lecture: 4,
    total_breaks: 1,
    start_time: "08:00",
    end_time: "12:00",
    academicYear: "2026-2027",
    lecture_duration: 45,
    break_duration: 15,
  });
  // Load form from localStorage on mount
  // Load form from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("timetable_form");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm((f) => ({ ...f, ...parsed }));
      } catch {
        // ignore
      }
    }
  }, []);

  // Save form to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("timetable_form", JSON.stringify(form));
  }, [form]);


  const [slots, setSlots] = useState<Slot[]>([]);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [savedRecord, setSavedRecord] = useState<{ id?: number } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [existingDays, setExistingDays] = useState<
    { day: string; id: number }[]
  >([]);
  const [selectedDayPreview, setSelectedDayPreview] = useState<string | null>(
    null,
  );
  const [showList, setShowList] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [divRes, tchRes] = await Promise.all([
          getDivisions(),
          getTeachers(),
        ]);
        setDivisions(Array.isArray(divRes) ? (divRes as Division[]) : []);
        setTeachers(Array.isArray(tchRes) ? (tchRes as Teacher[]) : []);
      } catch (e: unknown) {
        setLoadErr(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!form.class_division) {
      setExistingDays([]);
      setSlots([]);
      setExistingId(null);
      return;
    }
    setSlots([]);
    setExistingId(null);
    (async () => {
      try {
        const assigned = await getAssignedTeachers(form.class_division);
        const assignedList = Array.isArray(assigned) ? (assigned as AssignedTeacher[]) : [];

        // Filter only entries matching the selected division
        const divisionList = assignedList.filter(
          (at) => String(at.division) === String(form.class_division),
        );

        setAssignedTeachers(divisionList);

        // Build unique subjects list directly from assignedTeachers data
        const uniqueSubjectsMap = new Map<string, Subject>();
        divisionList.forEach((at) => {
          if (!uniqueSubjectsMap.has(String(at.subject))) {
            uniqueSubjectsMap.set(String(at.subject), {
              id: Number(at.subject),
              name: at.subject_name ?? `Subject ${at.subject}`,
              division: Number(at.division),
            });
          }
        });
        setSubjects(Array.from(uniqueSubjectsMap.values()));

      } catch {
        setAssignedTeachers([]);
        setSubjects([]);
      }
    })();
  }, [form.class_division]);

  useEffect(() => {
    if (!form.class_division) return;
    (async () => {
      try {
        const records = await getTimetable(Number(form.class_division));
        const list: unknown[] = Array.isArray(records)
          ? records.filter(
            (r) =>
              r !== null &&
              typeof r === "object" &&
              (r as { class_division?: number }).class_division ===
              Number(form.class_division),
          )
          : [];

        // ← Always update existingDays regardless of day match
        setExistingDays(
          list.map((r) => ({
            day: (r as { day: string }).day,
            id: (r as { id: number }).id,
          })),
        );

        const match = list.find(
          (r) =>
            r !== null &&
            typeof r === "object" &&
            (r as { day?: string }).day === form.day,
        ) as
          | {
            id: number;
            day: string;
            total_lecture?: number;
            start_time?: string;
            end_time?: string;
            slots?: unknown[];
          }
          | undefined;

        if (match) {
          setExistingId(match.id as number);

          const rawSlots: unknown[] = Array.isArray(match.slots)
            ? match.slots
            : [];

          const restored: Slot[] = rawSlots.map((s) => {
            const slot = s as {
              slot_number?: number;
              is_lecture?: boolean;
              is_break?: boolean;
              slot_start_time?: string;
              slot_end_time?: string;
              subject?: number | null;
              teacher?: number | null;
            };
            return {
              id: genId(),
              slot_number: (slot.slot_number as number) ?? 0,
              is_lecture: !!slot.is_lecture,
              is_break: !!slot.is_break,
              slot_start_time: slot.slot_start_time?.slice(0, 5) ?? "",
              slot_end_time: slot.slot_end_time?.slice(0, 5) ?? "",
              subject: slot.subject ?? "",
              teacher: slot.teacher ?? "",
              subject_name:
                assignedTeachers.find((at) => String(at.subject) === String(slot.subject))?.subject_name ??
                subjects.find((x) => x.id === slot.subject)?.name ?? "",
              teacher_name:
                assignedTeachers.find((at) => String(at.teacher) === String(slot.teacher))?.teacher_name ??
                teachers.find((x) => x.id === slot.teacher)?.name ?? "",

            };
          });

          setSlots(restored);
          const actualLectureCount = restored.filter(
            (s) => s.is_lecture,
          ).length;
          const actualBreakCount = restored.filter((s) => s.is_break).length;

          setForm((f) => ({
            ...f,
            total_lecture:
              actualLectureCount ||
              (match.total_lecture as number) ||
              f.total_lecture,
            total_breaks: actualBreakCount,
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
  }, [form.class_division, form.day, subjects, teachers, assignedTeachers]);

  const handleAutoGenerate = useCallback(
    (
      currentForm: FormDataType,
      currentAssignedTeachers: AssignedTeacher[],
    ): Slot[] => {
      const lectureCount = currentForm.total_lecture || 4;
      const breakCount = currentForm.total_breaks ?? 1;
      const [sh, sm] = (currentForm.start_time || "08:00")
        .split(":")
        .map(Number);
      const perLecture = currentForm.lecture_duration;
      const perBreak = currentForm.break_duration;

      const classTeacherEntry = (currentAssignedTeachers || []).find(
        (t) =>
          t.is_class_teacher === true &&
          String(t.division) === String(currentForm.class_division),
      );


      const breakPositions = new Set<number>();
      if (breakCount > 0) {
        const spacing = Math.floor(lectureCount / (breakCount + 1));
        for (let b = 1; b <= breakCount; b++) breakPositions.add(b * spacing);
      }

      const generated: Slot[] = [];
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
          slot_start_time: fmtMinutes(currentMin),
          slot_end_time: fmtMinutes(currentMin + perLecture),
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
            slot_start_time: fmtMinutes(currentMin),
            slot_end_time: fmtMinutes(currentMin + perBreak),
            subject: null,
            teacher: null,
          });
          currentMin += perBreak;
          breaksAdded++;
        }
      }

      return generated;
    },
    [],
  );

  const handleReset = () => {
    setShowList(true);
    setStep(1);
    setSlots([]);
    setExistingId(null);
    setSavedRecord(null);
    setShowSuccess(false);
    setExistingDays([]);
    setSelectedDayPreview(null);
    setForm({
      day: "monday",
      class_division: "",
      total_lecture: 4,
      total_breaks: 1,
      start_time: "08:00",
      end_time: "12:00",
      academicYear: "2026-2027",
      lecture_duration: 45,
      break_duration: 15,
    });
  };

  if (showList) {
    return (
      <TimetableListPage
        divisions={divisions}
        teachers={teachers}
        subjects={subjects}
        onCreateNew={(classDivision, day) => {
          if (classDivision) {
            setForm((f) => ({ ...f, class_division: classDivision, day }));
          }
          setShowList(false);
          setStep(1);
          setShowSuccess(false);
        }}
      />
    );
  }

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

      <div className="px-3 sm:px-6 pt-4 sm:pt-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <button
              onClick={() => setShowList(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 hover:border-violet-400 text-gray-600 hover:text-violet-700 rounded-xl text-sm font-bold mb-3 transition-all shadow-sm hover:shadow-md"
            >
              <ArrowLeft size={15} /> Back to Timetables
            </button>

            {/* <h1 className="text-2xl font-black text-gray-900">
              Create Timetable
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Create and manage class schedules easily.
            </p> */}
          </div>
          <div className="flex flex-col xs:flex-row sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {existingId && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-2 rounded-xl">
                <RefreshCw size={12} /> Editing existing timetable
              </div>
            )}
            <button
              onClick={() => setShowPreview(true)}
              className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2.5 border-2 border-violet-200 text-violet-700 bg-white rounded-xl text-sm font-bold hover:bg-violet-50 transition-all"
            >
              <Eye size={15} /> Preview
            </button>
            <button
              onClick={() => { if (!showSuccess && step < 3) setStep(3); }}
              className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-200"
            >
              <Save size={15} /> Save Timetable
            </button>
          </div>

        </div>
      </div>

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
                  existingDays={existingDays}
                  onPreviewDay={(day) => setSelectedDayPreview(day)}
                  onViewDay={(day) => {
                    setForm((f) => ({ ...f, day }));
                    setStep(2);
                  }}
                  onNext={() => {
                    const generated = handleAutoGenerate(form, assignedTeachers);
                    setSlots(generated);
                    setStep(2);
                  }}

                />
              ) : step === 2 ? (
                <Step2TimeSlots
                  form={form}
                  subjects={subjects}
                  teachers={teachers}
                  assignedTeachers={assignedTeachers}
                  divisions={divisions}
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
                    setSavedRecord(record as { id?: number });
                    setShowSuccess(true);
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="hidden xl:block w-[320px] flex-shrink-0">

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
      <DayPreviewModal
        isOpen={selectedDayPreview !== null}
        onClose={() => setSelectedDayPreview(null)}
        day={selectedDayPreview}
        classDivision={form.class_division}
        subjects={subjects}
        teachers={teachers}
      />

      <TimetablePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        classDivision={previewDivision}
        divisions={divisions}
        subjects={subjects}
        teachers={teachers}
      />

    </div>
  );
}
