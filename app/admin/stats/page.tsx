"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Shield,
  Bell,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Star,
  TrendingUp,
  Award,
  Heart,
  Rocket,
  DollarSign,
  BookMarked,
  Lightbulb,
  Target,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  HelpCircle,
  Database,
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Mapping names to Lucide icons dynamically
const getIcon = (name: string, className?: string) => {
  switch (name) {
    case "GraduationCap": return <GraduationCap className={className} />;
    case "Users": return <Users className={className} />;
    case "BookOpen": return <BookOpen className={className} />;
    case "Calendar": return <Calendar className={className} />;
    case "Shield": return <Shield className={className} />;
    case "Bell": return <Bell className={className} />;
    case "CreditCard": return <CreditCard className={className} />;
    case "ArrowRight": return <ArrowRight className={className} />;
    case "CheckCircle2": return <CheckCircle2 className={className} />;
    case "ChevronDown": return <ChevronDown className={className} />;
    case "Sparkles": return <Sparkles className={className} />;
    case "Star": return <Star className={className} />;
    case "TrendingUp": return <TrendingUp className={className} />;
    case "Award": return <Award className={className} />;
    case "Heart": return <Heart className={className} />;
    case "Rocket": return <Rocket className={className} />;
    case "DollarSign": return <DollarSign className={className} />;
    case "BookMarked": return <BookMarked className={className} />;
    case "Lightbulb": return <Lightbulb className={className} />;
    case "Target": return <Target className={className} />;
    default: return <Sparkles className={className} />;
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
  "Heart",
  "Star",
  "Rocket",
  "DollarSign",
  "BookMarked",
  "Lightbulb",
  "Target",
  "Sparkles"
];

interface StatItem {
  label: string;
  target: number;
  suffix: string;
  iconName: string;
}

export default function StatsManager() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [storageMode, setStorageMode] = useState<"mongodb" | "file" | "error">("file");

  // General details from response to preserve full update payload
  const [fullSettings, setFullSettings] = useState<any>({});

  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form states
  const [label, setLabel] = useState("");
  const [target, setTarget] = useState(10);
  const [suffix, setSuffix] = useState("+");
  const [iconName, setIconName] = useState("GraduationCap");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/landing/settings");
      const data = await res.json();
      if (res.ok && data.success && data.settings) {
        setStats(data.settings.stats || []);
        setFullSettings(data.settings);
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

  const handleOpenNew = () => {
    setEditingIndex(null);
    setLabel("");
    setTarget(10);
    setSuffix("+");
    setIconName("GraduationCap");
    setIsOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    const item = stats[index];
    setEditingIndex(index);
    setLabel(item.label);
    setTarget(item.target);
    setSuffix(item.suffix || "+");
    setIconName(item.iconName || "GraduationCap");
    setIsOpen(true);
  };

  const handleDelete = async (index: number) => {
    if (!confirm("Are you sure you want to delete this statistics counter?")) return;

    const updated = stats.filter((_, idx) => idx !== index);
    await saveStatsPayload(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!label.trim()) {
      toast.error("Label title is required!");
      return;
    }
    if (target < 0) {
      toast.error("Target count must be a non-negative number!");
      return;
    }

    const newItem: StatItem = {
      label,
      target: Number(target),
      suffix: suffix.trim(),
      iconName
    };

    let updated = [...stats];
    if (editingIndex !== null) {
      updated[editingIndex] = newItem;
    } else {
      updated.push(newItem);
    }

    await saveStatsPayload(updated);
  };

  const saveStatsPayload = async (updatedStatsList: StatItem[]) => {
    setIsSaving(true);
    try {
      const payload = {
        ...fullSettings,
        stats: updatedStatsList
      };

      const res = await fetch("/api/landing/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(editingIndex !== null ? "Counter statistic updated successfully!" : "New counter statistic added successfully!");
        setStats(updatedStatsList);
        setIsOpen(false);
        // Refresh settings state
        if (data.settings) setFullSettings(data.settings);
      } else {
        toast.error(data.message || "Failed to update statistics list");
      }
    } catch {
      toast.error("Server synchronization layer offline");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Counters & Statistics Manager</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure dynamic institutional figures and targets displayed in the homepage highlights section
          </p>
        </div>
      </div>

      {/* Storage Mode Banner */}
      {storageMode === "mongodb" && (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
          <Database className="h-4 w-4 shrink-0" /> Connected to MongoDB — changes saved to cloud database.
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

      {/* Loader */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1D496C] border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="shadow-md bg-white border border-slate-100 rounded-2xl">
            <CardHeader className="border-b border-slate-50 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-[#1D496C] flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#FFA600]" /> Dynamic Counter Elements
                </CardTitle>
                <CardDescription className="text-xs mt-1">Configured counters displayed under the "Why Choose Us" section</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={handleOpenNew}
                disabled={storageMode === "error"}
                className="bg-[#429CE4] text-white hover:bg-[#1D496C] font-extrabold rounded-lg h-9 shadow-sm"
              >
                <Plus className="h-4 w-4 mr-1 stroke-[3]" /> Add Counter Stat
              </Button>
            </CardHeader>
            <CardContent className="py-6">
              {stats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border-dashed border-2 border-slate-100 rounded-2xl bg-slate-50/30">
                  <TrendingUp className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-500">No counters defined</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Click Add Counter Stat to populate the landing section</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col justify-between border border-slate-100 p-5 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#1D496C]/5 rounded-full translate-x-8 -translate-y-8 pointer-events-none group-hover:scale-110 transition-transform"></div>
                      
                      <div className="space-y-3">
                        <div className="h-10 w-10 rounded-xl bg-[#1D496C] text-white flex items-center justify-center shrink-0">
                          {getIcon(item.iconName || "GraduationCap", "h-5.5 w-5.5")}
                        </div>
                        <div>
                          <div className="text-2xl font-black text-[#1D496C] tracking-tight">
                            {item.target}{item.suffix || "+"}
                          </div>
                          <p className="text-xs font-bold text-slate-500 mt-0.5">{item.label}</p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-1.5 pt-4 border-t border-slate-50 mt-4">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-500 hover:bg-slate-50 rounded-lg"
                          onClick={() => handleOpenEdit(idx)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg"
                          onClick={() => handleDelete(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Live Preview section */}
              <div className="border border-slate-100 rounded-2xl bg-slate-900 text-white p-6 shadow-inner relative overflow-hidden mt-8">
                <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>
                <div className="flex items-center gap-2 mb-4 text-xs relative z-10">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-slate-400 font-bold tracking-wider uppercase text-[9px]">Live Homepage Counter Preview</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center relative z-10">
                  {stats.map((stat, i) => (
                    <div key={i} className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
                      <div className="text-white/60">
                        {getIcon(stat.iconName, "h-5 w-5 mx-auto")}
                      </div>
                      <div className="text-xl font-black text-[#FFA600] tracking-tight">
                        {stat.target}{stat.suffix}
                      </div>
                      <div className="text-[10px] font-bold text-white/80 uppercase tracking-wide">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CRUD Modal Form Dialog */}
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
                {editingIndex !== null ? "Edit Counter Stat" : "Add Counter Stat"}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Configure figure labels, counter targets, suffix details, and matching Lucide icons</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="label" className="text-sm font-bold text-slate-600">Stat Label Name</Label>
                <Input
                  id="label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Schools, Students, Teachers"
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="target" className="text-sm font-bold text-slate-600">Target Value</Label>
                  <Input
                    id="target"
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(Number(e.target.value))}
                    placeholder="e.g. 500"
                    className="rounded-xl border-slate-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="suffix" className="text-sm font-bold text-slate-600">Suffix Text</Label>
                  <Input
                    id="suffix"
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                    placeholder="e.g. +, K+"
                    className="rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="iconSelect" className="text-sm font-bold text-slate-600">Lucide Icon Selector</Label>
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
                  disabled={isSaving}
                  className="bg-[#429CE4] text-white hover:bg-[#1D496C] font-bold rounded-xl"
                >
                  <Save className="mr-1.5 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Counter"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
