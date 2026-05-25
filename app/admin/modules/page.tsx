"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap,
  Users,
  CreditCard,
  Calendar,
  BookOpen,
  TrendingUp,
  Bell,
  Shield,
  Award,
  DollarSign,
  Star,
  CheckCircle2,
  Rocket,
  Heart,
  Sparkles,
  BookMarked,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Layers,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Database, FileText } from "lucide-react";

// Mapping names to icons
const getIcon = (name: string, className?: string) => {
  switch (name) {
    case "GraduationCap": return <GraduationCap className={className} />;
    case "Users": return <Users className={className} />;
    case "BookOpen": return <BookOpen className={className} />;
    case "Calendar": return <Calendar className={className} />;
    case "Shield": return <Shield className={className} />;
    case "Bell": return <Bell className={className} />;
    case "CreditCard": return <CreditCard className={className} />;
    case "TrendingUp": return <TrendingUp className={className} />;
    case "Award": return <Award className={className} />;
    case "DollarSign": return <DollarSign className={className} />;
    case "Star": return <Star className={className} />;
    case "CheckCircle2": return <CheckCircle2 className={className} />;
    case "Rocket": return <Rocket className={className} />;
    case "Heart": return <Heart className={className} />;
    case "Sparkles": return <Sparkles className={className} />;
    case "BookMarked": return <BookMarked className={className} />;
    default: return <HelpCircle className={className} />;
  }
};

const iconOptions = [
  "GraduationCap",
  "Users",
  "BookOpen",
  "Calendar",
  "Shield",
  "Bell",
  "CreditCard",
  "TrendingUp",
  "Award",
  "DollarSign",
  "Star",
  "CheckCircle2",
  "Rocket",
  "Heart",
  "Sparkles",
  "BookMarked"
];

export default function ModulesManager() {
  const [modules, setModules] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageMode, setStorageMode] = useState<"mongodb" | "file" | "error">("file");

  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<"module" | "badge">("module");

  // Form inputs
  const [label, setLabel] = useState("");
  const [iconName, setIconName] = useState("GraduationCap");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadModulesAndBadges();
  }, []);

  const loadModulesAndBadges = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/landing/modules");
      const data = await res.json();
      if (res.ok && data.success) {
        setModules(data.modules || []);
        setBadges(data.badges || []);
        setStorageMode(data.usingFileStore ? "file" : "mongodb");
      } else {
        setStorageMode("error");
      }
    } catch {
      setStorageMode("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenNew = (selectedType: "module" | "badge") => {
    setEditingId(null);
    setType(selectedType);
    setLabel("");
    setIconName(selectedType === "module" ? "GraduationCap" : "Star");
    setIsOpen(true);
  };

  const handleOpenEdit = (item: any, selectedType: "module" | "badge") => {
    setEditingId(item._id);
    setType(selectedType);
    setLabel(item.label);
    setIconName(item.iconName);
    setIsOpen(true);
  };

  const handleDelete = async (id: string, selectedType: "module" | "badge") => {
    const itemLabel = selectedType === "module" ? "ERP showcase module" : "security/trust badge";
    if (!confirm(`Are you sure you want to delete this ${itemLabel} from the scroll list?`)) return;

    try {
      const res = await fetch(`/api/landing/modules?id=${id}&type=${selectedType}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`Removed successfully!`);
        loadModulesAndBadges();
      } else {
        toast.error(data.message || "Deletion failed");
      }
    } catch (err) {
      toast.error("Server connection error during request execution");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!label.trim()) {
      toast.error("Label text is required!");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = "/api/landing/modules";
      const method = editingId ? "PUT" : "POST";
      const payload = {
        label,
        iconName,
        type,
        ...(editingId && { _id: editingId })
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? "Dynamic scrolling item updated!" : "New scrolling item added!");
        setIsOpen(false);
        loadModulesAndBadges();
      } else {
        toast.error(data.message || "Failed to save item");
      }
    } catch (err) {
      toast.error("Database sync layer offline");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Horizontal Scrolling Showcase</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage the dual infinite sliding bars displayed on the homepage marquee</p>
      </div>

      {storageMode === "mongodb" && (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
          <Database className="h-4 w-4 shrink-0" /> Connected to MongoDB — changes saved to cloud.
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
          <HelpCircle className="h-4 w-4 shrink-0" /> Storage unavailable. Restart the dev server.
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1D496C] border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {/* Showcase Modules */}
          <Card className="shadow-md bg-white border border-slate-100 rounded-2xl flex flex-col justify-between">
            <CardHeader className="border-b border-slate-50 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-[#1D496C] flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#429CE4]" /> Showcase Modules
                </CardTitle>
                <CardDescription className="text-xs mt-1">Scrolling list (Right-to-Left, blue background tags)</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => handleOpenNew("module")}
                disabled={storageMode === "error"}
                className="bg-[#429CE4]/10 hover:bg-[#429CE4] text-[#429CE4] hover:text-white font-extrabold rounded-lg h-8 text-xs border border-transparent"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" /> Add
              </Button>
            </CardHeader>
            <CardContent className="py-4 space-y-3 flex-1">
              {modules.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="flex items-center justify-between bg-[#429CE4]/5 border border-slate-100/60 rounded-xl p-3 shadow-inner group hover:bg-[#429CE4]/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#429CE4] text-white flex items-center justify-center shrink-0">
                      {getIcon(item.iconName, "h-4.5 w-4.5")}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#1D496C]">{item.label}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 rounded-md" onClick={() => handleOpenEdit(item, "module")}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-500 hover:bg-rose-50 rounded-md" onClick={() => handleDelete(item._id, "module")}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Trust Badges */}
          <Card className="shadow-md bg-white border border-slate-100 rounded-2xl flex flex-col justify-between">
            <CardHeader className="border-b border-slate-50 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-[#1D496C] flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#6A7626]" /> Trust & Security Badges
                </CardTitle>
                <CardDescription className="text-xs mt-1">Scrolling list (Left-to-Right, green credentials)</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => handleOpenNew("badge")}
                disabled={storageMode === "error"}
                className="bg-[#6A7626]/10 hover:bg-[#6A7626] text-[#6A7626] hover:text-white font-extrabold rounded-lg h-8 text-xs border border-transparent"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" /> Add
              </Button>
            </CardHeader>
            <CardContent className="py-4 space-y-3 flex-1">
              {badges.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="flex items-center justify-between bg-[#6A7626]/5 border border-slate-100/60 rounded-xl p-3 shadow-inner group hover:bg-[#6A7626]/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#6A7626] text-white flex items-center justify-center shrink-0">
                      {getIcon(item.iconName, "h-4.5 w-4.5")}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#475569]">{item.label}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-500 rounded-md" onClick={() => handleOpenEdit(item, "badge")}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-500 hover:bg-rose-50 rounded-md" onClick={() => handleDelete(item._id, "badge")}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modules/Badges Custom Dialog Form */}
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
                {editingId ? "Modify scrolling item" : `Add new ${type === "module" ? "showcase module" : "trust badge"}`}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Configure scrolling title copy and icons classification</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="label" className="text-sm font-bold text-slate-600">Label / Name</Label>
                <Input
                  id="label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={type === "module" ? "e.g. Smart Fee Collection" : "e.g. ISO 27001 Secure Data"}
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="iconSelect" className="text-sm font-bold text-slate-600">Icon Selector</Label>
                <select
                  id="iconSelect"
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-[#429CE4] focus:ring-1 focus:ring-[#429CE4]"
                >
                  {iconOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#429CE4] text-white hover:bg-[#1D496C] font-bold rounded-xl"
                >
                  <Save className="mr-1.5 h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Item"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
