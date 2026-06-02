"use client";

import { useEffect, useState } from "react";

import {
  Users,
  Search,
  Loader2,
  RefreshCw,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  X,
  UploadCloud,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  FileDown,
  Hash,
  AlertTriangle,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  fetchAdmissions as getAdmissions,
  patchFieldValues,
  patchDocuments,
  assignGrNumber,
  getClasses,
} from "@/lib/clerk";
import type { Admission } from "@/types/clerk";

// ─── Assign GR Number API ─────────────────────────────────────────────────────

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Admission["status"] }) {
  const map = {
    pending: {
      icon: Clock,
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    approved: {
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    rejected: {
      icon: XCircle,
      className: "bg-red-50 text-red-700 border-red-200",
    },
  };
  const { icon: Icon, className } = map[status] ?? map.pending;
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function StudentAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  const colors = [
    "bg-violet-100 text-violet-700",
    "bg-sky-100 text-sky-700",
    "bg-emerald-100 text-emerald-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-teal-100 text-teal-700",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div
      className={cn(
        "h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0",
        color,
      )}
    >
      {initials || "?"}
    </div>
  );
}

// ─── GR Number Dialog ─────────────────────────────────────────────────────────

interface GrDialogProps {
  admission: Admission | null;
  studentName: string;
  onClose: () => void;
  onSuccess: () => void;
}

function GrNumberDialog({
  admission,
  studentName,
  onClose,
  onSuccess,
}: GrDialogProps) {
  const [grNo, setGrNo] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!admission) {
      setGrNo("");
      setConfirmed(false);
    }
  }, [admission]);

  const handleSubmit = async () => {
    if (!admission || !grNo.trim()) return;
    setIsSaving(true);
    try {
      await assignGrNumber(admission.admission_number, grNo.trim());
      toast.success(`GR number assigned successfully to ${studentName}`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to assign GR number",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const canSubmit = grNo.trim().length > 0 && confirmed && !isSaving;

  return (
    <Dialog open={!!admission} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden gap-0">
        {/* Colored top bar */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <DialogTitle className="text-white text-base font-semibold m-0 p-0">
              Assign GR Number
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-300 text-xs mt-1 pl-11">
            For <span className="font-semibold text-white">{studentName}</span>
            {" · "}
            <span className="font-mono">{admission?.admission_number}</span>
          </DialogDescription>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Warning banner */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
            <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-amber-900">
                Permanent action — cannot be undone
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Once a GR number is assigned, it is <strong>permanent</strong>{" "}
                and cannot be modified or reassigned. Verify carefully before
                submitting.
              </p>
            </div>
          </div>

          {/* GR number input */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              GR Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="e.g. GR-2024-001"
                value={grNo}
                onChange={(e) => setGrNo(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200 font-mono text-sm h-10 focus:ring-2 focus:ring-slate-900/10"
                autoFocus
                onKeyDown={(e) =>
                  e.key === "Enter" && canSubmit && handleSubmit()
                }
              />
            </div>
            {grNo.trim() && (
              <p className="text-xs text-slate-500">
                GR will be saved as:{" "}
                <span className="font-mono font-semibold text-slate-800">
                  {grNo.trim()}
                </span>
              </p>
            )}
          </div>

          {/* Confirmation checkbox */}
          <div
            className={cn(
              "flex items-start gap-3 rounded-xl border-2 p-3.5 cursor-pointer select-none transition-all",
              confirmed
                ? "border-slate-800 bg-slate-50"
                : "border-slate-200 hover:border-slate-300 bg-white",
            )}
            onClick={() => setConfirmed((c) => !c)}
          >
            <div
              className={cn(
                "mt-0.5 h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                confirmed
                  ? "bg-slate-800 border-slate-800"
                  : "border-slate-300",
              )}
            >
              {confirmed && (
                <svg
                  className="h-2.5 w-2.5 text-white"
                  viewBox="0 0 10 8"
                  fill="none"
                >
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span className="text-sm text-slate-600 leading-relaxed">
              I confirm that GR number{" "}
              {grNo.trim() ? (
                <span className="font-mono font-bold text-slate-900">
                  "{grNo.trim()}"
                </span>
              ) : (
                <span className="text-slate-400">[not entered yet]</span>
              )}{" "}
              is correct and understand this{" "}
              <span className="font-semibold text-slate-800">
                cannot be changed
              </span>{" "}
              later.
            </span>
          </div>
        </div>

        {/* ── Dialog Footer: improved Cancel + Assign buttons ── */}
        <DialogFooter className="px-6 pb-6 pt-2 gap-3 sm:gap-3 flex flex-row">
          {/* Cancel — solid visible button */}
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 h-10 border-2 border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 hover:border-slate-400 transition-all duration-150 shadow-sm"
          >
            Cancel
          </Button>
          {/* Assign — primary action */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 h-10 bg-slate-800 hover:bg-slate-900 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all duration-150"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <Hash className="mr-2 h-4 w-4" />
                Assign GR Number
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentRecordsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // field-edit dialog
  const [editingAdmission, setEditingAdmission] = useState<Admission | null>(
    null,
  );
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});
  const [isSavingFields, setIsSavingFields] = useState(false);

  // document-edit dialog
  const [editingDocAdmission, setEditingDocAdmission] =
    useState<Admission | null>(null);
  const [newDocFiles, setNewDocFiles] = useState<Record<number, File | null>>(
    {},
  );
  const [isSavingDocs, setIsSavingDocs] = useState(false);

  // GR dialog
  const [grAdmission, setGrAdmission] = useState<Admission | null>(null);

  // ── fetch ──────────────────────────────────────────────────────────────────

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [admissionsData, classData] = await Promise.all([
        getAdmissions(),
        getClasses(),
      ]);
      setAdmissions((prev) =>
        admissionsData.sort((a, b) => {
          const prevA = prev.findIndex((p) => p.id === a.id);
          const prevB = prev.findIndex((p) => p.id === b.id);
          return prevA - prevB;
        }),
      );
      setClasses(classData);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load student records";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── field edit ─────────────────────────────────────────────────────────────

  const openFieldEdit = (adm: Admission) => {
    setEditingAdmission(adm);
    const init: Record<string, string> = {};
    adm.field_values.forEach((fv) => {
      init[String(fv.field)] = fv.value;
    });
    setEditedFields(init);
  };

  const handleSaveFields = async () => {
    if (!editingAdmission) return;
    setIsSavingFields(true);
    try {
      await patchFieldValues(
        editingAdmission.admission_number,
        Object.entries(editedFields).map(([id, value]) => ({
          field_id: parseInt(id),
          value,
        })),
      );
      toast.success("Student information updated successfully");
      setEditingAdmission(null);
      await fetchData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save changes",
      );
    } finally {
      setIsSavingFields(false);
    }
  };

  // ── document edit ──────────────────────────────────────────────────────────

  const openDocEdit = (adm: Admission) => {
    setEditingDocAdmission(adm);
    const init: Record<number, File | null> = {};
    adm.documents.forEach((doc) => {
      init[doc.document_field] = null;
    });
    setNewDocFiles(init);
  };

  const handleSaveDocs = async () => {
    if (!editingDocAdmission) return;
    const toUpdate = Object.entries(newDocFiles)
      .filter(([, f]) => f !== null)
      .map(([id, f]) => ({ document_field: parseInt(id), file: f as File }));
    if (toUpdate.length === 0) {
      toast.error("No new files selected to upload");
      return;
    }
    setIsSavingDocs(true);
    try {
      await patchDocuments(editingDocAdmission.admission_number, toUpdate);
      toast.success("Documents updated successfully");
      setEditingDocAdmission(null);
      await fetchData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update documents",
      );
    } finally {
      setIsSavingDocs(false);
    }
  };

  // ── helpers ────────────────────────────────────────────────────────────────

  const getStudentName = (adm: Admission) =>
    adm.field_values.find(
      (fv) =>
        fv.field_label.toLowerCase().includes("student") &&
        fv.field_label.toLowerCase().includes("name"),
    )?.value ||
    adm.field_values.find((fv) => fv.field_label.toLowerCase().includes("name"))
      ?.value ||
    "—";

  const filteredAdmissions = admissions.filter((adm) => {
    const q = searchQuery.toLowerCase();
    return (
      adm.admission_number.toLowerCase().includes(q) ||
      adm.status.toLowerCase().includes(q) ||
      getStudentName(adm).toLowerCase().includes(q)
    );
  });

  const getClassName = (classId: number) =>
    classes.find((cls) => cls.id === classId)?.school_class || "N/A";

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 bg-slate-50/50 min-h-screen overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mapping-tight text-slate-900">
            Pending Addmisson
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            View, edit student information and manage admission documents.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchData}
          disabled={isLoading}
          className="border-slate-200 bg-white shadow-sm"
        >
          <RefreshCw
            className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      <Separator className="bg-slate-200" />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main card */}
      <Card className="shadow-sm border-slate-200 bg-white overflow-hidden">
        <CardHeader className="pb-4 px-6 pt-5 border-b border-slate-100 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-slate-900">
                  All Student Records
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {admissions.length} student
                  {admissions.length !== 1 ? "s" : ""} registered
                </CardDescription>
              </div>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search by name, ID, status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          <ScrollArea className="h-[600px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Loader2 className="h-7 w-7 animate-spin mb-3 text-slate-300" />
                <p className="text-sm text-slate-400">
                  Loading student records...
                </p>
              </div>
            ) : filteredAdmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="bg-slate-50 p-5 rounded-2xl mb-4">
                  <Users className="h-10 w-10 text-slate-200" />
                </div>
                <p className="text-sm text-slate-400 max-w-[200px]">
                  {searchQuery
                    ? "No records match your search"
                    : "No student records found"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredAdmissions.map((adm) => {
                  const isExpanded = expandedId === adm.id;
                  const name = getStudentName(adm);
                  return (
                    <div key={adm.id}>
                      {/* ── Collapsed row ── */}
                      <div
                        className={cn(
                          "flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-4 transition-colors cursor-pointer",
                          isExpanded ? "bg-slate-50" : "hover:bg-slate-50/70",
                        )}
                        onClick={() =>
                          setExpandedId(isExpanded ? null : adm.id)
                        }
                      >
                        {/* Avatar */}
                        <StudentAvatar name={name} />

                        {/* Name + admission number */}
                        <div className="sm:ml-3.5 w-full sm:w-48 min-w-0">
                          <div className="font-semibold text-slate-900 truncate text-sm leading-tight">
                            {name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                            {adm.admission_number}
                          </div>
                        </div>

                        {/* Field preview pills */}
                        <div className="w-full sm:flex-1 flex flex-wrap items-center gap-1.5 sm:px-4 min-w-0">
                          {adm.field_values.slice(0, 3).map((fv) => (
                            <span
                              key={fv.id}
                              title={`${fv.field_label}: ${fv.value}`}
                              className="text-[11px] text-slate-500 bg-slate-100 rounded-md px-2 py-0.5 truncate max-w-[120px]"
                            >
                              {fv.value}
                            </span>
                          ))}
                          {adm.field_values.length > 3 && (
                            <span className="text-[11px] text-slate-400">
                              +{adm.field_values.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Status badge */}
                        <div className="shrink-0 mr-4">
                          <StatusBadge status={adm.status} />
                        </div>

                        {/* ── Action buttons: GR + Chevron ── */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                          {/* GR Button — redesigned to be clearly a button */}
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 h-9 px-3 sm:px-4 rounded-lg text-xs font-semibold border-2 border-slate-800 bg-slate-800 text-white hover:bg-slate-700 hover:border-slate-700 active:scale-95 transition-all duration-150 shadow-sm select-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGrAdmission(adm);
                            }}
                          >
                            <Hash className="h-3 w-3" />
                            GR No.
                          </button>

                          {/* Expand/collapse chevron */}
                          <div className="h-7 w-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ── Expanded panel ── */}
                      {isExpanded && (
                        <div className="bg-slate-50/80 border-t border-slate-100 px-6 py-5">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* Student Information */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase mapping-wider">
                                  Student Information
                                </h4>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs gap-1.5 border-slate-200 bg-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openFieldEdit(adm);
                                  }}
                                >
                                  <Edit3 className="h-3 w-3" />
                                  Edit Info
                                </Button>
                              </div>
                              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                                {[...adm.field_values]
                                  .sort((a, b) => a.id - b.id)
                                  .map((fv, idx) => (
                                    <div
                                      key={fv.id}
                                      className={cn(
                                        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-4 py-3 text-sm",
                                        idx !== adm.field_values.length - 1 &&
                                        "border-b border-slate-100",
                                        idx % 2 === 0
                                          ? "bg-white"
                                          : "bg-slate-50/50",
                                      )}
                                    >
                                      <span className="text-slate-500 text-xs font-medium sm:w-36 shrink-0">
                                        {fv.field_label}
                                      </span>
                                      <span className="text-slate-800 text-xs text-right font-medium">
                                        {fv.field_label
                                          .toLowerCase()
                                          .includes("class")
                                          ? getClassName(Number(fv.value))
                                          : fv.value}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>

                            {/* Documents */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase mapping-wider">
                                  Documents
                                </h4>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs gap-1.5 border-slate-200 bg-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDocEdit(adm);
                                  }}
                                >
                                  <UploadCloud className="h-3 w-3" />
                                  Update Docs
                                </Button>
                              </div>
                              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                                {adm.documents.length === 0 ? (
                                  <div className="flex flex-col items-center justify-center py-8 text-slate-400 text-sm gap-2">
                                    <FileText className="h-6 w-6 text-slate-200" />
                                    <span className="text-xs">
                                      No documents uploaded
                                    </span>
                                  </div>
                                ) : (
                                  adm.documents.map((doc, idx) => (
                                    <div
                                      key={doc.id}
                                      className={cn(
                                        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3",
                                        idx !== adm.documents.length - 1 &&
                                        "border-b border-slate-100",
                                        idx % 2 === 0
                                          ? "bg-white"
                                          : "bg-slate-50/50",
                                      )}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center shrink-0">
                                          <FileText className="h-3 w-3 text-slate-500" />
                                        </div>
                                        <span className="text-xs text-slate-700 font-medium">
                                          {doc.document_label}
                                        </span>
                                      </div>
                                      <a
                                        href={doc.file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
                                      >
                                        <Eye className="h-3 w-3" />
                                        View
                                      </a>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* ── GR Number Dialog ─────────────────────────────────────────────────── */}
      <GrNumberDialog
        admission={grAdmission}
        studentName={grAdmission ? getStudentName(grAdmission) : ""}
        onClose={() => setGrAdmission(null)}
        onSuccess={fetchData}
      />

      {/* ── Edit Field Values Dialog ──────────────────────────────────────────── */}
      <Dialog
        open={!!editingAdmission}
        onOpenChange={(open) => !open && setEditingAdmission(null)}
      >
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Information</DialogTitle>
            <DialogDescription>
              Updating fields for{" "}
              <span className="font-semibold text-slate-900">
                {editingAdmission ? getStudentName(editingAdmission) : ""}
              </span>{" "}
              — {editingAdmission?.admission_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {[...(editingAdmission?.field_values || [])]
              .sort((a, b) => a.id - b.id)
              .map((fv) => (
                <div key={fv.id} className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    {fv.field_label}
                  </label>
                  {fv.field_label.toLowerCase().includes("class") ? (
                    <Select
                      value={editedFields[String(fv.field)] || String(fv.value)}
                      onValueChange={(value: string | null) =>
                        setEditedFields((prev) => ({
                          ...prev,
                          [String(fv.field)]: value ?? "",
                        }))
                      }
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200 w-full">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...classes]
                          .sort((a, b) => a.id - b.id)
                          .map((cls) => (
                            <SelectItem key={cls.id} value={String(cls.id)}>
                              {cls.school_class}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={editedFields[String(fv.field)] || String(fv.value)}
                      onChange={(e) =>
                        setEditedFields((prev) => ({
                          ...prev,
                          [String(fv.field)]: e.target.value,
                        }))
                      }
                      className="bg-slate-50 border-slate-200"
                    />
                  )}
                </div>
              ))}
          </div>
          {/* ── Edit Field Dialog Footer ── */}
          <DialogFooter className="gap-3 mt-2 flex flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setEditingAdmission(null)}
              disabled={isSavingFields}
              className="flex-1 h-10 border-2 border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 hover:border-slate-400 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveFields}
              disabled={isSavingFields}
              className="flex-1 h-10 bg-slate-800 hover:bg-slate-900 text-white font-semibold shadow-sm"
            >
              {isSavingFields ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Documents Dialog ─────────────────────────────────────────────── */}
      <Dialog
        open={!!editingDocAdmission}
        onOpenChange={(open) => !open && setEditingDocAdmission(null)}
      >
        <DialogContent className="w-[95vw] sm:max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Update Documents</DialogTitle>
            <DialogDescription>
              Upload replacement files for{" "}
              <span className="font-semibold text-slate-900">
                {editingDocAdmission ? getStudentName(editingDocAdmission) : ""}
              </span>
              . Only files you select here will be updated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {editingDocAdmission?.documents.map((doc) => (
              <div key={doc.id} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <label className="text-sm font-medium text-slate-700">
                    {doc.document_label}
                  </label>
                  <a
                    href={doc.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <FileDown className="h-3 w-3" />
                    Current file
                  </a>
                </div>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-3 transition-colors text-center cursor-pointer",
                    newDocFiles[doc.document_field]
                      ? "border-primary/50 bg-primary/5"
                      : "border-slate-200 hover:border-primary/30",
                  )}
                  onClick={() =>
                    document
                      .getElementById(`doc-upload-${doc.document_field}`)
                      ?.click()
                  }
                >
                  <input
                    id={`doc-upload-${doc.document_field}`}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setNewDocFiles((prev) => ({
                        ...prev,
                        [doc.document_field]: file,
                      }));
                    }}
                  />
                  {newDocFiles[doc.document_field] ? (
                    <div className="flex items-center justify-between gap-2 px-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-medium truncate text-slate-700">
                          {newDocFiles[doc.document_field]!.name}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewDocFiles((prev) => ({
                            ...prev,
                            [doc.document_field]: null,
                          }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="py-1">
                      <UploadCloud className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                      <p className="text-xs text-slate-500">Click to replace</p>
                      <p className="text-[10px] text-slate-400">
                        PDF, DOC, PNG, JPG
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* ── Update Docs Dialog Footer ── */}
          <DialogFooter className="gap-3 mt-2 flex flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setEditingDocAdmission(null)}
              disabled={isSavingDocs}
              className="flex-1 h-10 border-2 border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 hover:border-slate-400 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDocs}
              disabled={isSavingDocs}
              className="flex-1 h-10 bg-slate-800 hover:bg-slate-900 text-white font-semibold shadow-sm"
            >
              {isSavingDocs ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Documents
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
