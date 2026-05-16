"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Search,
  Bell,
  Settings2,
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
  BookOpen,
  Filter,
  LogOut,
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

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const sidebarLinks = [
  { title: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { title: "Attendance", href: "/teacher/attendance", icon: ClipboardList },
  {
    title: "Homework",
    href: "/teacher/homework",
    icon: BookOpen,
    children: [
      { title: "All Homework", href: "/teacher/homework" },
      { title: "Create Homework", href: "/teacher/homework/create" },
      { title: "Submissions", href: "/teacher/homework/submissions" },
    ],
  },
  { title: "Students", href: "/teacher/students", icon: Users },
];

function Sidebar({
  activeHref,
  onNav,
}: {
  activeHref: string;
  onNav: (href: string) => void;
}) {
  const [openGroup, setOpenGroup] = useState<string | null>("Homework");

  return (
    <aside
      style={{
        width: 220,
        minHeight: "100vh",
        background: "#0f0f2d",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BookOpen size={18} color="#fff" />
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.2,
              }}
            >
              Edu<span style={{ color: "#818cf8" }}>Manage</span>
            </div>
            <div
              style={{
                fontSize: 10,
                color: "#64748b",
                letterSpacing: "0.05em",
              }}
            >
              School Management
            </div>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div style={{ padding: "0 12px 16px" }}>
        <div
          style={{
            background: "#1e1b4b",
            borderRadius: 10,
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: "1px solid #312e81",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            SA
          </div>
          <div>
            <div
              style={{
                fontSize: 9,
                color: "#818cf8",
                letterSpacing: "0.08em",
                fontWeight: 600,
              }}
            >
              CURRENT ROLE
            </div>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>
              Teacher
            </div>
          </div>
          <Settings2
            size={14}
            color="#64748b"
            style={{ marginLeft: "auto", cursor: "pointer" }}
          />
        </div>
      </div>

      <div style={{ padding: "0 12px 8px" }}>
        <div
          style={{
            fontSize: 9,
            color: "#475569",
            letterSpacing: "0.1em",
            fontWeight: 600,
            paddingLeft: 8,
          }}
        >
          NAVIGATION
        </div>
      </div>

      {/* Nav Links */}
      <nav
        style={{
          flex: 1,
          padding: "0 12px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {sidebarLinks.map((link) => {
          const isGroupActive = link.children
            ? link.children.some((c) => c.href === activeHref)
            : activeHref === link.href;
          const isGroupOpen = openGroup === link.title;
          const Icon = link.icon;

          return (
            <div key={link.href}>
              <button
                onClick={() => {
                  if (link.children) {
                    setOpenGroup(isGroupOpen ? null : link.title);
                  } else {
                    onNav(link.href);
                  }
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: "none",
                  background:
                    isGroupActive && !link.children ? "#312e81" : "transparent",
                  color: isGroupActive ? "#fff" : "#94a3b8",
                  fontSize: 13,
                  fontWeight: isGroupActive ? 600 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!isGroupActive || link.children)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#1e293b";
                }}
                onMouseLeave={(e) => {
                  if (!isGroupActive || link.children)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      isGroupActive && !link.children
                        ? "#312e81"
                        : "transparent";
                }}
              >
                <Icon size={17} />
                <span style={{ flex: 1 }}>{link.title}</span>
                {link.children && (
                  <ChevronDown
                    size={14}
                    style={{
                      transform: isGroupOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                )}
              </button>

              {link.children && isGroupOpen && (
                <div
                  style={{
                    marginLeft: 28,
                    marginTop: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  {link.children.map((child) => (
                    <button
                      key={child.href}
                      onClick={() => onNav(child.href)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "7px 12px",
                        borderRadius: 6,
                        border: "none",
                        background:
                          activeHref === child.href ? "#1e1b4b" : "transparent",
                        color:
                          activeHref === child.href ? "#818cf8" : "#64748b",
                        fontSize: 12,
                        fontWeight: activeHref === child.href ? 600 : 400,
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background:
                            activeHref === child.href ? "#818cf8" : "#334155",
                        }}
                      />
                      {child.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div style={{ padding: "12px 12px 20px" }}>
        <button
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: "#64748b",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({ breadcrumbs }: { breadcrumbs: string[] }) {
  return (
    <header
      style={{
        height: 60,
        background: "#fff",
        borderBottom: "1px solid #f1f5f9",
        display: "flex",
        alignItems: "center",
        padding: "0 28px",
        gap: 16,
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
        {breadcrumbs.map((b, i) => (
          <React.Fragment key={b}>
            <span
              style={{
                fontSize: 13,
                color: i === breadcrumbs.length - 1 ? "#1e293b" : "#94a3b8",
                fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
              }}
            >
              {b}
            </span>
            {i < breadcrumbs.length - 1 && (
              <ChevronRight size={14} color="#cbd5e1" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: "0 12px",
          height: 36,
        }}
      >
        <Search size={14} color="#94a3b8" />
        <input
          placeholder="Quick search..."
          style={{
            border: "none",
            background: "transparent",
            fontSize: 13,
            color: "#1e293b",
            outline: "none",
            width: 180,
          }}
        />
      </div>

      <button
        style={{
          position: "relative",
          width: 36,
          height: 36,
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <Bell size={16} color="#64748b" />
        <span
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#ef4444",
            border: "2px solid #fff",
          }}
        />
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "#6366f1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          SA
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
            Admin
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Teacher</div>
        </div>
      </div>
    </header>
  );
}

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
      }}
    >
      {status}
    </span>
  );
}

// ─── Homework Card (Left List) ────────────────────────────────────────────────

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
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 28,
          width: 380,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
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
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              color: "#1e293b",
            }}
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
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 28,
          width: 480,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
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
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {(
            [
              {
                label: "Title",
                key: "title",
                placeholder: "e.g. Chapter 5 Exercise",
                col: 2,
              },
              {
                label: "Class",
                key: "class",
                placeholder: "e.g. Class 10",
                col: 1,
              },
              {
                label: "Division",
                key: "division",
                placeholder: "e.g. Division A",
                col: 1,
              },
              {
                label: "Due Date",
                key: "dueDate",
                placeholder: "",
                col: 2,
                type: "date",
              },
            ] as Array<{
              label: string;
              key: keyof typeof form;
              placeholder: string;
              col: number;
              type?: string;
            }>
          ).map((f) => (
            <div key={f.key} style={{ gridColumn: `span ${f.col}` }}>
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
          <div style={{ gridColumn: "span 2" }}>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AllHomeworkPage() {
  const [activeHref, setActiveHref] = useState("/teacher/homework");
  const [selected, setSelected] = useState<Homework>(homeworkList[0]);
  const [searchHW, setSearchHW] = useState("");
  const [searchStudent, setSearchStudent] = useState("");
  const [activeTab, setActiveTab] = useState<"submissions" | "pending">(
    "submissions",
  );
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [submissions, setSubmissions] = useState<Submission[]>(submissionsData);
  const [hwPage, setHwPage] = useState(1);
  const [subPage, setSubPage] = useState(1);
  const [markModal, setMarkModal] = useState<Submission | null>(null);
  const [createModal, setCreateModal] = useState(false);

  const hwPerPage = 4;
  const subPerPage = 5;

  const filteredHW = homeworkList.filter(
    (h) =>
      h.title.toLowerCase().includes(searchHW.toLowerCase()) ||
      h.class.toLowerCase().includes(searchHW.toLowerCase()),
  );
  const pagedHW = filteredHW.slice(
    (hwPage - 1) * hwPerPage,
    hwPage * hwPerPage,
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
    subPage * subPerPage,
  );
  const subTotalPages = Math.ceil(tabSubs.length / subPerPage);

  const pct = Math.round((selected.submitted / selected.total) * 100);

  const handleSaveMarks = (id: string, marks: number) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, marks } : s)),
    );
    setMarkModal(null);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "'Inter', sans-serif",
        background: "#f8fafc",
      }}
    >
      <Sidebar activeHref={activeHref} onNav={setActiveHref} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Topbar breadcrumbs={["Teacher", "Homework", "All Homework"]} />

        <main style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {/* Page Header */}
          <div
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
              }}
            >
              <Plus size={16} />
              Create Homework
            </button>
          </div>

          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            {/* ── Left Panel ── */}
            <div
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
                  }}
                />
                <Filter
                  size={14}
                  color="#94a3b8"
                  style={{ cursor: "pointer" }}
                />
              </div>

              {/* Homework Cards */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {pagedHW.map((hw) => (
                  <HomeworkCard
                    key={hw.id}
                    hw={hw}
                    selected={selected.id === hw.id}
                    onSelect={() => setSelected(hw)}
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
                    gap: 6,
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
                    ),
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

            {/* ── Right Panel ── */}
            <div
              style={{
                flex: 1,
                background: "#fff",
                borderRadius: 16,
                border: "1.5px solid #f1f5f9",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: colorMap[selected.color].bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FileText size={22} color={colorMap[selected.color].icon} />
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 4,
                      }}
                    >
                      <h2
                        style={{
                          margin: 0,
                          fontSize: 18,
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
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: "1.5px solid #e2e8f0",
                      background: "#fff",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#64748b",
                      cursor: "pointer",
                    }}
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: "1.5px solid #fecaca",
                      background: "#fff",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#ef4444",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>

              {/* Info Row */}
              <div
                style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  gap: 24,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 12px",
                      fontSize: 13,
                      color: "#64748b",
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
                      }}
                    >
                      <Paperclip size={13} />
                      {selected.attachment}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px 32px",
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

              {/* Progress bar */}
              <div
                style={{
                  padding: "10px 24px",
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

              {/* Tabs */}
              <div
                style={{
                  padding: "0 24px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  gap: 4,
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
                      padding: "14px 4px",
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
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Filter Row */}
              <div
                style={{
                  padding: "14px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
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
                    maxWidth: 280,
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
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#f8fafc",
                    border: "1.5px solid #f1f5f9",
                    borderRadius: 8,
                    padding: "0 12px",
                    height: 36,
                    cursor: "pointer",
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
                      paddingRight: 20,
                    }}
                  >
                    {["All Status", "Submitted", "Late", "Pending"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    color="#94a3b8"
                    style={{
                      pointerEvents: "none",
                      position: "absolute",
                      right: 10,
                    }}
                  />
                </div>

                <button
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "0 14px",
                    height: 36,
                    borderRadius: 8,
                    border: "1.5px solid #e2e8f0",
                    background: "#fff",
                    fontSize: 13,
                    color: "#64748b",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  <Download size={14} />
                  Export
                </button>
              </div>

              {/* Table */}
              <div style={{ overflowX: "auto" }}>
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
                            padding: "10px 24px",
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
                        <td style={{ padding: "14px 24px" }}>
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
                            <span style={{ fontWeight: 600, color: "#1e293b" }}>
                              {sub.name}
                            </span>
                          </div>
                        </td>
                        {/* Submitted At */}
                        <td style={{ padding: "14px 24px", color: "#64748b" }}>
                          {sub.submittedAt ? (
                            sub.submittedAt.split("\n").map((line, i) => (
                              <div
                                key={i}
                                style={{
                                  fontSize: i === 1 ? 11 : 13,
                                  color: i === 1 ? "#94a3b8" : "#64748b",
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
                        <td style={{ padding: "14px 24px" }}>
                          <StatusBadge status={sub.status} />
                        </td>
                        {/* Attachment */}
                        <td style={{ padding: "14px 24px" }}>
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
                        <td style={{ padding: "14px 24px" }}>
                          {sub.marks !== null ? (
                            <span style={{ fontWeight: 600, color: "#6366f1" }}>
                              {sub.marks}/100
                            </span>
                          ) : (
                            <span style={{ color: "#cbd5e1" }}>—</span>
                          )}
                        </td>
                        {/* Action */}
                        <td style={{ padding: "14px 24px" }}>
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
                            padding: "40px 24px",
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

              {/* Table Pagination */}
              <div
                style={{
                  padding: "14px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  Showing{" "}
                  {Math.min((subPage - 1) * subPerPage + 1, tabSubs.length)}–
                  {Math.min(subPage * subPerPage, tabSubs.length)} of{" "}
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
                    (_, i) => i + 1,
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
        </main>
      </div>

      {/* Modals */}
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
  };
}
