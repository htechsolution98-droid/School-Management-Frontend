
"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Calendar,
  Clock,
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
  LogIn,
  LogOut,
  CheckCircle2,
  XCircle,
  MinusCircle,
  TrendingUp,
  Timer,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getAttendanceHistory } from "@/lib/teacher";
import type { AttendanceRecord } from "@/types/teacher";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseISOTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const h = d.getHours();   // ✅ LOCAL time — correct for any timezone
    const m = d.getMinutes(); // ✅ LOCAL time — correct for any timezone
    const ampm = h >= 12 ? "PM" : "AM";
    return `${(h % 12 || 12).toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")} ${ampm}`;
  } catch {
    return "—";
  }
}

function parseISODate(iso: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso.includes("T") ? iso : iso + "T00:00:00Z");
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      weekday: "short",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

function calcDuration(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn || !checkOut) return "—";
  try {
    const diff = Math.floor(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 60000,
    );
    if (diff <= 0) return "—";
    return `${Math.floor(diff / 60)
      .toString()
      .padStart(2, "0")}h ${(diff % 60).toString().padStart(2, "0")}m`;
  } catch {
    return "—";
  }
}

function getStatus(r: AttendanceRecord): "present" | "half-day" | "absent" {
  if (!r.is_present) return "absent";
  if (r.is_half_day) return "half-day";
  return "present";
}

const STATUS_CONFIG = {
  present: { label: "Present", bg: "#d1fae5", text: "#065f46", dot: "#10b981" },
  "half-day": {
    label: "Half Day",
    bg: "#fef9c3",
    text: "#854d0e",
    dot: "#f59e0b",
  },
  absent: { label: "Absent", bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex-1 min-w-0 bg-white rounded-xl border border-slate-100 px-3 py-3 flex items-center gap-3"
      style={{ boxShadow: "0 2px 10px -2px rgba(0,0,0,0.06)" }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}15` }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-bold text-slate-400 uppercase mapping-widest leading-none mb-0.5 truncate">
          {label}
        </p>
        <p className="text-lg font-extrabold text-slate-900 leading-none">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Expanded Row ─────────────────────────────────────────────────────────────

function ExpandedRow({ record }: { record: AttendanceRecord }) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <td colSpan={6} className="px-4 pb-3 pt-0">
        <div
          className="rounded-xl px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3"
          style={{ background: "#f8faff", border: "1px solid #e0e7ff" }}
        >
          {[
            { label: "Record ID", value: `#${record.id}` },
            { label: "Category", value: record.category },
            { label: "Staff ID", value: `#${record.staff}` },
            {
              label: "Date & Time",
              value: record.date_time
                ? new Date(record.date_time).toLocaleString("en-IN")
                : "—",
            },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[9px] font-bold text-slate-400 uppercase mapping-wider mb-0.5">
                {label}
              </p>
              <p className="text-xs font-semibold text-slate-700">{value}</p>
            </div>
          ))}
        </div>
      </td>
    </motion.tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AttendanceHistoryPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "present" | "half-day" | "absent"
  >("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAttendanceHistory();
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.attendance_date).getTime() -
          new Date(a.attendance_date).getTime(),
      );
      setRecords(sorted);
    } catch (err: any) {
      setError(err.message || "Failed to load attendance history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const present = records.filter(
      (r) => r.is_present && !r.is_half_day,
    ).length;
    const halfDay = records.filter((r) => r.is_half_day).length;
    const absent = records.filter((r) => !r.is_present).length;
    const total = records.length;
    const rate =
      total > 0 ? Math.round(((present + halfDay * 0.5) / total) * 100) : 0;
    return { present, halfDay, absent, total, rate };
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const status = getStatus(r);
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.attendance_date.includes(q) ||
        parseISODate(r.attendance_date).toLowerCase().includes(q) ||
        r.name?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [records, search, statusFilter]);

  return (
    <div
      className="w-full max-w-full overflow-hidden px-3 sm:px-4 py-4 flex flex-col gap-4"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 leading-tight">
            Attendance History
          </h1>
          <p className="text-xs text-slate-400">Your complete attendance log</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin text-violet-400" : ""}`}
          />
          Refresh
        </motion.button>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.04 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2"
      >
        <StatCard
          icon={Calendar}
          label="Total"
          value={stats.total}
          color="#7c3aed"
          delay={0.06}
        />
        <StatCard
          icon={CheckCircle2}
          label="Present"
          value={stats.present}
          color="#10b981"
          delay={0.09}
        />
        <StatCard
          icon={MinusCircle}
          label="Half Day"
          value={stats.halfDay}
          color="#f59e0b"
          delay={0.12}
        />
        <StatCard
          icon={XCircle}
          label="Absent"
          value={stats.absent}
          color="#ef4444"
          delay={0.15}
        />
        <StatCard
          icon={TrendingUp}
          label="Attend. %"
          value={`${stats.rate}%`}
          color="#0ea5e9"
          delay={0.18}
        />
      </motion.div>

      {/* ── Table Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col"
        style={{ boxShadow: "0 4px 32px -4px rgba(124,58,237,0.1)" }}
      >
        {/* Controls */}
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5 text-violet-500" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-800">
                Recent Attendance
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {filtered.length} record{filtered.length !== 1 ? "s" : ""}
                {statusFilter !== "all" ? ` · ${statusFilter}` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Filter pills */}
            <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5 border border-slate-100">
              {(["all", "present", "half-day", "absent"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="text-[10px] font-bold px-2.5 py-1.5 rounded-md transition-all capitalize"
                  style={
                    statusFilter === s
                      ? {
                        background: "white",
                        color: "#5b21b6",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      }
                      : { color: "#94a3b8" }
                  }
                >
                  {s === "half-day"
                    ? "Half"
                    : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-36 pl-7 pr-3 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-2">
            <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
            <p className="text-xs font-semibold text-slate-400">
              Loading records…
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-12 px-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700">Failed to load</p>
              <p className="text-xs text-slate-400 mt-1">{error}</p>
            </div>
            <button
              onClick={load}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-500 text-white text-xs font-bold hover:bg-violet-600 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 px-6">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-slate-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-600">
                No records found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {search || statusFilter !== "all"
                  ? "Try adjusting your filters."
                  : "No attendance records yet."}
              </p>
            </div>
          </div>
        )}

        {/* Table */}
        {!loading && !error && filtered.length > 0 && (
          <div className="w-full overflow-x-auto">
            <table className="min-w-[700px] w-full">
              <thead>
                <tr style={{ background: "#f8faff" }}>
                  {[
                    "Date",
                    "Check In",
                    "Check Out",
                    "Duration",
                    "Status",
                    "",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase mapping-widest whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence initial={false}>
                  {filtered.map((record, i) => {
                    const status = getStatus(record);
                    const sc = STATUS_CONFIG[status];
                    const isExpanded = expandedId === record.id;

                    return (
                      <React.Fragment key={`row-${record.id}-${i}`}>
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(i * 0.03, 0.24) }}
                          className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : record.id)
                          }
                        >
                          {/* Date */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: `${sc.dot}15` }}
                              >
                                <Calendar
                                  className="w-3.5 h-3.5"
                                  style={{ color: sc.dot }}
                                />
                              </div>
                              <p className="text-xs font-bold text-slate-800">
                                {parseISODate(record.attendance_date)}
                              </p>
                            </div>
                          </td>

                          {/* Check In */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {record.check_in ? (
                                <>
                                  <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center">
                                    <LogIn className="w-3 h-3 text-emerald-500" />
                                  </div>
                                  <span className="text-xs font-bold text-slate-800 tabular-nums">
                                    {parseISOTime(record.check_in)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs text-slate-300 font-semibold">
                                  —
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Check Out */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {record.check_out ? (
                                <>
                                  <div className="w-5 h-5 rounded-md bg-violet-50 flex items-center justify-center">
                                    <LogOut className="w-3 h-3 text-violet-500" />
                                  </div>
                                  <span className="text-xs font-bold text-slate-800 tabular-nums">
                                    {parseISOTime(record.check_out)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs text-slate-300 font-semibold">
                                  —
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Duration */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Timer className="w-3 h-3 text-slate-400" />
                              <span className="text-xs font-bold text-slate-700 tabular-nums">
                                {calcDuration(
                                  record.check_in,
                                  record.check_out,
                                )}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
                              style={{ background: sc.bg, color: sc.text }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: sc.dot }}
                              />
                              {sc.label}
                            </span>
                          </td>

                          {/* Expand */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center text-slate-400">
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </div>
                          </td>
                        </motion.tr>

                        <AnimatePresence>
                          {isExpanded && (
                            <ExpandedRow
                              key={`exp-${record.id}`}
                              record={record}
                            />
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && !error && filtered.length > 0 && (
          <div
            className="px-4 py-3 border-t border-slate-50 flex items-center justify-between flex-wrap gap-2"
            style={{ background: "#fafbff" }}
          >
            <p className="text-[10px] text-slate-400 font-semibold">
              Showing{" "}
              <span className="text-slate-600 font-bold">
                {filtered.length}
              </span>{" "}
              of{" "}
              <span className="text-slate-600 font-bold">{records.length}</span>{" "}
              records
            </p>
            <div className="flex items-center gap-3">
              {[
                { color: "#10b981", label: "Present", val: stats.present },
                { color: "#f59e0b", label: "Half", val: stats.halfDay },
                { color: "#ef4444", label: "Absent", val: stats.absent },
              ].map(({ color, label, val }) => (
                <span
                  key={label}
                  className="flex items-center gap-1 text-[10px] font-semibold text-slate-500"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: color }}
                  />
                  {label}: {val}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
