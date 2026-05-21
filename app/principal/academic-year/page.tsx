"use client";

import React, { useState, useEffect } from "react";
import {
    Calendar, CheckCircle2, Clock, FileText,
    Plus, Pencil, Trash2, Loader2, X, AlertCircle,
} from "lucide-react";
import {
    getAcademicYearsForPrincipal,
    createAcademicYearForPrincipal,
    updateAcademicYearForPrincipal,
    deleteAcademicYearForPrincipal,
    type AcademicYear,
} from "@/lib/forms";

// ─── MONTHS ───────────────────────────────────────────────────────────────────
const MONTHS = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];

function monthLabel(m: number) {
    return MONTHS.find((x) => x.value === m)?.label ?? "—";
}

function monthCount(start: number, end: number) {
    if (!start || !end) return 0;
    return end >= start ? end - start + 1 : 12 - start + end + 1;
}

// ─── BILLING PERIODS ─────────────────────────────────────────────────────────
function buildBillingPeriods(
    name: string,
    start_month: number,
    end_month: number
): { code: string; label: string }[] {
    if (!name || !start_month || !end_month) return [];
    const [startYearStr] = name.split("-");
    const startYear = parseInt(startYearStr, 10);
    if (isNaN(startYear)) return [];

    const periods: { code: string; label: string }[] = [];
    let month = start_month;
    let year = startYear;

    while (true) {
        const code = `${year}-${String(month).padStart(2, "0")}`;
        const label = new Date(year, month - 1, 1).toLocaleString("en-IN", {
            month: "short",
            year: "numeric",
        });
        periods.push({ code, label });
        if (month === end_month) break;
        month++;
        if (month > 12) { month = 1; year++; }
        if (periods.length > 24) break; // safety
    }
    return periods;
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({
    icon, iconBg, iconColor, label, value, sub, badge,
}: {
    icon: React.ReactNode; iconBg: string; iconColor: string;
    label: string; value: React.ReactNode; sub?: string; badge?: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 flex-1 min-w-0">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <span className={iconColor}>{icon}</span>
            </div>
            <div className="min-w-0">
                <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
                {badge && <div className="mt-1">{badge}</div>}
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ─── CREATE/EDIT MODAL ────────────────────────────────────────────────────────
function AcademicYearModal({
    editing,
    onClose,
    onSaved,
}: {
    editing: AcademicYear | null;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [name, setName] = useState(editing?.name ?? "");
    const [startMonth, setStartMonth] = useState(editing?.start_month ?? 4);
    const [endMonth, setEndMonth] = useState(editing?.end_month ?? 3);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        if (!name.trim()) { setError("Year name is required."); return; }
        setSaving(true);
        setError(null);
        try {
            if (editing) {
                await updateAcademicYearForPrincipal(editing.id, {
                    name: name.trim(),
                    start_month: startMonth,
                    end_month: endMonth,
                });
            } else {
                await createAcademicYearForPrincipal({
                    name: name.trim(),
                    start_month: startMonth,
                    end_month: endMonth,
                });
            }
            onSaved();
            onClose();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-black text-gray-900">
                        {editing ? "Edit Academic Year" : "Create Academic Year"}
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <X size={16} className="text-gray-500" />
                    </button>
                </div>

                {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-2 rounded-xl mb-4">
                        <AlertCircle size={13} /> {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">
                            Year Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. 2026-27"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">Start Month</label>
                            <select
                                value={startMonth}
                                onChange={(e) => setStartMonth(Number(e.target.value))}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                            >
                                {MONTHS.map((m) => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">End Month</label>
                            <select
                                value={endMonth}
                                onChange={(e) => setEndMonth(Number(e.target.value))}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                            >
                                {MONTHS.map((m) => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {name && startMonth && endMonth && (
                        <div className="bg-indigo-50 rounded-xl px-3 py-2 text-xs text-indigo-700 font-medium">
                            Duration: {monthCount(startMonth, endMonth)} months
                            ({monthLabel(startMonth)} → {monthLabel(endMonth)})
                        </div>
                    )}
                </div>

                <div className="flex gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-all"
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                        {saving ? "Saving…" : editing ? "Update" : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AcademicYearPage() {
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [years, setYears] = useState<AcademicYear[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<AcademicYear | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAcademicYearsForPrincipal();
            setYears(Array.isArray(data) ? data : []);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to load.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            await deleteAcademicYearForPrincipal(id);
            await load();
        } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Delete failed.");
        } finally {
            setDeletingId(null);
            setConfirmDeleteId(null);
        }
    };

    // derive stats
    const activeYear = years.find((y) => y.is_active);
    const upcomingCount = years.filter((y) => !y.is_active).length;
    const activePeriod = activeYear
        ? monthCount(activeYear.start_month, activeYear.end_month)
        : 0;

    const billingPeriods = activeYear
        ? buildBillingPeriods(activeYear.name, activeYear.start_month, activeYear.end_month)
        : [];

    return (
        <div className="min-h-screen bg-[#f5f6fa] p-3 sm:p-6">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Academic Years</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Create, manage and organize academic years and billing periods.
                    </p>
                </div>
                <button
                    onClick={() => { setEditing(null); setShowModal(true); }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-200"
                >
                    <Plus size={16} /> Create Academic Year
                </button>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    icon={<Calendar size={22} />}
                    iconBg="bg-indigo-50" iconColor="text-indigo-500"
                    label="Total Academic Years" value={years.length} sub="All Years"
                />
                <StatCard
                    icon={<CheckCircle2 size={22} />}
                    iconBg="bg-emerald-50" iconColor="text-emerald-500"
                    label="Active Academic Year"
                    value={activeYear?.name ?? "—"}
                    badge={activeYear ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Active
                        </span>
                    ) : undefined}
                />
                <StatCard
                    icon={<Clock size={22} />}
                    iconBg="bg-amber-50" iconColor="text-amber-500"
                    label="Upcoming Years" value={upcomingCount} sub="Next in line"
                />
                <StatCard
                    icon={<FileText size={22} />}
                    iconBg="bg-blue-50" iconColor="text-blue-500"
                    label="Total Duration" value={`${activePeriod} Months`} sub="Per Academic Year"
                />
            </div>

            {/* ── Table ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden overflow-x-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={28} className="animate-spin text-indigo-500" />
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center gap-2 py-16 text-red-500">
                        <AlertCircle size={18} /> <span className="text-sm font-semibold">{error}</span>
                    </div>
                ) : years.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="font-semibold">No academic years yet</p>
                        <p className="text-sm mt-1">Click "Create Academic Year" to add one</p>
                    </div>
                ) : (
                    <div className="min-w-[600px]">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {["Year Name", "Duration", "Period", "Status", "Action"].map((h, i) => (
                                    <th key={h} className={`text-xs font-bold text-gray-400 uppercase tracking-wide px-6 py-4 ${i === 4 ? "text-right" : "text-left"}`}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {years.map((year, i) => {
                                const period = monthCount(year.start_month, year.end_month);
                                const isActive = !!year.is_active;
                                return (
                                    <tr key={year.id} className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${i === years.length - 1 ? "border-b-0" : ""}`}>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-800">{year.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar size={14} className="text-gray-300 flex-shrink-0" />
                                                {year.start_month && year.end_month
                                                    ? `${monthLabel(year.start_month)} – ${monthLabel(year.end_month)}`
                                                    : <span className="text-gray-300">—</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{period} Month{period !== 1 ? "s" : ""}</td>
                                        <td className="px-6 py-4">
                                            {isActive ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                                                    <Clock size={10} /> Upcoming
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditing(year); setShowModal(true); }}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteId(year.id)}
                                                    disabled={deletingId === year.id}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
                                                >
                                                    {deletingId === year.id
                                                        ? <Loader2 size={14} className="animate-spin" />
                                                        : <Trash2 size={15} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    </div>
                )}
            </div>

            {/* ── Billing Periods ── */}
            {activeYear && billingPeriods.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-1">
                        <div>
                            <h2 className="text-base font-black text-gray-900">
                                Billing Periods – <span className="text-indigo-600">{activeYear.name}</span>
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5">{billingPeriods.length} billing cycles</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Active
                        </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-5">
                        {billingPeriods.map((bp) => (
                            <div key={bp.code} className="border border-gray-100 rounded-xl px-3 py-3 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all cursor-pointer">
                                <p className="text-[11px] font-bold text-indigo-500 mb-0.5">{bp.code}</p>
                                <p className="text-sm font-bold text-gray-800">{bp.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Modal ── */}
            {showModal && (
                <AcademicYearModal
                    editing={editing}
                    onClose={() => setShowModal(false)}
                    onSaved={load}
                />
            )}

            {/* ── Delete Confirm Dialog ── */}
            {confirmDeleteId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDeleteId(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={22} className="text-red-500" />
                        </div>
                        <h2 className="text-base font-black text-gray-900 text-center mb-1">Delete Academic Year?</h2>
                        <p className="text-sm text-gray-400 text-center mb-6">
                            This action cannot be undone. All billing periods associated with this year will also be removed.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(confirmDeleteId)}
                                disabled={deletingId === confirmDeleteId}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-all"
                            >
                                {deletingId === confirmDeleteId
                                    ? <Loader2 size={14} className="animate-spin" />
                                    : <Trash2 size={14} />}
                                {deletingId === confirmDeleteId ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}


