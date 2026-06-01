"use client";

import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Edit,
  Trash2,
  FileText,
  Paperclip,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  ClipboardList,
  Users,
  Filter,
  X,
  Check,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Homework {
  id: string;
  title: string;
  class: string;
  division: string;
  dueDate: string;
  status: "Active" | "Inactive";
  submitted: number;
  total: number;
  assignedDate: string;
  description: string;
  attachment?: string;
  color: string;
}

interface Submission {
  id: string;
  name: string;
  initials: string;
  submittedAt: string | null;
  status: "Submitted" | "Late" | "Pending";
  attachment: string | null;
  attachmentSize: string | null;
  marks: number | null;
  avatarColor: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const homeworkList: Homework[] = [
  {
    id: "1",
    title: "Chapter 5 Exercise",
    class: "Class 10",
    division: "Division A",
    dueDate: "20 May 2026",
    status: "Active",
    submitted: 32,
    total: 40,
    assignedDate: "15 May 2026",
    description: "Solve questions 1 to 10 from the textbook.",
    attachment: "chapter-5-exercise.pdf",
    color: "purple",
  },
  {
    id: "2",
    title: "Algebra Worksheet",
    class: "Class 9",
    division: "Division B",
    dueDate: "22 May 2026",
    status: "Active",
    submitted: 28,
    total: 35,
    assignedDate: "14 May 2026",
    description: "Complete the algebra worksheet covering chapters 3 and 4.",
    attachment: "algebra-worksheet.pdf",
    color: "amber",
  },
  {
    id: "3",
    title: "Science Project",
    class: "Class 8",
    division: "Division A",
    dueDate: "25 May 2026",
    status: "Active",
    submitted: 18,
    total: 30,
    assignedDate: "12 May 2026",
    description: "Prepare a project on renewable energy sources.",
    color: "teal",
  },
  {
    id: "4",
    title: "History Notes",
    class: "Class 10",
    division: "Division B",
    dueDate: "30 May 2026",
    status: "Active",
    submitted: 22,
    total: 40,
    assignedDate: "10 May 2026",
    description: "Write detailed notes on the French Revolution.",
    color: "green",
  },
  {
    id: "5",
    title: "English Essay",
    class: "Class 9",
    division: "Division A",
    dueDate: "28 May 2026",
    status: "Inactive",
    submitted: 0,
    total: 32,
    assignedDate: "16 May 2026",
    description: "Write a 500-word essay on environmental conservation.",
    color: "pink",
  },
];

const submissionsData: Submission[] = [
  {
    id: "1",
    name: "Rahul Patel",
    initials: "RP",
    submittedAt: "15 May 2026\n10:20 AM",
    status: "Submitted",
    attachment: "homework.pdf",
    attachmentSize: "245 KB",
    marks: null,
    avatarColor: "#6366f1",
  },
  {
    id: "2",
    name: "Anjali Sharma",
    initials: "AS",
    submittedAt: "15 May 2026\n11:05 AM",
    status: "Submitted",
    attachment: "ans.pdf",
    attachmentSize: "312 KB",
    marks: null,
    avatarColor: "#ec4899",
  },
  {
    id: "3",
    name: "Dev Mehta",
    initials: "DM",
    submittedAt: "15 May 2026\n11:30 AM",
    status: "Submitted",
    attachment: "dev_ans.pdf",
    attachmentSize: "280 KB",
    marks: null,
    avatarColor: "#14b8a6",
  },
  {
    id: "4",
    name: "Priya Singh",
    initials: "PS",
    submittedAt: "14 May 2026\n09:15 PM",
    status: "Late",
    attachment: "priya_homework.pdf",
    attachmentSize: "300 KB",
    marks: null,
    avatarColor: "#f59e0b",
  },
  {
    id: "5",
    name: "Karan Joshi",
    initials: "KJ",
    submittedAt: null,
    status: "Pending",
    attachment: null,
    attachmentSize: null,
    marks: null,
    avatarColor: "#64748b",
  },
];

// ─── Color Helpers ────────────────────────────────────────────────────────────

const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
  purple: { bg: "#ede9fe", text: "#7c3aed", icon: "#7c3aed" },
  amber: { bg: "#fef3c7", text: "#d97706", icon: "#d97706" },
  teal: { bg: "#ccfbf1", text: "#0d9488", icon: "#0d9488" },
  green: { bg: "#dcfce7", text: "#16a34a", icon: "#16a34a" },
  pink: { bg: "#fce7f3", text: "#db2777", icon: "#db2777" },
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    Active: { bg: "#dcfce7", color: "#16a34a" },
    Inactive: { bg: "#f1f5f9", color: "#64748b" },
    Submitted: { bg: "#dbeafe", color: "#2563eb" },
    Late: { bg: "#fee2e2", color: "#dc2626" },
    Pending: { bg: "#fef9c3", color: "#ca8a04" },
  };
  const s = styles[status] || { bg: "#f1f5f9", color: "#64748b" };
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 20,
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
        display: "inline-block",
      }}
    >
      {status}
    </span>
  );
}

// ─── Homework Card ────────────────────────────────────────────────────────────

function HomeworkCard({
  hw,
  selected,
  onSelect,
}: {
  hw: Homework;
  selected: boolean;
  onSelect: () => void;
}) {
  const c = colorMap[hw.color];
  return (
    <button
      onClick={onSelect}
      style={{
        width: "100%",
        textAlign: "left",
        background: selected ? "#f5f3ff" : "#fff",
        border: selected ? "1.5px solid #818cf8" : "1.5px solid #f1f5f9",
        borderRadius: 12,
        padding: "14px 16px",
        cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: c.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <FileText size={18} color={c.icon} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 3,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: selected ? "#6366f1" : "#1e293b",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {hw.title}
          </span>
          <StatusBadge status={hw.status} />
        </div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
          {hw.class} · {hw.division}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 500 }}>
            Due: {hw.dueDate}
          </span>
          <span style={{ fontSize: 11, color: "#64748b" }}>
            <span style={{ fontWeight: 600, color: "#1e293b" }}>
              {hw.submitted}
            </span>{" "}
            / {hw.total} Submitted
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── Mobile Submission Card ───────────────────────────────────────────────────

function MobileSubmissionCard({
  sub,
  onMark,
}: {
  sub: Submission;
  onMark: () => void;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px solid #f1f5f9",
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: sub.avatarColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {sub.initials}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
              {sub.name}
            </div>
            {sub.submittedAt && (
              <div style={{ fontSize: 11, color: "#94a3b8" }}>
                {sub.submittedAt.replace("\n", " ")}
              </div>
            )}
          </div>
        </div>
        <StatusBadge status={sub.status} />
      </div>

      {/* Details row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {sub.attachment ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              color: "#ef4444",
              fontSize: 12,
            }}
          >
            <FileText size={13} />
            <span>{sub.attachment}</span>
            <span style={{ color: "#94a3b8", fontSize: 11 }}>
              ({sub.attachmentSize})
            </span>
          </div>
        ) : (
          <span style={{ color: "#cbd5e1", fontSize: 12 }}>No attachment</span>
        )}

        {sub.marks !== null ? (
          <span style={{ fontSize: 12, fontWeight: 600, color: "#6366f1" }}>
            {sub.marks}/100
          </span>
        ) : (
          <span style={{ fontSize: 12, color: "#cbd5e1" }}>No marks</span>
        )}
      </div>

      {/* Action row */}
      {sub.status !== "Pending" && (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: 8,
              border: "1.5px solid #e2e8f0",
              background: "#fff",
              fontSize: 12,
              fontWeight: 500,
              color: "#64748b",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <Eye size={13} />
            View
          </button>
          <button
            onClick={onMark}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: 8,
              border: "none",
              background: sub.marks !== null ? "#dcfce7" : "#ede9fe",
              fontSize: 12,
              fontWeight: 600,
              color: sub.marks !== null ? "#16a34a" : "#6366f1",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            {sub.marks !== null ? <Check size={13} /> : <Edit size={13} />}
            {sub.marks !== null ? "Graded" : "Grade"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Mark Modal ───────────────────────────────────────────────────────────────

function MarkModal({
  student,
  onClose,
  onSave,
}: {
  student: Submission;
  onClose: () => void;
  onSave: (id: string, marks: number) => void;
}) {
  const [marks, setMarks] = useState<string>(student.marks?.toString() ?? "");
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
        boxSizing: "border-box",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 28,
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h3
            style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1e293b" }}
          >
            Grade Submission
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              borderRadius: 6,
              color: "#64748b",
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
            padding: "12px 16px",
            background: "#f8fafc",
            borderRadius: 10,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: student.avatarColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {student.initials}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
              {student.name}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              {student.submittedAt?.replace("\n", " ")}
            </div>
          </div>
        </div>
        <label
          style={{
            display: "block",
            fontSize: 13,
            color: "#64748b",
            marginBottom: 6,
          }}
        >
          Marks (out of 100)
        </label>
        <input
          type="number"
          min={0}
          max={100}
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
          placeholder="Enter marks"
          style={{
            width: "100%",
            padding: "10px 14px",
            border: "1.5px solid #e2e8f0",
            borderRadius: 8,
            fontSize: 15,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: "1.5px solid #e2e8f0",
              background: "#fff",
              fontSize: 13,
              fontWeight: 600,
              color: "#64748b",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (marks !== "") onSave(student.id, Number(marks));
            }}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: "none",
              background: "#6366f1",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Save Marks
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Homework Modal ────────────────────────────────────────────────────

function CreateHomeworkModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    title: "",
    class: "",
    division: "",
    dueDate: "",
    description: "",
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
        boxSizing: "border-box",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          boxSizing: "border-box",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: "#1e293b",
              }}
            >
              Create Homework
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
              Fill in the details to assign homework
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f8fafc",
              border: "none",
              cursor: "pointer",
              width: 32,
              height: 32,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {(
            [
              {
                label: "Title",
                key: "title",
                placeholder: "e.g. Chapter 5 Exercise",
              },
              {
                label: "Class",
                key: "class",
                placeholder: "e.g. Class 10",
              },
              {
                label: "Division",
                key: "division",
                placeholder: "e.g. Division A",
              },
              {
                label: "Due Date",
                key: "dueDate",
                placeholder: "",
                type: "date",
              },
            ] as Array<{
              label: string;
              key: keyof typeof form;
              placeholder: string;
              type?: string;
            }>
          ).map((f) => (
            <div key={f.key}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  color: "#64748b",
                  marginBottom: 6,
                  fontWeight: 500,
                }}
              >
                {f.label}
              </label>
              <input
                type={f.type ?? "text"}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                  color: "#1e293b",
                }}
              />
            </div>
          ))}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                color: "#64748b",
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              Description
            </label>
            <textarea
              placeholder="Instructions for students..."
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
                resize: "none",
                fontFamily: "inherit",
                color: "#1e293b",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: 8,
              border: "1.5px solid #e2e8f0",
              background: "#fff",
              fontSize: 13,
              fontWeight: 600,
              color: "#64748b",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            style={{
              flex: 2,
              padding: "11px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Check size={15} />
            Create Homework
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pagination Button Style ──────────────────────────────────────────────────

function pageBtnStyle(active: boolean): React.CSSProperties {
  return {
    width: 30,
    height: 30,
    borderRadius: 7,
    border: active ? "none" : "1.5px solid #e2e8f0",
    background: active ? "#6366f1" : "#fff",
    color: active ? "#fff" : "#64748b",
    fontSize: 12,
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AllHomeworkPage() {
  const [selected, setSelected] = useState<Homework>(homeworkList[0]);
  const [searchHW, setSearchHW] = useState("");
  const [searchStudent, setSearchStudent] = useState("");
  const [activeTab, setActiveTab] = useState<"submissions" | "pending">(
    "submissions"
  );
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [submissions, setSubmissions] = useState<Submission[]>(submissionsData);
  const [hwPage, setHwPage] = useState(1);
  const [subPage, setSubPage] = useState(1);
  const [markModal, setMarkModal] = useState<Submission | null>(null);
  const [createModal, setCreateModal] = useState(false);
  // Mobile: show list or detail
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  const hwPerPage = 4;
  const subPerPage = 5;

  const filteredHW = homeworkList.filter(
    (h) =>
      h.title.toLowerCase().includes(searchHW.toLowerCase()) ||
      h.class.toLowerCase().includes(searchHW.toLowerCase())
  );
  const pagedHW = filteredHW.slice(
    (hwPage - 1) * hwPerPage,
    hwPage * hwPerPage
  );
  const hwTotalPages = Math.ceil(filteredHW.length / hwPerPage);

  const displayedSubs = submissions.filter((s) => {
    const matchSearch = s.name
      .toLowerCase()
      .includes(searchStudent.toLowerCase());
    const matchStatus =
      statusFilter === "All Status" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const activeSubs = displayedSubs.filter((s) => s.status !== "Pending");
  const pendingSubs = displayedSubs.filter((s) => s.status === "Pending");
  const tabSubs = activeTab === "submissions" ? activeSubs : pendingSubs;
  const pagedSubs = tabSubs.slice(
    (subPage - 1) * subPerPage,
    subPage * subPerPage
  );
  const subTotalPages = Math.ceil(tabSubs.length / subPerPage);

  const pct = Math.round((selected.submitted / selected.total) * 100);

  const handleSaveMarks = (id: string, marks: number) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, marks } : s))
    );
    setMarkModal(null);
  };

  return (
    <>
      {/* ── Global style to kill ALL scrollbars except the page itself ── */}
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; overflow-x: hidden; }

        /* Hide scrollbar but keep scroll functionality */
        ::-webkit-scrollbar { width: 0px; height: 0px; }
        * { scrollbar-width: none; -ms-overflow-style: none; }

        /* Responsive helpers */
        @media (max-width: 768px) {
          .hw-layout { flex-direction: column !important; }
          .hw-left   { width: 100% !important; }
          .hw-right  { width: 100% !important; }
          .info-grid { grid-template-columns: 1fr 1fr !important; }
          .filter-row { flex-wrap: wrap !important; }
          .table-wrap { display: none !important; }
          .mobile-cards { display: flex !important; }
          .desktop-only { display: none !important; }
          .mobile-only  { display: flex !important; }
          .page-header  { flex-wrap: wrap; gap: 10px; }
        }
        @media (min-width: 769px) {
          .mobile-cards { display: none !important; }
          .mobile-only  { display: none !important; }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          fontFamily: "'Inter', sans-serif",
          padding: "20px 16px",
          overflowX: "hidden",
        }}
      >
        {/* ── Page Header ── */}
        <div
          className="page-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 22,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: "#1e293b",
            }}
          >
            All Homework
          </h1>
          <button
            onClick={() => setCreateModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(99,102,241,0.35)",
              whiteSpace: "nowrap",
            }}
          >
            <Plus size={16} />
            Create Homework
          </button>
        </div>

        {/* ── Two-column layout ── */}
        <div
          className="hw-layout"
          style={{ display: "flex", gap: 20, alignItems: "flex-start" }}
        >
          {/* ════ LEFT PANEL ════ */}
          <div
            className="hw-left"
            style={{
              width: 300,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* Search */}
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                background: "#fff",
                border: "1.5px solid #f1f5f9",
                borderRadius: 10,
                padding: "0 12px",
                height: 40,
              }}
            >
              <Search size={14} color="#94a3b8" />
              <input
                value={searchHW}
                onChange={(e) => {
                  setSearchHW(e.target.value);
                  setHwPage(1);
                }}
                placeholder="Search homework..."
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  fontSize: 13,
                  outline: "none",
                  color: "#1e293b",
                  minWidth: 0,
                }}
              />
              <Filter
                size={14}
                color="#94a3b8"
                style={{ cursor: "pointer", flexShrink: 0 }}
              />
            </div>

            {/* Homework Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pagedHW.map((hw) => (
                <HomeworkCard
                  key={hw.id}
                  hw={hw}
                  selected={selected.id === hw.id}
                  onSelect={() => {
                    setSelected(hw);
                    setMobileView("detail");
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {hwTotalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => setHwPage(1)}
                  disabled={hwPage === 1}
                  style={pageBtnStyle(false)}
                >
                  <ChevronsLeft size={13} />
                </button>
                <button
                  onClick={() => setHwPage((p) => Math.max(1, p - 1))}
                  disabled={hwPage === 1}
                  style={pageBtnStyle(false)}
                >
                  <ChevronLeft size={13} />
                </button>
                {Array.from({ length: hwTotalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setHwPage(p)}
                      style={pageBtnStyle(p === hwPage)}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setHwPage((p) => Math.min(hwTotalPages, p + 1))
                  }
                  disabled={hwPage === hwTotalPages}
                  style={pageBtnStyle(false)}
                >
                  <ChevronRight size={13} />
                </button>
                <button
                  onClick={() => setHwPage(hwTotalPages)}
                  disabled={hwPage === hwTotalPages}
                  style={pageBtnStyle(false)}
                >
                  <ChevronsRight size={13} />
                </button>
              </div>
            )}
          </div>

          {/* ════ RIGHT PANEL ════ */}
          <div
            className="hw-right"
            style={{
              flex: 1,
              background: "#fff",
              borderRadius: 16,
              border: "1.5px solid #f1f5f9",
              minWidth: 0,
            }}
          >
            {/* Mobile back button */}
            <div
              className="mobile-only"
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #f1f5f9",
                alignItems: "center",
                gap: 8,
              }}
            >
              <button
                onClick={() => setMobileView("list")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "none",
                  color: "#6366f1",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <ChevronLeft size={16} />
                Back to list
              </button>
            </div>

            {/* ── Detail Header ── */}
            <div
              style={{
                padding: "20px 20px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{ display: "flex", gap: 14, alignItems: "center", minWidth: 0 }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: colorMap[selected.color].bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileText size={20} color={colorMap[selected.color].icon} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#1e293b",
                      }}
                    >
                      {selected.title}
                    </h2>
                    <StatusBadge status={selected.status} />
                  </div>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>
                    {selected.class} · {selected.division}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "7px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #e2e8f0",
                    background: "#fff",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  <Edit size={13} />
                  Edit
                </button>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "7px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #fecaca",
                    background: "#fff",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#ef4444",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>

            {/* ── Info Row ── */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: 13,
                  color: "#64748b",
                  lineHeight: 1.6,
                }}
              >
                {selected.description}
              </p>
              {selected.attachment && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "1.5px solid #e2e8f0",
                    fontSize: 12,
                    color: "#6366f1",
                    cursor: "pointer",
                    fontWeight: 500,
                    marginBottom: 14,
                  }}
                >
                  <Paperclip size={13} />
                  {selected.attachment}
                </div>
              )}

              {/* Stats grid */}
              <div
                className="info-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px 24px",
                  marginTop: selected.attachment ? 0 : 4,
                }}
              >
                {[
                  {
                    label: "Due Date",
                    value: selected.dueDate,
                    icon: <Clock size={14} color="#94a3b8" />,
                  },
                  {
                    label: "Assigned Date",
                    value: selected.assignedDate,
                    icon: <ClipboardList size={14} color="#94a3b8" />,
                  },
                  {
                    label: "Total Students",
                    value: String(selected.total),
                    icon: <Users size={14} color="#94a3b8" />,
                  },
                  {
                    label: "Submissions",
                    value: `${selected.submitted} (${pct}%)`,
                    icon: <CheckCircle size={14} color="#94a3b8" />,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {item.icon}
                    <div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1e293b",
                        }}
                      >
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Progress bar ── */}
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  Submission Progress
                </span>
                <span
                  style={{ fontSize: 12, fontWeight: 600, color: "#6366f1" }}
                >
                  {pct}%
                </span>
              </div>
              <div
                style={{ height: 6, background: "#f1f5f9", borderRadius: 99 }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                    borderRadius: 99,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>

            {/* ── Tabs ── */}
            <div
              style={{
                padding: "0 20px",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                gap: 0,
              }}
            >
              {[
                {
                  key: "submissions" as const,
                  label: `Submissions (${activeSubs.length})`,
                },
                {
                  key: "pending" as const,
                  label: `Pending (${pendingSubs.length})`,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSubPage(1);
                  }}
                  style={{
                    padding: "13px 4px",
                    marginRight: 20,
                    border: "none",
                    background: "transparent",
                    fontSize: 13,
                    fontWeight: activeTab === tab.key ? 600 : 400,
                    color: activeTab === tab.key ? "#6366f1" : "#94a3b8",
                    borderBottom:
                      activeTab === tab.key
                        ? "2.5px solid #6366f1"
                        : "2.5px solid transparent",
                    cursor: "pointer",
                    marginBottom: -1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Filter Row ── */}
            <div
              className="filter-row"
              style={{
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {/* Search student */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#f8fafc",
                  border: "1.5px solid #f1f5f9",
                  borderRadius: 8,
                  padding: "0 12px",
                  height: 36,
                  flex: 1,
                  minWidth: 140,
                }}
              >
                <Search size={13} color="#94a3b8" />
                <input
                  value={searchStudent}
                  onChange={(e) => {
                    setSearchStudent(e.target.value);
                    setSubPage(1);
                  }}
                  placeholder="Search student..."
                  style={{
                    flex: 1,
                    border: "none",
                    background: "transparent",
                    fontSize: 13,
                    outline: "none",
                    color: "#1e293b",
                    minWidth: 0,
                  }}
                />
              </div>

              {/* Status filter */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#f8fafc",
                  border: "1.5px solid #f1f5f9",
                  borderRadius: 8,
                  padding: "0 10px 0 12px",
                  height: 36,
                  position: "relative",
                }}
              >
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setSubPage(1);
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 13,
                    outline: "none",
                    color: "#1e293b",
                    cursor: "pointer",
                    appearance: "none",
                    paddingRight: 18,
                  }}
                >
                  {["All Status", "Submitted", "Late", "Pending"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  color="#94a3b8"
                  style={{ pointerEvents: "none", flexShrink: 0 }}
                />
              </div>

              {/* Export */}
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "0 12px",
                  height: 36,
                  borderRadius: 8,
                  border: "1.5px solid #e2e8f0",
                  background: "#fff",
                  fontSize: 13,
                  color: "#64748b",
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                <Download size={14} />
                Export
              </button>
            </div>

            {/* ── Desktop Table ── */}
            <div className="table-wrap" style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {[
                      "Student",
                      "Submitted At",
                      "Status",
                      "Attachment",
                      "Marks",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 20px",
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#94a3b8",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedSubs.map((sub, i) => (
                    <tr
                      key={sub.id}
                      style={{
                        borderBottom: "1px solid #f8fafc",
                        background: i % 2 === 0 ? "#fff" : "#fafbfc",
                      }}
                    >
                      {/* Student */}
                      <td style={{ padding: "14px 20px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: "50%",
                              background: sub.avatarColor,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#fff",
                              flexShrink: 0,
                            }}
                          >
                            {sub.initials}
                          </div>
                          <span
                            style={{ fontWeight: 600, color: "#1e293b" }}
                          >
                            {sub.name}
                          </span>
                        </div>
                      </td>
                      {/* Submitted At */}
                      <td style={{ padding: "14px 20px", color: "#64748b" }}>
                        {sub.submittedAt ? (
                          sub.submittedAt.split("\n").map((line, idx) => (
                            <div
                              key={idx}
                              style={{
                                fontSize: idx === 1 ? 11 : 13,
                                color: idx === 1 ? "#94a3b8" : "#64748b",
                              }}
                            >
                              {line}
                            </div>
                          ))
                        ) : (
                          <span style={{ color: "#cbd5e1" }}>—</span>
                        )}
                      </td>
                      {/* Status */}
                      <td style={{ padding: "14px 20px" }}>
                        <StatusBadge status={sub.status} />
                      </td>
                      {/* Attachment */}
                      <td style={{ padding: "14px 20px" }}>
                        {sub.attachment ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              color: "#ef4444",
                              fontSize: 12,
                              cursor: "pointer",
                            }}
                          >
                            <FileText size={14} />
                            <div>
                              <div>{sub.attachment}</div>
                              <div style={{ color: "#94a3b8", fontSize: 11 }}>
                                {sub.attachmentSize}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: "#cbd5e1" }}>—</span>
                        )}
                      </td>
                      {/* Marks */}
                      <td style={{ padding: "14px 20px" }}>
                        {sub.marks !== null ? (
                          <span
                            style={{ fontWeight: 600, color: "#6366f1" }}
                          >
                            {sub.marks}/100
                          </span>
                        ) : (
                          <span style={{ color: "#cbd5e1" }}>—</span>
                        )}
                      </td>
                      {/* Action */}
                      <td style={{ padding: "14px 20px" }}>
                        {sub.status === "Pending" ? (
                          <span
                            style={{
                              fontSize: 12,
                              color: "#94a3b8",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Clock size={13} />
                            Pending
                          </span>
                        ) : (
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              style={{
                                padding: "6px 12px",
                                borderRadius: 6,
                                border: "1.5px solid #e2e8f0",
                                background: "#fff",
                                fontSize: 12,
                                fontWeight: 500,
                                color: "#64748b",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Eye size={13} />
                              View
                            </button>
                            <button
                              onClick={() => setMarkModal(sub)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 6,
                                border: "none",
                                background:
                                  sub.marks !== null ? "#dcfce7" : "#ede9fe",
                                fontSize: 12,
                                fontWeight: 600,
                                color:
                                  sub.marks !== null ? "#16a34a" : "#6366f1",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              {sub.marks !== null ? (
                                <Check size={13} />
                              ) : (
                                <Edit size={13} />
                              )}
                              {sub.marks !== null ? "Graded" : "Check"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}

                  {pagedSubs.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: "40px 20px",
                          textAlign: "center",
                          color: "#94a3b8",
                          fontSize: 13,
                        }}
                      >
                        <AlertCircle
                          size={20}
                          style={{ display: "block", margin: "0 auto 8px" }}
                        />
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards ── */}
            <div
              className="mobile-cards"
              style={{
                flexDirection: "column",
                gap: 10,
                padding: "12px 16px",
              }}
            >
              {pagedSubs.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: 13,
                    padding: "30px 0",
                  }}
                >
                  <AlertCircle
                    size={20}
                    style={{ display: "block", margin: "0 auto 8px" }}
                  />
                  No students found
                </div>
              ) : (
                pagedSubs.map((sub) => (
                  <MobileSubmissionCard
                    key={sub.id}
                    sub={sub}
                    onMark={() => setMarkModal(sub)}
                  />
                ))
              )}
            </div>

            {/* ── Table Pagination ── */}
            <div
              style={{
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid #f1f5f9",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                Showing{" "}
                {tabSubs.length === 0
                  ? 0
                  : Math.min((subPage - 1) * subPerPage + 1, tabSubs.length)}
                –{Math.min(subPage * subPerPage, tabSubs.length)} of{" "}
                {tabSubs.length} students
              </span>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <button
                  onClick={() => setSubPage((p) => Math.max(1, p - 1))}
                  disabled={subPage === 1}
                  style={pageBtnStyle(false)}
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from(
                  { length: Math.max(1, subTotalPages) },
                  (_, i) => i + 1
                ).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSubPage(p)}
                    style={pageBtnStyle(p === subPage)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setSubPage((p) => Math.min(subTotalPages, p + 1))
                  }
                  disabled={subPage === subTotalPages || subTotalPages === 0}
                  style={pageBtnStyle(false)}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {markModal && (
        <MarkModal
          student={markModal}
          onClose={() => setMarkModal(null)}
          onSave={handleSaveMarks}
        />
      )}
      {createModal && (
        <CreateHomeworkModal onClose={() => setCreateModal(false)} />
      )}
    </>
  );
}