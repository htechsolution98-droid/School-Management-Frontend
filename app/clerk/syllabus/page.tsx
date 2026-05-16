"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Search,
  Plus,
  Loader2,
  RefreshCw,
  AlertCircle,
  Trash2,
  FileDown,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  getClasses,
  getDivisions,
  getSubjects,
  getSyllabusList,
  saveSyllabus,
  deleteSyllabus,
  type SchoolClass,
  type Division,
  type Subject,
  type Syllabus,
} from "@/lib/forms";
import { Badge } from "@/components/ui/badge";
import { SCHOOL_CLASS_OPTIONS } from "@/lib/form-builder-config";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SyllabusPage() {
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Syllabus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [classesData, divisionsData, subjectsData, syllabusData] =
        await Promise.all([
          getClasses(),
          getDivisions(),
          getSubjects(),
          getSyllabusList(),
        ]);

      setSchoolClasses(classesData);
      setDivisions(divisionsData);
      setSubjects(subjectsData);
      setSyllabuses(syllabusData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      toast.error("Could not load syllabus records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAddSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDivisionId) {
      toast.error("Please select a division");
      return;
    }

    if (!selectedSubjectId) {
      toast.error("Please select a subject");
      return;
    }

    if (!selectedFile) {
      toast.error("Please select a syllabus file");
      return;
    }

    setIsSaving(true);
    try {
      const payload: Syllabus = {
        syllabus_file: selectedFile,
        division: parseInt(selectedDivisionId),
        subject: parseInt(selectedSubjectId),
      };

      await saveSyllabus(payload);
      toast.success("Syllabus uploaded successfully");

      // Reset form
      setSelectedFile(null);
      setSelectedSubjectId("");

      // Refresh list
      await fetchData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload syllabus",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;

    setIsDeleting(true);
    try {
      await deleteSyllabus(deleteTarget.id);
      toast.success("Syllabus record deleted");
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete syllabus",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const getDivisionLabel = (divisionId: number | null) => {
    if (divisionId === null) return "Unknown Division";
    const div = divisions.find((d) => d.id === divisionId);
    if (!div) return `Division #${divisionId}`;

    const cls = schoolClasses.find((c) => c.id === div.SchoolClass);
    const classLabel = cls
      ? SCHOOL_CLASS_OPTIONS.find((o) => o.value === cls.school_class)?.label ||
        cls.school_class
      : "Unknown Class";

    return `${classLabel} - Div ${div.division}`;
  };

  const getSubjectLabel = (subjectId: number | null) => {
    if (subjectId === null) return "Unknown Subject";
    const sub = subjects.find((s) => s.id === subjectId);
    return sub ? sub.name : `Subject #${subjectId}`;
  };

  const filteredSyllabuses = syllabuses.filter((s) => {
    const subName = getSubjectLabel(s.subject).toLowerCase();
    const divLabel = getDivisionLabel(s.division).toLowerCase();
    const query = searchQuery.toLowerCase();
    return subName.includes(query) || divLabel.includes(query);
  });

  // Filter subjects based on the selected division
  const relevantSubjects = subjects.filter(
    (s) => !selectedDivisionId || s.division === parseInt(selectedDivisionId),
  );

  const sortedDivisionsForSelect = [...divisions].sort((a, b) => {
    const classA = schoolClasses.find((c) => c.id === a.SchoolClass);
    const classB = schoolClasses.find((c) => c.id === b.SchoolClass);
    const indexA = classA
      ? SCHOOL_CLASS_OPTIONS.findIndex(
          (opt) => opt.value === classA.school_class,
        )
      : 999;
    const indexB = classB
      ? SCHOOL_CLASS_OPTIONS.findIndex(
          (opt) => opt.value === classB.school_class,
        )
      : 999;
    if (indexA !== indexB) return indexA - indexB;
    return a.division.localeCompare(b.division, undefined, { numeric: true });
  });

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white min-h-screen overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
            Syllabus Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Upload and organize curriculum documents for each subject.
          </p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={isLoading}>
          <RefreshCw
            className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      <Separator />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Upload Form */}
        <div className="xl:col-span-4">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-primary" />
                Upload Syllabus
              </CardTitle>
              <CardDescription>
                Select a division and subject to attach a file.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <form onSubmit={handleAddSyllabus} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Division
                  </label>
                  <Select
                    value={selectedDivisionId}
                    onValueChange={(val) => {
                      setSelectedDivisionId(val || "");
                      setSelectedSubjectId(""); // Reset subject when division changes
                    }}
                    disabled={isLoading || divisions.length === 0}
                  >
                    <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Select a division">
                        {selectedDivisionId
                          ? getDivisionLabel(parseInt(selectedDivisionId))
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {sortedDivisionsForSelect.map((div) => (
                        <SelectItem key={div.id} value={div.id!.toString()}>
                          {getDivisionLabel(div.id!)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Subject
                  </label>
                  <Select
                    value={selectedSubjectId}
                    onValueChange={(val) => setSelectedSubjectId(val || "")}
                    disabled={
                      isLoading ||
                      !selectedDivisionId ||
                      relevantSubjects.length === 0
                    }
                  >
                    <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                      <SelectValue
                        placeholder={
                          selectedDivisionId
                            ? "Select a subject"
                            : "Select division first"
                        }
                      >
                        {selectedSubjectId
                          ? getSubjectLabel(parseInt(selectedSubjectId))
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {relevantSubjects.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id!.toString()}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Syllabus File
                  </label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-xl p-4 transition-colors text-center cursor-pointer",
                      selectedFile
                        ? "border-primary/50 bg-primary/5"
                        : "border-slate-200 hover:border-primary/30",
                    )}
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.png"
                    />
                    {selectedFile ? (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-2">
                        <div className="flex items-center gap-2 overflow-hidden w-full">
                          <FileText className="h-5 w-5 text-primary shrink-0" />
                          <span className="text-sm font-medium truncate text-slate-700">
                            {selectedFile.name}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-slate-400 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="py-2">
                        <FileDown className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">
                          Click to browse or drag & drop
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          PDF, DOC, PNG, JPG (Max 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-2"
                  disabled={
                    isSaving ||
                    !selectedDivisionId ||
                    !selectedSubjectId ||
                    !selectedFile
                  }
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload record"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Syllabus List */}
        <div className="xl:col-span-8">
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="pb-3 px-6 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Syllabus Directory</CardTitle>
                  <CardDescription>
                    Browse curriculum files by class and subject
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search file directory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm bg-slate-50 border-slate-200"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <ScrollArea className="h-[450px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-48 py-20 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary/40" />
                    <p>Loading directory...</p>
                  </div>
                ) : filteredSyllabuses.length > 0 ? (
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm">
                      <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100 text-slate-600">
                        <tr>
                          <th className="px-6 py-3 text-left font-semibold">
                            Subject
                          </th>
                          <th className="px-6 py-3 text-left font-semibold">
                            Division
                          </th>
                          <th className="px-6 py-3 text-left font-semibold">
                            File
                          </th>
                          <th className="px-6 py-3 text-right font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredSyllabuses.map((item, index) => (
                          <tr
                            key={item.id || index}
                            className="hover:bg-primary/5 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-900 capitalize">
                                {getSubjectLabel(item.subject)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant="outline"
                                className="bg-slate-50 text-slate-600 border-slate-200 whitespace-nowrap"
                              >
                                {getDivisionLabel(item.division)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              {item.syllabus_file &&
                              typeof item.syllabus_file === "string" ? (
                                <a
                                  href={item.syllabus_file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-primary hover:underline font-medium"
                                >
                                  <FileText className="h-4 w-4" />
                                  <span>View Document</span>
                                </a>
                              ) : (
                                <span className="text-slate-400 italic">
                                  No file attached
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteTarget(item)}
                                className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="bg-slate-50 p-4 rounded-full mb-4">
                      <FileText className="h-10 w-10 text-slate-200" />
                    </div>
                    <p className="text-sm text-slate-400 max-w-[200px]">
                      {searchQuery
                        ? "No matching records found"
                        : "No syllabus files uploaded yet"}
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="w-[95vw] sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Remove Syllabus</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove the syllabus for{" "}
              <span className="font-semibold text-slate-900">
                {deleteTarget ? getSubjectLabel(deleteTarget.subject) : ""}
              </span>
              ? This file will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Delete Record"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
