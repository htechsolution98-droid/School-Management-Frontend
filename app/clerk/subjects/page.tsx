"use client"

import { useEffect, useState } from "react"
import {
  BookOpen,
  Search,
  Plus,
  Loader2,
  RefreshCw,
  AlertCircle,
  Trash2,
  BookMarked
} from "lucide-react"
import { toast } from "sonner"

import {
  getSchoolClasses,
  getDivisions,
  getSubjects,
  saveSubject,
  deleteSubject,
  type SchoolClass,
  type Division,
  type Subject
} from "@/lib/forms"
import { Badge } from "@/components/ui/badge"
import { SCHOOL_CLASS_OPTIONS } from "@/lib/form-builder-config"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [divisions, setDivisions] = useState<Division[]>([])
  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [subjectName, setSubjectName] = useState("")
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClassId, setSelectedClassId] = useState<string>("")

  const filteredDivisions = divisions.filter(
  (div) => div.SchoolClass.toString() === selectedClassId
)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [classesData, divisionsData, subjectsData] = await Promise.all([
        getSchoolClasses(),
        getDivisions(),
        getSubjects()
      ])

      setSchoolClasses(classesData)
      setDivisions(divisionsData)
      
      const sortedSubjects = subjectsData.sort((a, b) => 
        a.name.localeCompare(b.name, undefined, { numeric: true })
      )
      setSubjects(sortedSubjects)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
      toast.error("Could not load subjects, divisions or classes")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subjectName.trim()) {
      toast.error("Please enter a subject name")
      return
    }

    if (!selectedDivisionId) {
      toast.error("Please select a division")
      return
    }

    setIsSaving(true)
    try {
      const payload: Subject = {
        name: subjectName.trim(),
        division: parseInt(selectedDivisionId)
      }

      await saveSubject(payload)
      toast.success("Subject created successfully")

      // Reset form
      setSubjectName("")
      
      // Refresh list
      await fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create subject")
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return

    setIsDeleting(true)
    try {
      await deleteSubject(deleteTarget.id)
      toast.success("Subject deleted successfully")
      setDeleteTarget(null)
      await fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete subject")
    } finally {
      setIsDeleting(false)
    }
  }

  const getDivisionLabel = (divisionId: number | null) => {
    if (divisionId === null) return "Unknown Division"
    const div = divisions.find(d => d.id === divisionId)
    if (!div) return `Division #${divisionId}`
    
    const cls = schoolClasses.find(c => c.id === div.SchoolClass)
    const classLabel = cls 
      ? (SCHOOL_CLASS_OPTIONS.find(o => o.value === cls.school_class)?.label || cls.school_class) 
      : "Unknown Class"
    
    return `${classLabel} - Div ${div.division}`
  }

  const filteredSubjects = subjects.filter(s => {
    const name = s.name.toLowerCase()
    const divLabel = getDivisionLabel(s.division).toLowerCase()
    const query = searchQuery.toLowerCase()
    return name.includes(query) || divLabel.includes(query)
  })

  // Group divisions by class for the select dropdown
  const sortedDivisionsForSelect = [...divisions].sort((a, b) => {
    const classA = schoolClasses.find(c => c.id === a.SchoolClass)
    const classB = schoolClasses.find(c => c.id === b.SchoolClass)
    const indexA = classA ? SCHOOL_CLASS_OPTIONS.findIndex(opt => opt.value === classA.school_class) : 999
    const indexB = classB ? SCHOOL_CLASS_OPTIONS.findIndex(opt => opt.value === classB.school_class) : 999
    if (indexA !== indexB) return indexA - indexB
    return a.division.localeCompare(b.division, undefined, { numeric: true })
  })

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Subject Management</h2>
          <p className="text-muted-foreground mt-1">
            Assign and manage subjects for each class division.
          </p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
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

      <div className="grid gap-6 md:grid-cols-12 items-start">
        {/* Creation Form */}
        <div className="md:col-span-4">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add New Subject
              </CardTitle>
              <CardDescription>
                Link a subject to a specific division.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSubject} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Subject Name</label>
                  <Input
                    placeholder="e.g. Mathematics, English..."
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="bg-slate-50 border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Division</label>
                  <Select
                    value={selectedDivisionId}
                    onValueChange={(val) => setSelectedDivisionId(val || "")}
                    disabled={isLoading || divisions.length === 0}
                  >
                    <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Select a division">
                        {selectedDivisionId ? getDivisionLabel(parseInt(selectedDivisionId)) : undefined}
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

                <Button
                  type="submit"
                  className="w-full mt-2"
                  disabled={isSaving || !subjectName.trim() || !selectedDivisionId}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Subject"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Subjects List */}
        <div className="md:col-span-8">
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="pb-3 px-6 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Existing Subjects</CardTitle>
                  <CardDescription>
                    All subjects assigned to divisions
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm bg-slate-50 border-slate-200"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <ScrollArea className="h-[400px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-48 py-20 text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary/40" />
                    <p>Loading subjects...</p>
                  </div>
                ) : filteredSubjects.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100 text-slate-600">
                        <tr>
                          <th className="px-6 py-3 text-left font-semibold">Subject</th>
                          <th className="px-6 py-3 text-left font-semibold">Class & Division</th>
                          <th className="px-6 py-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredSubjects.map((subject, index) => (
                          <tr key={subject.id || index} className="hover:bg-primary/5 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                  <BookMarked className="h-4 w-4" />
                                </div>
                                <div className="font-semibold text-slate-900 capitalize">
                                  {subject.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                                {getDivisionLabel(subject.division)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteTarget(subject)}
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
                      <BookOpen className="h-10 w-10 text-slate-200" />
                    </div>
                    <p className="text-sm text-slate-400 max-w-[200px]">
                      {searchQuery ? "No subjects match your search" : "No subjects created yet"}
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Subject</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the subject <span className="font-semibold text-slate-900">{deleteTarget?.name}</span>? This action cannot be undone.
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
                  Deleting...
                </>
              ) : (
                "Delete Subject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
