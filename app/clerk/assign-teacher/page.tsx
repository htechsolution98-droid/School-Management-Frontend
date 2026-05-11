"use client";

import { useEffect, useState } from "react";
import {
  UserPlus,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Users,
  Backpack,
} from "lucide-react";
import { toast } from "sonner";

import {
  getDivisions,
  getSubjects,
  getTeachers,
  assignClass,
  type Division,
  type Subject,
  type Teacher,
  type AssignClassPayload,
} from "@/lib/forms";
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
  const [selectedClassName, setSelectedClassName] = useState<string>("");
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [isClassTeacher, setIsClassTeacher] = useState(false);

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

  // Derived: Unique Class Names and IDs from Divisions
  const classes = Array.from(
    divisions.reduce((acc, current) => {
      if (
        current.SchoolClass &&
        current.class_name &&
        !acc.has(current.SchoolClass)
      ) {
        acc.set(current.SchoolClass, current.class_name);
      }
      return acc;
    }, new Map<number, string>()),
  )
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  // Derived: Divisions for selected class (using class name for display/lookup)
  const filteredDivisions = divisions.filter(
    (d) => d.SchoolClass.toString() === selectedClassName,
  );

  // Derived: Subjects for selected division
  const relevantSubjects = subjects.filter(
    (s) => s.division === parseInt(selectedDivisionId),
  );

  // Label Helpers to fix ID display issue
  const getDivisionLabel = (id: string) => {
    const div = divisions.find((d) => d.id?.toString() === id);
    return div ? `Division ${div.division}` : "";
  };

  const getSubjectLabel = (id: string) => {
    const sub = subjects.find((s) => s.id?.toString() === id);
    return sub ? sub.name : "";
  };

  const getTeacherLabel = (id: string) => {
    const t = teachers.find((t) => t.id.toString() === id);
    return t ? t.name : "";
  };

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

      // Partial Reset
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

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
            <Backpack className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
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

      <div className="max-w-2xl mx-auto">
        <Card className="shadow-2xl border-slate-200/60 overflow-hidden ring-1 ring-slate-200/50">
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
          <CardContent className="pt-1">
            <form onSubmit={handleAssignTeacher} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Class Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    School Class
                  </label>
                  <Select
                    value={selectedClassName}
                    onValueChange={(val) => {
                      setSelectedClassName(val ?? "");
                      setSelectedDivisionId("");
                      setSelectedSubjectId("");
                    }}
                    disabled={isLoading || classes.length === 0}
                  >
                    <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl h-12 shadow-sm focus:ring-primary/20 transition-all">
                      <SelectValue placeholder="Pick a Class">
                        {classes.find(
                          (c) => c.id.toString() === selectedClassName,
                        )?.name || undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                      {classes.map((cls) => (
                        <SelectItem
                          key={cls.id}
                          value={cls.id.toString()}
                          className="rounded-lg my-1"
                        >
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Division Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Division
                  </label>
                  <Select
                    value={selectedDivisionId}
                    onValueChange={(val) => {
                      setSelectedDivisionId(val ?? "");
                      setSelectedSubjectId("");
                    }}
                    disabled={isLoading || !selectedClassName}
                  >
                    <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl h-12 shadow-sm focus:ring-primary/20 transition-all">
                      <SelectValue
                        placeholder={
                          selectedClassName
                            ? "Pick Division"
                            : "Select Class first"
                        }
                      >
                        {selectedDivisionId
                          ? getDivisionLabel(selectedDivisionId)
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                      {filteredDivisions.map((div) => (
                        <SelectItem
                          key={div.id}
                          value={div.id!.toString()}
                          className="rounded-lg my-1"
                        >
                          Division {div.division}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Subject Selection */}
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
                            : "Select Division first"
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
                        <div className="p-4 text-center text-sm text-slate-500 font-medium italic">
                          No subjects available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Teacher Selection */}
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
                      {teachers.map((t) => (
                        <SelectItem
                          key={t.id}
                          value={t.id.toString()}
                          className="rounded-lg my-1"
                        >
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Class Teacher Checkbox */}
              <div className="flex items-center space-x-2 px-1 py-2">
                <Checkbox
                  id="is_class_teacher"
                  checked={isClassTeacher}
                  onCheckedChange={(checked) => setIsClassTeacher(!!checked)}
                  className="h-5 w-5 border-slate-300"
                />
                <label
                  htmlFor="is_class_teacher"
                  className="text-sm font-semibold text-slate-700 cursor-pointer select-none"
                >
                  Make Class Teacher
                </label>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/10 rounded-2xl active:scale-[0.98] transition-all bg-primary hover:bg-primary/90"
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
