"use client";

import { useEffect, useState } from "react";
import {
  UserPlus,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Backpack,
} from "lucide-react";
import { toast } from "sonner";

import {
  getDivisions,
  getSubjects,
  getTeachers,
  assignClass,
} from "@/lib/clerk";
import type {
  AssignClassPayload,
  Division,
  Subject,
  Teacher,
} from "@/types/clerk";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

export default function AssignTeacherPage() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [isClassTeacher, setIsClassTeacher] = useState(false);

  // ── Fetch all data on mount ─────────────────────────────────────────────────

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [divisionsData, subjectsData, teachersData] = await Promise.all([
        getDivisions(),
        getSubjects(),
        getTeachers(),
      ]);
      setDivisions(divisionsData);
      setSubjects(subjectsData);
      setTeachers(teachersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      toast.error("Could not load required data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Derived: Combined "Class 5 - A" options ─────────────────────────────────
  const classDivisionOptions = [...divisions]
    .filter((d) => d.class_name && d.division)
    .sort((a, b) => {
      const classCompare = (a.class_name ?? "").localeCompare(
        b.class_name ?? "",
        undefined,
        { numeric: true },
      );
      if (classCompare !== 0) return classCompare;
      return a.division.localeCompare(b.division);
    });

  // ── Derived: Subjects filtered by selected division ─────────────────────────
  const relevantSubjects = subjects.filter(
    (s) => s.division !== null && s.division?.toString() === selectedDivisionId,
  );

  // ── Label helpers ───────────────────────────────────────────────────────────

  const getClassDivisionLabel = (divId: string) => {
    const div = divisions.find((d) => d.id?.toString() === divId);
    if (!div) return "";
    return `${div.class_name} - ${div.division}`;
  };

  const getSubjectLabel = (subId: string) =>
    subjects.find((s) => s.id?.toString() === subId)?.name ?? "";

  const getTeacherLabel = (teachId: string) =>
    teachers.find((t) => t.id.toString() === teachId)?.name ?? "";

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDivisionId || !selectedSubjectId || !selectedTeacherId) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const payload: AssignClassPayload = {
        is_class_teacher: isClassTeacher,
        teacher: parseInt(selectedTeacherId),
        subject: parseInt(selectedSubjectId),
        division: parseInt(selectedDivisionId),
      };

      await assignClass(payload);
      toast.success("Teacher assigned successfully");

      // Partial reset
      setSelectedTeacherId("");
      setIsClassTeacher(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to assign teacher",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 space-y-4 p-3 sm:p-4 md:p-6 lg:p-8 bg-white min-h-screen overflow-x-hidden">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
            <Backpack className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Teacher Assignments
            </h2>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              Manage academic workloads by mapping teachers to divisions and
              subjects.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={fetchData}
          disabled={isLoading}
          className="border-slate-200"
        >
          <RefreshCw
            className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")}
          />
          Refresh Data
        </Button>
      </div>

      <Separator className="bg-slate-100" />

      {/* ── Error Alert ── */}
      {error && (
        <Alert
          variant="destructive"
          className="border-red-200 bg-red-50 text-red-800"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-bold">Fetch Error</AlertTitle>
          <AlertDescription className="text-sm opacity-90">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* ── Form Card ── */}
      <div className="w-full max-w-2xl mx-auto">
        <Card className="w-full shadow-xl border-slate-200/60 overflow-hidden ring-1 ring-slate-200/50 rounded-2xl">
          <CardHeader className="pb-6 space-y-2 bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-2xl flex items-center gap-3 text-slate-900">
              <UserPlus className="h-7 w-7 text-primary" />
              Assign New Teacher
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Define subject leadership and assign teachers to specific class
              sections.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleAssignTeacher} className="space-y-5">
              {/* ── Row 1: Class & Division + Subject ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Class & Division */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Class &amp; Division
                  </label>
                  <Select
                    value={selectedDivisionId}
                    onValueChange={(val) => {
                      setSelectedDivisionId(val ?? "");
                      setSelectedSubjectId("");
                      setSelectedTeacherId("");
                    }}
                    disabled={isLoading || classDivisionOptions.length === 0}
                  >
                    <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl h-12 shadow-sm focus:ring-primary/20 transition-all">
                      <SelectValue placeholder="Pick Class & Division">
                        {selectedDivisionId
                          ? getClassDivisionLabel(selectedDivisionId)
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                      {classDivisionOptions.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500 italic">
                          No classes found
                        </div>
                      ) : (
                        classDivisionOptions.map((div) => (
                          <SelectItem
                            key={div.id}
                            value={div.id!.toString()}
                            className="rounded-lg my-1"
                          >
                            {div.class_name} - {div.division}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Subject
                  </label>
                  <Select
                    value={selectedSubjectId}
                    onValueChange={(val) => setSelectedSubjectId(val ?? "")}
                    disabled={isLoading || !selectedDivisionId}
                  >
                    <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl h-12 shadow-sm focus:ring-primary/20 transition-all">
                      <SelectValue
                        placeholder={
                          selectedDivisionId
                            ? "Pick Subject"
                            : "Select Class first"
                        }
                      >
                        {selectedSubjectId
                          ? getSubjectLabel(selectedSubjectId)
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                      {relevantSubjects.length > 0 ? (
                        relevantSubjects.map((sub) => (
                          <SelectItem
                            key={sub.id}
                            value={sub.id!.toString()}
                            className="rounded-lg my-1"
                          >
                            {sub.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-slate-500 italic">
                          {selectedDivisionId
                            ? "No subjects for this division"
                            : "Select Class & Division first"}
                        </div>
                      )}
                    </SelectContent>
                  </Select>

                  {/* Hint when no subjects found */}
                  {selectedDivisionId && relevantSubjects.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1 leading-relaxed">
                      No subjects linked to{" "}
                      <span className="font-semibold">
                        {getClassDivisionLabel(selectedDivisionId)}
                      </span>
                      . Add subjects via the Subjects page first.
                    </p>
                  )}
                </div>
              </div>

              {/* ── Row 2: Staff Member (Teacher) — full width ── */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Staff Member (Teacher)
                </label>
                <Select
                  value={selectedTeacherId}
                  onValueChange={(val) => setSelectedTeacherId(val ?? "")}
                  disabled={isLoading || teachers.length === 0}
                >
                  <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl h-12 shadow-sm focus:ring-primary/20 transition-all">
                    <SelectValue placeholder="Pick Teacher">
                      {selectedTeacherId
                        ? getTeacherLabel(selectedTeacherId)
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                    {teachers.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500 italic">
                        No teachers found
                      </div>
                    ) : (
                      teachers.map((t) => (
                        <SelectItem
                          key={t.id}
                          value={t.id.toString()}
                          className="rounded-lg my-1"
                        >
                          {t.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* ── Make Class Teacher — directly below Staff Member ── */}
              <div
                onClick={() => setIsClassTeacher((prev) => !prev)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 cursor-pointer select-none transition-all",
                  isClassTeacher
                    ? "border-primary/40 bg-primary/5"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100",
                )}
              >
                <Checkbox
                  id="is_class_teacher"
                  checked={isClassTeacher}
                  onCheckedChange={(checked) => setIsClassTeacher(!!checked)}
                  className="h-5 w-5 border-slate-300 pointer-events-none"
                />
                <div className="flex-1">
                  <label
                    htmlFor="is_class_teacher"
                    className={cn(
                      "text-sm font-semibold cursor-pointer select-none",
                      isClassTeacher ? "text-primary" : "text-slate-700",
                    )}
                  >
                    Make Class Teacher
                  </label>
                  <p className="text-xs text-slate-400 mt-0.5">
                    This teacher will be assigned as the primary class teacher
                  </p>
                </div>
                {/* Visual indicator */}
                {isClassTeacher && (
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                )}
              </div>

              {/* ── Submit Button ── */}
              <div className="pt-1">
                <Button
                  type="submit"
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold shadow-xl shadow-primary/10 rounded-2xl active:scale-[0.98] transition-all bg-primary hover:bg-primary/90"
                  disabled={
                    isSaving ||
                    !selectedDivisionId ||
                    !selectedSubjectId ||
                    !selectedTeacherId
                  }
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-3 h-6 w-6" />
                      Finalize Assignment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
