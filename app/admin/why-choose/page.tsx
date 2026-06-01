"use client";

import { useEffect, useState, useRef } from "react";
import {
  Save,
  Plus,
  Edit2,
  Trash2,
  X,
  Sparkles,
  HelpCircle,
  Database,
  FileText,
  Layout,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  Lightbulb,
  Target,
  TrendingUp,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Mapping names to icons
const getIcon = (name: string, className?: string) => {
  switch (name) {
    case "Lightbulb": return <Lightbulb className={className} />;
    case "Target": return <Target className={className} />;
    case "TrendingUp": return <TrendingUp className={className} />;
    default: return <Sparkles className={className} />;
  }
};

const iconOptions = ["Lightbulb", "Target", "TrendingUp", "Sparkles"];

const colorOptions = [
  { label: "Purple Theme", value: "text-[#5D3FD3]" },
  { label: "Ocean Blue Theme", value: "text-[#285E89]" },
  { label: "Bright Gold Theme", value: "text-[#FFA600]" },
];

export default function WhyChooseUsManager() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [storageMode, setStorageMode] = useState<"mongodb" | "file" | "error">("file");

  // General copywriting states
  const [whyBadge, setWhyBadge] = useState("Why Choose Us?");
  const [whyTitle, setWhyTitle] = useState("VidyaSanchalan is a revolution in education management");
  const [whyTitleHighlight, setWhyTitleHighlight] = useState("revolution");
  const [whyPills, setWhyPills] = useState<string[]>(["100% Free Forever", "Instant Insights", "Limitless Scale"]);

  const [whyImageMain, setWhyImageMain] = useState("/why chooseus.jpeg");
  const [whyImageLeft, setWhyImageLeft] = useState("/why choose us.jpg");
  const [whyImageBottomLeft, setWhyImageBottomLeft] = useState("/progress report.jpeg");
  const [whyImageBottomRight, setWhyImageBottomRight] = useState("/admission (1).jpg");

  const fileInputMainRef = useRef<HTMLInputElement>(null);
  const fileInputLeftRef = useRef<HTMLInputElement>(null);
  const fileInputBottomLeftRef = useRef<HTMLInputElement>(null);
  const fileInputBottomRightRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "main" | "left" | "bottomLeft" | "bottomRight") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (type === "main") setWhyImageMain(base64);
      if (type === "left") setWhyImageLeft(base64);
      if (type === "bottomLeft") setWhyImageBottomLeft(base64);
      if (type === "bottomRight") setWhyImageBottomRight(base64);
      toast.success("Image selected successfully! Remember to save settings below.");
    };
    reader.readAsDataURL(file);
  };

  // Highlight Cards list states (whyChooseUs point highlights)
  const [highlights, setHighlights] = useState<any[]>([]);

  // Dialog States for CRUD
  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [cardTitle, setCardTitle] = useState("");
  const [cardDesc, setCardDesc] = useState("");
  const [cardIcon, setCardIcon] = useState("Lightbulb");
  const [cardColor, setCardColor] = useState("text-[#5D3FD3]");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/landing/settings");
      const data = await res.json();
      if (res.ok && data.success) {
        setStorageMode(data.usingFileStore ? "file" : "mongodb");
        if (data.settings) {
          setWhyBadge(data.settings.whyBadge || "Why Choose Us?");
          setWhyTitle(data.settings.whyTitle || "VidyaSanchalan is a revolution in education management");
          setWhyTitleHighlight(data.settings.whyTitleHighlight || "revolution");
          setWhyPills(data.settings.whyPills && data.settings.whyPills.length > 0 ? data.settings.whyPills : ["100% Free Forever", "Instant Insights", "Limitless Scale"]);
          setWhyImageMain(data.settings.whyImageMain || "/why chooseus.jpeg");
          setWhyImageLeft(data.settings.whyImageLeft || "/why choose us.jpg");
          setWhyImageBottomLeft(data.settings.whyImageBottomLeft || "/progress report.jpeg");
          setWhyImageBottomRight(data.settings.whyImageBottomRight || "/admission (1).jpg");
          setHighlights(data.settings.whyChooseUs || []);
        }
      } else {
        setStorageMode("error");
      }
    } catch {
      setStorageMode("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (storageMode === "error") {
      toast.error("Storage unavailable. Cannot save changes.");
      return;
    }

    const filteredPills = whyPills.filter(p => p.trim() !== "");

    setIsSaving(true);
    try {
      const res = await fetch("/api/landing/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whyBadge,
          whyTitle,
          whyTitleHighlight,
          whyPills: filteredPills,
          whyImageMain,
          whyImageLeft,
          whyImageBottomLeft,
          whyImageBottomRight,
          whyChooseUs: highlights,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("General settings updated successfully!");
        loadSettings();
      } else {
        toast.error(data.message || "Failed to update settings");
      }
    } catch {
      toast.error("Server connection error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePillChange = (idx: number, val: string) => {
    const updated = [...whyPills];
    updated[idx] = val;
    setWhyPills(updated);
  };

  const handleAddPillField = () => {
    setWhyPills([...whyPills, ""]);
  };

  const handleRemovePillField = (idx: number) => {
    if (whyPills.length <= 1) {
      toast.warning("The section requires at least 1 floating capsule pill!");
      return;
    }
    setWhyPills(whyPills.filter((_, i) => i !== idx));
  };

  // CRUD: Open Dialog for New Card
  const handleOpenNew = () => {
    setEditingIndex(null);
    setCardTitle("");
    setCardDesc("");
    setCardIcon("Lightbulb");
    setCardColor("text-[#5D3FD3]");
    setIsOpen(true);
  };

  // CRUD: Open Dialog to Edit Card
  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setCardTitle(highlights[index].title);
    setCardDesc(highlights[index].description);
    setCardIcon(highlights[index].iconName || "Lightbulb");
    setCardColor(highlights[index].color || "text-[#5D3FD3]");
    setIsOpen(true);
  };

  // CRUD: Delete Card
  const handleDeleteCard = async (index: number) => {
    if (!confirm("Delete this highlight benefit point?")) return;

    const updated = highlights.filter((_, i) => i !== index);

    setIsSaving(true);
    try {
      const res = await fetch("/api/landing/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whyBadge,
          whyTitle,
          whyTitleHighlight,
          whyPills,
          whyChooseUs: updated,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Highlight point deleted successfully!");
        setHighlights(updated);
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch {
      toast.error("Server connection error while deleting point");
    } finally {
      setIsSaving(false);
    }
  };

  // CRUD: Submit Create or Update Highlight Card
  const handleSubmitCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardTitle.trim() || !cardDesc.trim()) {
      toast.error("Title and description are required for the highlight card!");
      return;
    }

    let updated = [...highlights];
    const newCard = {
      title: cardTitle,
      description: cardDesc,
      iconName: cardIcon,
      color: cardColor,
    };

    if (editingIndex !== null) {
      updated[editingIndex] = newCard;
    } else {
      updated.push(newCard);
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/landing/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whyBadge,
          whyTitle,
          whyTitleHighlight,
          whyPills,
          whyChooseUs: updated,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingIndex !== null ? "Highlight point updated!" : "Highlight point added!");
        setHighlights(updated);
        setIsOpen(false);
      } else {
        toast.error(data.message || "Failed to save card");
      }
    } catch {
      toast.error("Server connection error while saving card");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">"Why Choose Us" Manager</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure section header titles, dynamic capsule labels, and edit unique highlight benefits cards
          </p>
        </div>
      </div>

      {/* Storage Mode Banner */}
      {storageMode === "mongodb" && (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
          <Database className="h-4 w-4 shrink-0" />
          Connected to MongoDB — changes saved to cloud database.
        </div>
      )}
      {storageMode === "file" && (
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
          <FileText className="h-4 w-4 shrink-0" />
          File Store Mode — saved to <code className="mx-1 bg-amber-100 px-1 rounded">data/landing-content.json</code>.
        </div>
      )}
      {storageMode === "error" && (
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5">
          <HelpCircle className="h-4 w-4 shrink-0" />
          Storage unavailable. Restart the dev server.
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1D496C] border-t-transparent" />
        </div>
      )}

      {!isLoading && (
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: General Copy Settings */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="shadow-sm border border-slate-100 bg-white rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-black text-[#1D496C]">
                  <Layout className="h-5 w-5 text-[#FFA600]" />
                  Main Section Copywriting
                </CardTitle>
                <CardDescription>
                  Configure headers, labels, paragraph text, and motivational callout quote
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveGeneral} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="whyBadge" className="text-xs font-bold text-slate-600">
                      Section Header Badge Text
                    </Label>
                    <Input
                      id="whyBadge"
                      value={whyBadge}
                      onChange={(e) => setWhyBadge(e.target.value)}
                      placeholder="Why Choose Us?"
                      className="rounded-xl border-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="whyTitle" className="text-xs font-bold text-slate-600">
                      Heading Title Copy (Base)
                    </Label>
                    <Input
                      id="whyTitle"
                      value={whyTitle}
                      onChange={(e) => setWhyTitle(e.target.value)}
                      placeholder="e.g. VidyaSanchalan is a revolution in education management"
                      className="rounded-xl border-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="whyTitleHighlight" className="text-xs font-bold text-slate-600">
                      Highlighted Text Segment (Displays in dynamic purple underline)
                    </Label>
                    <Input
                      id="whyTitleHighlight"
                      value={whyTitleHighlight}
                      onChange={(e) => setWhyTitleHighlight(e.target.value)}
                      placeholder="e.g. revolution"
                      className="rounded-xl border-slate-200"
                    />
                  </div>

                  {/* Pills input editor */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <Label className="text-xs font-bold text-slate-600">Floating Capsule Pills</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-[#429CE4] hover:bg-slate-50 font-bold text-xs"
                        onClick={handleAddPillField}
                      >
                        <PlusCircle className="mr-1 h-3.5 w-3.5" /> Add Capsule
                      </Button>
                    </div>
                    <div className="space-y-2.5">
                      {whyPills.map((pill, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <span className="text-xs font-extrabold text-slate-400 w-5">#{idx + 1}</span>
                          <Input
                            value={pill}
                            onChange={(e) => handlePillChange(idx, e.target.value)}
                            placeholder={`Pill text #${idx + 1}`}
                            className="rounded-xl border-slate-200"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="text-rose-500 hover:bg-rose-50 rounded-lg shrink-0 h-9 w-9"
                            onClick={() => handleRemovePillField(idx)}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Collage File Inputs */}
                  <input ref={fileInputMainRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "main")} />
                  <input ref={fileInputLeftRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "left")} />
                  <input ref={fileInputBottomLeftRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "bottomLeft")} />
                  <input ref={fileInputBottomRightRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "bottomRight")} />

                  {/* Collage Images Grid */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="pb-1">
                      <Label className="text-xs font-bold text-slate-600">Collage Graphic Images</Label>
                      <p className="text-[10px] text-slate-400 mt-0.5">Upload custom images for the homepage graphic collage grid</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Main Card */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase">1. Main Center Image</Label>
                        <div className="flex items-center gap-2 border border-slate-100 p-2 rounded-xl bg-slate-50/50">
                          <div className="h-10 w-14 rounded bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 border border-slate-300">
                            {whyImageMain ? <img src={whyImageMain} alt="Main" className="h-full w-full object-cover" /> : <Upload className="h-4 w-4 text-slate-400" />}
                          </div>
                          <Button type="button" size="sm" variant="outline" className="rounded-lg text-xs w-full py-1.5 h-8 font-bold" onClick={() => fileInputMainRef.current?.click()}>
                            Upload
                          </Button>
                        </div>
                      </div>

                      {/* Left Behind Card */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase">2. Behind-Left Image</Label>
                        <div className="flex items-center gap-2 border border-slate-100 p-2 rounded-xl bg-slate-50/50">
                          <div className="h-10 w-14 rounded bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 border border-slate-300">
                            {whyImageLeft ? <img src={whyImageLeft} alt="Left" className="h-full w-full object-cover" /> : <Upload className="h-4 w-4 text-slate-400" />}
                          </div>
                          <Button type="button" size="sm" variant="outline" className="rounded-lg text-xs w-full py-1.5 h-8 font-bold" onClick={() => fileInputLeftRef.current?.click()}>
                            Upload
                          </Button>
                        </div>
                      </div>

                      {/* Bottom-Left Card */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase">3. Bottom-Left Image</Label>
                        <div className="flex items-center gap-2 border border-slate-100 p-2 rounded-xl bg-slate-50/50">
                          <div className="h-10 w-14 rounded bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 border border-slate-300">
                            {whyImageBottomLeft ? <img src={whyImageBottomLeft} alt="Bottom Left" className="h-full w-full object-cover" /> : <Upload className="h-4 w-4 text-slate-400" />}
                          </div>
                          <Button type="button" size="sm" variant="outline" className="rounded-lg text-xs w-full py-1.5 h-8 font-bold" onClick={() => fileInputBottomLeftRef.current?.click()}>
                            Upload
                          </Button>
                        </div>
                      </div>

                      {/* Bottom-Right Card */}
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase">4. Bottom-Right Image</Label>
                        <div className="flex items-center gap-2 border border-slate-100 p-2 rounded-xl bg-slate-50/50">
                          <div className="h-10 w-14 rounded bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 border border-slate-300">
                            {whyImageBottomRight ? <img src={whyImageBottomRight} alt="Bottom Right" className="h-full w-full object-cover" /> : <Upload className="h-4 w-4 text-slate-400" />}
                          </div>
                          <Button type="button" size="sm" variant="outline" className="rounded-lg text-xs w-full py-1.5 h-8 font-bold" onClick={() => fileInputBottomRightRef.current?.click()}>
                            Upload
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <Button
                      type="submit"
                      disabled={isSaving || storageMode === "error"}
                      className="bg-[#429CE4] text-white hover:bg-[#1D496C] font-bold rounded-xl px-6 py-5 shadow-lg shadow-[#429CE4]/10"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Copy Settings"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Highlights CRUD Grid */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="shadow-sm border border-slate-100 bg-white rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg font-black text-[#1D496C]">
                    <Sparkles className="h-5 w-5 text-[#FFA600]" />
                    Benefit Highlight Points (CRUD)
                  </CardTitle>
                  <CardDescription>Configure distinct benefit lists shown on the right card</CardDescription>
                </div>
                <Button
                  onClick={handleOpenNew}
                  size="sm"
                  className="bg-[#429CE4] text-white hover:bg-[#1D496C] font-bold rounded-lg shadow-sm"
                >
                  <Plus className="mr-1 h-3 w-3 stroke-[3]" /> Add Point
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {highlights.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border-dashed border-2 border-slate-100 rounded-2xl bg-slate-50/30">
                    <Sparkles className="h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-500">No highlights defined</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Click Add Point to populate list</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {highlights.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between border border-slate-100 p-4 rounded-xl bg-white shadow-sm hover:shadow transition-shadow gap-4 animate-fadeIn"
                      >
                        <div className="flex gap-3">
                          <div className={`h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 ${item.color || "text-[#5D3FD3]"}`}>
                            {getIcon(item.iconName || "Lightbulb", "h-4 w-4")}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-[#1D496C] text-sm">{item.title}</h4>
                            <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-lg"
                            onClick={() => handleOpenEdit(index)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-rose-600 hover:bg-rose-50 rounded-lg"
                            onClick={() => handleDeleteCard(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Live Preview Capsule tags */}
                <div className="border border-slate-100 rounded-xl bg-slate-50/50 p-4 shadow-inner relative overflow-hidden mt-6">
                  <div className="flex items-center gap-2 mb-3 text-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-500 font-bold tracking-wider uppercase text-[9px]">Floating Pills Preview</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {whyPills.map((pill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-[#5D3FD3] text-white text-[9px] font-black tracking-wide"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* CRUD Dialog: Add / Edit Highlight Card Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-900 rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="mb-6">
              <h3 className="text-lg font-black text-slate-800">
                {editingIndex !== null ? "Edit Benefit Point" : "Add Benefit Point"}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure highlight bullet name, description, Lucide icon, and color theme
              </p>
            </div>

            <form onSubmit={handleSubmitCard} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cardTitle" className="text-sm font-bold text-slate-600">
                  Point Title
                </Label>
                <Input
                  id="cardTitle"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  placeholder="e.g. Innovation at our core"
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cardDesc" className="text-sm font-bold text-slate-600">
                  Description copy
                </Label>
                <Textarea
                  id="cardDesc"
                  rows={3}
                  value={cardDesc}
                  onChange={(e) => setCardDesc(e.target.value)}
                  placeholder="e.g. VidyaSanchalan stands as the vanguard..."
                  className="rounded-xl border-slate-200 text-sm leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Icon option selection */}
                <div className="space-y-1.5">
                  <Label htmlFor="cardIcon" className="text-sm font-bold text-slate-600">Lucide Icon</Label>
                  <select
                    id="cardIcon"
                    value={cardIcon}
                    onChange={(e) => setCardIcon(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-[#429CE4] focus:ring-1 focus:ring-[#429CE4]"
                  >
                    {iconOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Color theme selection */}
                <div className="space-y-1.5">
                  <Label htmlFor="cardColor" className="text-sm font-bold text-slate-600">Color Theme</Label>
                  <select
                    id="cardColor"
                    value={cardColor}
                    onChange={(e) => setCardColor(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-[#429CE4] focus:ring-1 focus:ring-[#429CE4]"
                  >
                    {colorOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#429CE4] text-white hover:bg-[#1D496C] font-bold rounded-xl"
                >
                  {isSaving ? "Saving..." : editingIndex !== null ? "Update Benefit" : "Add Benefit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
