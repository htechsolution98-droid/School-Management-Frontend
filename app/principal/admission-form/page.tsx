"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  IndianRupee,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";

import {
  getAdmissionForms,
  toggleFormStatus,
  getPublishedFormLink,
} from "@/lib/forms";
import type { AdmissionFormResponse } from "@/lib/form-builder-config";
import PrincipalFormBuilder from "@/components/forms/principal-form-builder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

// ─── Tiny inline Dialog (to avoid Base-UI complexity in a sheet context) ───────
function ModalBackdrop({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
    />
  );
}

// ─── Form Details Modal ────────────────────────────────────────────────────────
function FormDetailsModal({
  form,
  onClose,
}: {
  form: AdmissionFormResponse;
  onClose: () => void;
}) {
  return (
    <AnimatePresence mode="wait">
      <ModalBackdrop key="details-backdrop" onClick={onClose} />

      <motion.div
        key="details-modal"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b bg-gradient-to-r from-blue-600/8 via-white to-cyan-500/8 px-6 py-5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {form.title}
                </h2>
                {form.description ? (
                  <p className="text-sm text-slate-500 mt-0.5">
                    {form.description}
                  </p>
                ) : null}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b bg-slate-50/60 shrink-0">
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <span className="font-medium text-slate-400">ID:</span>
              <span className="font-semibold">#{form.id}</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            {form.fees_enable ? (
              <div className="flex items-center gap-1.5 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                <IndianRupee className="h-3.5 w-3.5" />
                <span className="font-semibold">{form.fees}</span>
                <span className="text-emerald-600">Fees</span>
              </div>
            ) : (
              <span className="text-sm text-slate-400 bg-slate-100 rounded-full px-3 py-1">
                No Fees
              </span>
            )}
            <div className="h-4 w-px bg-slate-200" />
            <div className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded-lg truncate max-w-[200px]">
              {form.unique_link}
            </div>
          </div>

          {/* Sections & Fields */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            {(form.sections || []).map((section, index) => (
              <div
                key={section.id || `${section.title}-${index}`}
                className="rounded-xl border border-slate-200 overflow-hidden"
              >
                <div className="flex items-center gap-2 border-b bg-slate-50 px-4 py-3">
                  <Layers className="h-4 w-4 text-blue-600" />
                  <p className="font-semibold text-slate-800 text-sm">
                    {section.title}
                  </p>
                  <span className="ml-auto text-xs text-slate-400">
                    {section.fields?.length || 0} fields
                  </span>
                </div>
                <div className="divide-y">
                  {(section.fields || []).map((field, index) => (
                    <div
                      key={`field-${index}`}
                      className="flex items-center gap-3 px-4 py-3 group hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                        <FileText className="h-3.5 w-3.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {field.label}
                        </p>

                        <p className="text-xs text-slate-400 font-mono truncate">
                          Order: {field.order}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          {field.field_type}
                        </span>

                        {Boolean(field.required || field.is_required) ? (
                          <span className="flex items-center gap-1 text-xs bg-red-50 text-red-600 border border-red-200 rounded-full px-2 py-0.5 font-medium">
                            Required
                          </span>
                        ) : (
                          <span className="text-xs bg-slate-50 text-slate-400 border border-slate-200 rounded-full px-2 py-0.5">
                            Optional
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Create Form Modal (wraps the multi-step form builder) ───────────────────
function CreateFormModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (form: AdmissionFormResponse) => void;
}) {
  const handleSuccess = (form: AdmissionFormResponse) => {
    onCreated(form);
    // Let the user see the success state for a moment, then close
    setTimeout(() => {
      onClose();
    }, 1600);
  };

  return (
    <AnimatePresence mode="wait">
      <ModalBackdrop key="modal-backdrop" onClick={onClose} />

      <motion.div
        key="create-form-modal"
        initial={{ opacity: 0, scale: 0.97, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 20 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full max-w-5xl my-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 shadow-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <PrincipalFormBuilder onSuccess={handleSuccess} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-cyan-100 mb-6">
        <FileText className="h-10 w-10 text-blue-600" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">
        No forms created yet
      </h3>
      <p className="text-sm text-slate-500 max-w-xs mb-8">
        Create your first admission form to start collecting applications from
        students and parents.
      </p>
      <Button onClick={onCreateClick} className="gap-2">
        <Plus className="h-4 w-4" />
        Create Form
      </Button>
    </motion.div>
  );
}

// ─── Form Table Row ───────────────────────────────────────────────────────────
function FormTableRow({
  form,
  index,
  onView,
  onPublishToggle,
  isToggling = false,
}: {
  form: AdmissionFormResponse;
  index: number;
  onView: () => void;
  onPublishToggle: (formId: number, currentStatus: boolean) => void;
  isToggling?: boolean;
}) {
  const totalFields = (form.sections || []).reduce(
    (sum, s) => sum + (s.fields?.length || 0),
    0,
  );

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group hover:bg-blue-50/50 transition-colors"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0 group-hover:bg-blue-100 transition-colors">
            <ClipboardList className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm leading-tight">
              {form.title}
            </p>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              #{form.id}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        {form.description ? (
          <p className="text-sm text-slate-600 line-clamp-2 max-w-xs">
            {form.description}
          </p>
        ) : (
          <span className="text-sm text-slate-300 italic">No description</span>
        )}
      </td>
      <td className="px-6 py-4">
        {form.fees_enable ? (
          <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 w-fit">
            <IndianRupee className="h-3 w-3" />
            <span className="text-xs font-bold">{form.fees}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-3 py-1">
            Free
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1.5">
          {(form.sections || []).map((s, index) => (
            <span
              key={s.id || `section-badge-${index}`}
              className="text-xs bg-slate-100 text-slate-600 rounded-md px-2 py-0.5 font-medium"
            >
              {s.title}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {totalFields} total fields
        </p>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={form.is_active}
            onCheckedChange={() => onPublishToggle(form.id, form.is_active)}
            disabled={isToggling}
          />
          <span
            className={`text-xs font-medium ${form.is_active ? "text-blue-600" : "text-slate-400"}`}
          >
            {form.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <Button
          variant="outline"
          size="sm"
          onClick={onView}
          className="gap-2 h-8"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>
      </td>
    </motion.tr>
  );
}

// ─── Published Link Card ──────────────────────────────────────────────────────
function PublishedLinkCard({ link }: { link: string }) {
  const uniqueLink = link.split("/").filter(Boolean).pop();

    const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  const frontendLink = `${origin}/form/${uniqueLink}`;


  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(frontendLink);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // add this function
  const handlePreviewForm = () => {
  if (!frontendLink) return;
  window.open(frontendLink, "_blank");
};

  if (!link) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-5 shadow-sm hover:shadow-md transition-all"
    >
      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-40 w-40 rounded-full bg-blue-50/50 blur-3xl group-hover:bg-blue-100/50 transition-colors" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-200 shadow-lg shrink-0">
            <ExternalLink className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 leading-tight">
              Published Admission Form
            </h3>
            <p className="text-xs text-blue-600 font-medium">
              Link is active and ready to share
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1 sm:w-[320px] lg:w-[400px]">
            <div className="h-10 flex items-center rounded-xl border border-slate-200 bg-slate-50/50 pl-4 pr-10 font-mono text-xs text-slate-600 shadow-inner overflow-hidden whitespace-nowrap">
              <span className="truncate">{frontendLink}</span>
            </div>
            <button
              onClick={handleCopy}
              className="absolute right-1 top-1 h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white transition-all shadow-sm"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          {/* chnage in the button --s */}
          <Button
            variant="outline"
            onClick={handlePreviewForm}
            className="h-10 px-4 rounded-xl border-blue-100 bg-blue-50/30 text-blue-600 hover:bg-blue-600 hover:text-white transition-all gap-2"
          >
            Preview Form
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdmissionFormPage() {
  const [forms, setForms] = useState<AdmissionFormResponse[]>([]);
  const [formLink, setFormLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewForm, setViewForm] = useState<AdmissionFormResponse | null>(null);
  const [successBanner, setSuccessBanner] = useState("");
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchForms = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [data, linkData] = await Promise.all([
        getAdmissionForms(),
        getPublishedFormLink().catch(() => ({ form_link: "" })),
      ]);

      const sortedForms = [...data].sort((a, b) => {
        // ACTIVE FORM ALWAYS FIRST
        if (a.is_active && !b.is_active) return -1;
        if (!a.is_active && b.is_active) return 1;

        // THEN SORT BY ID
        return a.id - b.id;
      });

      setForms(sortedForms);
      setFormLink(linkData.form_link);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load forms.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const handleCreated = async (createdForm: AdmissionFormResponse) => {
    await fetchForms();

    setSuccessBanner(
      `Form "${createdForm?.title || "Admission Form"}" was created successfully!`,
    );

    setTimeout(() => {
      setSuccessBanner("");
    }, 5000);
  };

  // replace this full function -- S
  const handlePublishToggle = async (
    formId: number,
    currentStatus: boolean,
  ) => {
    if (togglingId !== null) return;

    setTogglingId(formId);

    try {
      const updatedStatus = !currentStatus;

      await toggleFormStatus(formId, updatedStatus);

      toast.success("Form status updated successfully");

      await fetchForms();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update form status",
      );
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <span>Principal</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-slate-700 font-medium">
                Admission Forms
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Admission Forms
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage and distribute admission forms for incoming students.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchForms}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              onClick={() => setCreateOpen(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create Form
            </Button>
          </div>
        </div>

        {/* Success banner */}
        <AnimatePresence>
          {successBanner ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              {successBanner}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Error banner */}
        <AnimatePresence>
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              {error}
              <button
                onClick={fetchForms}
                className="ml-auto text-xs underline underline-offset-2 hover:no-underline font-medium"
              >
                Retry
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Stats strip */}
        {!loading && forms.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Total Forms",
                value: forms.length,
                icon: FileText,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "With Fees",
                value: forms.filter((f) => f.fees_enable).length,
                icon: IndianRupee,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                label: "Total Sections",
                value: forms.reduce(
                  (sum, f) => sum + (f.sections?.length || 0),
                  0,
                ),
                icon: Layers,
                color: "text-violet-600",
                bg: "bg-violet-50",
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg} ${color} shrink-0`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 leading-none">
                    {value}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}

        {/* Active Link Section */}
        {!loading && formLink ? <PublishedLinkCard link={formLink} /> : null}

        {/* Main card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
              <p className="text-sm text-slate-400">Loading admission forms…</p>
            </div>
          ) : forms.length === 0 ? (
            <EmptyState onCreateClick={() => setCreateOpen(true)} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    {[
                      "Form",
                      "Description",
                      "Fees",
                      "Sections",
                      "Publish",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 ${h === "Actions" ? "text-right" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {forms.map((form, idx) => (
                    <FormTableRow
                      key={form.id || `form-${idx}`}
                      form={form}
                      index={idx}
                      onView={() => setViewForm(form)}
                      onPublishToggle={handlePublishToggle}
                      isToggling={togglingId === form.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Form Modal */}
      {createOpen ? (
        <CreateFormModal
          onClose={() => setCreateOpen(false)}
          onCreated={handleCreated}
        />
      ) : null}

      {/* View Form Details Modal */}
      {viewForm ? (
        <FormDetailsModal form={viewForm} onClose={() => setViewForm(null)} />
      ) : null}
    </>
  );
}
