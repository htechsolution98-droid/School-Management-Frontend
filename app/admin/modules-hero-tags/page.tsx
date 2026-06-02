"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  RefreshCw,
  Database,
  CheckCircle2,
  Pencil,
  X,
  RotateCcw,
  GripVertical,
  Check,
  ImageIcon,
  Upload,
  Monitor,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const DEFAULT_TAGS = [
  "Admission Management",
  "Fee Management",
  "Attendance & Geo mapping",
  "Homework & Assignments",
  "Timetable Management",
  "Online Examination",
  "Progress Reports",
  "Parent & Student Panels",
];

const DEFAULT_IMAGE = "/moduleg.jpeg";

export default function ModulesHeroTagsPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Multiple Mockup Images state
  const [moduleScreens, setModuleScreens] = useState<string[]>([DEFAULT_IMAGE]);
  const [heroImage, setHeroImage] = useState(DEFAULT_IMAGE); // Reference fallback
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    if (editingIdx !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingIdx]);

  // Autoplay mockup slideshow in the admin live preview
  useEffect(() => {
    if (moduleScreens.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % moduleScreens.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [moduleScreens]);

  const loadTags = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/landing/settings?t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setIsDbConnected(true);
        const loaded = data.settings?.modulesHeroTags;
        setTags(Array.isArray(loaded) && loaded.length > 0 ? loaded : DEFAULT_TAGS);

        const img = data.settings?.modulesHeroImage || DEFAULT_IMAGE;
        setHeroImage(img);

        const screens = data.settings?.moduleScreens;
        if (Array.isArray(screens) && screens.length > 0) {
          setModuleScreens(screens);
        } else {
          setModuleScreens([img]);
        }
        setCurrentSlideIndex(0);
      } else {
        setIsDbConnected(false);
        setTags(DEFAULT_TAGS);
        setModuleScreens([DEFAULT_IMAGE]);
      }
    } catch {
      setIsDbConnected(false);
      setTags(DEFAULT_TAGS);
      setModuleScreens([DEFAULT_IMAGE]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Multiple Image Upload ─────────────────────────────────────────────────
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    const uploadedUrls: string[] = [];

    setIsUploadingImage(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!allowedTypes.includes(file.type)) {
          toast.error(`Invalid type for ${file.name}. Use JPG, PNG, WebP, or GIF.`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Max 5MB.`);
          continue;
        }

        const form = new FormData();
        form.append("file", file);
        form.append("context", "modules-hero");

        const res = await fetch("/api/landing/upload", { method: "POST", body: form });
        const data = await res.json();

        if (data.success) {
          uploadedUrls.push(data.url);
        } else {
          toast.error(data.message || `Upload failed for ${file.name}`);
        }
      }

      if (uploadedUrls.length > 0) {
        setModuleScreens((prev) => {
          // If first item is the default placeholder and we upload a new one, replace it
          const filterDefault = prev.length === 1 && prev[0] === DEFAULT_IMAGE ? [] : prev;
          const updated = [...filterDefault, ...uploadedUrls];
          setCurrentSlideIndex(updated.length - uploadedUrls.length);
          return updated;
        });
        toast.success(`Uploaded ${uploadedUrls.length} mockup image(s). Click Save to persist.`);
      }
    } catch {
      toast.error("Upload error. Please try again.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImageIndex = (idxToRemove: number) => {
    if (moduleScreens.length <= 1) {
      setModuleScreens([DEFAULT_IMAGE]);
      setCurrentSlideIndex(0);
      toast.success("Mockup reset to default image. Click Save to persist.");
      return;
    }
    const updated = moduleScreens.filter((_, i) => i !== idxToRemove);
    setModuleScreens(updated);
    setCurrentSlideIndex((prev) => {
      if (prev >= updated.length) return updated.length - 1;
      return prev;
    });
    toast.success("Image removed from list. Click Save to persist.");
  };

  const handleMoveImageLeft = (idx: number) => {
    if (idx === 0) return;
    const u = [...moduleScreens];
    [u[idx - 1], u[idx]] = [u[idx], u[idx - 1]];
    setModuleScreens(u);
    setCurrentSlideIndex(idx - 1);
  };

  const handleMoveImageRight = (idx: number) => {
    if (idx === moduleScreens.length - 1) return;
    const u = [...moduleScreens];
    [u[idx], u[idx + 1]] = [u[idx + 1], u[idx]];
    setModuleScreens(u);
    setCurrentSlideIndex(idx + 1);
  };

  // ── Tags & Multiple Slider Images Saving ──────────────────────────────────
  const saveTags = async (tagList: string[], screensList: string[]) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/landing/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modulesHeroTags: tagList,
          modulesHeroImage: screensList[0] || DEFAULT_IMAGE,
          moduleScreens: screensList,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Modules settings saved successfully!");
        setTags(tagList);
        setModuleScreens(screensList);
        if (screensList.length > 0) {
          setHeroImage(screensList[0]);
        }
      } else {
        toast.error(data.message || "Failed to save");
      }
    } catch {
      toast.error("Connection error while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) { toast.error("Tag already exists"); return; }
    setTags([...tags, trimmed]);
    setNewTag("");
  };

  const handleDeleteTag = (idx: number) => setTags(tags.filter((_, i) => i !== idx));

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const u = [...tags];
    [u[idx - 1], u[idx]] = [u[idx], u[idx - 1]];
    setTags(u);
  };

  const handleMoveDown = (idx: number) => {
    if (idx === tags.length - 1) return;
    const u = [...tags];
    [u[idx], u[idx + 1]] = [u[idx + 1], u[idx]];
    setTags(u);
  };

  const handleStartEdit = (idx: number) => { setEditingIdx(idx); setEditingValue(tags[idx]); };

  const handleConfirmEdit = () => {
    if (editingIdx === null) return;
    const trimmed = editingValue.trim();
    if (!trimmed) { toast.error("Tag cannot be empty"); return; }
    const u = [...tags];
    u[editingIdx] = trimmed;
    setTags(u);
    setEditingIdx(null);
    setEditingValue("");
  };

  const handleCancelEdit = () => { setEditingIdx(null); setEditingValue(""); };

  const handleResetToDefaults = () => {
    setTags([...DEFAULT_TAGS]);
    setEditingIdx(null);
    toast.success("Reset to default tags. Click Save to persist.");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1D496C] via-[#285E89] to-[#8B5CF6] p-6 text-white shadow-lg md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/20">
                <CheckSquare className="h-5 w-5 text-[#E4FF4C]" />
              </div>
              <h2 className="text-2xl font-black md:text-3xl">Modules Hero Tags & Image</h2>
            </div>
            <p className="text-white/80 max-w-xl text-sm leading-relaxed">
              Manage the 2-column feature checklist and hero mockup image displayed in the Modules page hero section.
            </p>
          </div>
          <div>
            {isDbConnected ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 font-bold px-3 py-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                MongoDB Live
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-200 font-bold px-3 py-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping"></span>
                Offline (File Store)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── HERO SLIDER IMAGES UPLOAD ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#8B5CF6]/5 to-[#429CE4]/5 border-b border-slate-100 px-6 py-4">
          <h3 className="text-sm font-black text-slate-700 uppercase mapping-wider flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-[#8B5CF6]" />
            Hero Mockup Slider Images
          </h3>
          <p className="text-xs text-slate-400 mt-1">Upload and manage the screenshots/mockups displayed in the laptop mockup slider inside the modules hero section.</p>
        </div>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Live mockup preview frame (Left Column) */}
            <div className="relative w-full lg:w-72 flex-shrink-0">
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-950 p-1.5 aspect-[16/10] shadow-md group">
                <div className="flex items-center gap-1.5 px-3 py-1 border-b border-white/5 bg-slate-900/40 rounded-t-xl">
                  <div className="w-2 h-2 rounded-full bg-red-500/80"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500/80"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500/80"></div>
                </div>

                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 rounded-b-xl">
                  {isUploadingImage && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8B5CF6] border-t-transparent mb-2"></div>
                      <span className="text-xs font-bold text-white">Uploading...</span>
                    </div>
                  )}
                  <img
                    src={moduleScreens[currentSlideIndex] || DEFAULT_IMAGE}
                    alt="Mockup preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <span className="text-[10px] font-bold text-white/80 truncate">
                      {moduleScreens[currentSlideIndex] || DEFAULT_IMAGE}
                    </span>
                  </div>

                  {/* Dot navigation indicators */}
                  {moduleScreens.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20 bg-slate-950/60 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
                      {moduleScreens.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentSlideIndex(idx)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlideIndex
                              ? "bg-[#FFA600] w-3"
                              : "bg-white/40 hover:bg-white w-1.5"
                            }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5 pl-1">
                <Monitor className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[10px] text-slate-400 font-medium">Previewing slide #{currentSlideIndex + 1}</span>
              </div>
            </div>

            {/* Upload & Management Area (Right Column) */}
            <div className="flex-1 w-full space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* Drag/Click Zone */}
              <div
                onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all
                  ${isUploadingImage
                    ? "border-[#8B5CF6]/40 bg-[#8B5CF6]/5 cursor-wait"
                    : "border-slate-200 hover:border-[#8B5CF6]/60 hover:bg-[#8B5CF6]/5 active:scale-[0.99]"
                  }
                `}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isUploadingImage ? "bg-[#8B5CF6]/10" : "bg-slate-100"}`}>
                    {isUploadingImage ? (
                      <RefreshCw className="h-5 w-5 text-[#8B5CF6] animate-spin" />
                    ) : (
                      <Upload className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      {isUploadingImage ? "Uploading files..." : "Click to select mockup image(s)"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP, GIF — max 5MB (Multiple uploads allowed)</p>
                  </div>
                </div>
              </div>

              {/* Slider Images Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase mapping-wider flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                  Slider Images ({moduleScreens.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {moduleScreens.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className={`relative group rounded-xl overflow-hidden border-2 bg-slate-50 p-1.5 transition-all cursor-pointer flex flex-col justify-between
                        ${currentSlideIndex === index ? "border-[#8B5CF6] shadow-sm bg-[#8B5CF6]/5" : "border-slate-100 hover:border-slate-200"}`}
                      onClick={() => setCurrentSlideIndex(index)}
                    >
                      <div className="aspect-[16/10] rounded-lg overflow-hidden bg-slate-200 relative">
                        <img src={url} alt={`Slide ${index + 1}`} className="w-full h-full object-cover select-none pointer-events-none" />
                        <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm text-[9px] font-black text-white px-1.5 py-0.5 rounded">
                          Slide {index + 1}
                        </div>
                      </div>

                      {/* Controls row */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/60">
                        <div className="flex gap-0.5">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={(e) => { e.stopPropagation(); handleMoveImageLeft(index); }}
                            className="h-5 w-5 flex items-center justify-center rounded text-slate-400 hover:text-[#8B5CF6] hover:bg-slate-100 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                            title="Move Left"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === moduleScreens.length - 1}
                            onClick={(e) => { e.stopPropagation(); handleMoveImageRight(index); }}
                            className="h-5 w-5 flex items-center justify-center rounded text-slate-400 hover:text-[#8B5CF6] hover:bg-slate-100 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                            title="Move Right"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemoveImageIndex(index); }}
                          className="h-5 w-5 flex items-center justify-center rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Delete Image"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold shadow-md shadow-[#8B5CF6]/20"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploadingImage ? "Uploading..." : "Upload Image(s)"}
                </Button>
                {(moduleScreens.length > 1 || moduleScreens[0] !== DEFAULT_IMAGE) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setModuleScreens([DEFAULT_IMAGE]);
                      setCurrentSlideIndex(0);
                      toast.success("Images reset to defaults. Click Save to apply.");
                    }}
                    className="rounded-xl border-slate-200 text-rose-500 hover:border-rose-200 hover:bg-rose-50 font-bold"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reset to Default
                  </Button>
                )}
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 font-medium">
                  After managing your slider images, click <strong>"Save to Database"</strong> below to push the new slider configuration live to the public modules section.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TAGS EDITOR + LIVE PREVIEW ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* LEFT: Tag Editor */}
        <div className="space-y-6">
          {/* Add new tag */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-black text-slate-700 uppercase mapping-wider mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#8B5CF6]" />
              Add New Tag
            </h3>
            <div className="flex gap-3">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="e.g. Library Management"
                className="rounded-xl border-slate-200 focus:border-[#8B5CF6] focus:ring-[#8B5CF6] flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              />
              <Button
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                className="rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold px-5 shadow-md shadow-[#8B5CF6]/20"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Tag List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-700 uppercase mapping-wider flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-slate-400" />
                Tag List
                <span className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-[10px] font-black">
                  {tags.length}
                </span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetToDefaults}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Defaults
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8B5CF6] border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {tags.map((tag, idx) => (
                    <motion.div
                      key={`${tag}-${idx}`}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2 }}
                      className="group flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5 transition-all"
                    >
                      {/* Order controls */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button onClick={() => handleMoveUp(idx)} disabled={idx === 0} className="h-4 w-4 flex items-center justify-center rounded text-slate-300 hover:text-[#8B5CF6] disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                          <ChevronUp className="h-3.5 w-3.5 stroke-[2.5]" />
                        </button>
                        <button onClick={() => handleMoveDown(idx)} disabled={idx === tags.length - 1} className="h-4 w-4 flex items-center justify-center rounded text-slate-300 hover:text-[#8B5CF6] disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                          <ChevronDown className="h-3.5 w-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                      <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-[9px] font-black">{idx + 1}</span>

                      {editingIdx === idx ? (
                        <div className="flex flex-1 items-center gap-2">
                          <Input
                            ref={editInputRef}
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="h-7 rounded-lg border-[#8B5CF6]/40 focus:border-[#8B5CF6] text-sm font-semibold flex-1 px-2"
                            onKeyDown={(e) => { if (e.key === "Enter") handleConfirmEdit(); if (e.key === "Escape") handleCancelEdit(); }}
                          />
                          <button onClick={handleConfirmEdit} className="h-6 w-6 flex items-center justify-center rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"><Check className="h-3.5 w-3.5 stroke-[2.5]" /></button>
                          <button onClick={handleCancelEdit} className="h-6 w-6 flex items-center justify-center rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"><X className="h-3.5 w-3.5 stroke-[2.5]" /></button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1 text-sm font-semibold text-slate-700 truncate">{tag}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleStartEdit(idx)} className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10 transition-all">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDeleteTag(idx)} className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {tags.length === 0 && (
                  <div className="flex flex-col items-center py-10 text-slate-400">
                    <CheckSquare className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-sm font-medium">No tags added yet</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Save button */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => saveTags(tags, moduleScreens)}
              disabled={isSaving || tags.length === 0}
              className="rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white font-bold px-6 py-5 shadow-lg shadow-[#8B5CF6]/20 hover:opacity-90 transition-all"
            >
              {isSaving ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save to Database</>}
            </Button>
            <Button variant="outline" onClick={loadTags} disabled={isLoading} className="rounded-xl border-slate-200 text-slate-600 hover:border-[#8B5CF6] hover:text-[#8B5CF6] font-bold px-6 py-5">
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Reload from DB
            </Button>
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#FF5F57]"></span>
                <span className="h-3 w-3 rounded-full bg-[#FEBC2E]"></span>
                <span className="h-3 w-3 rounded-full bg-[#28C840]"></span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Live Preview — /modules page hero</span>
            </div>

            {/* Simulated hero section */}
            <div className="relative bg-[#1D496C] p-5 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#429CE4]/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#FFA600]/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Left: checklist */}
                <div className="space-y-3">
                  <span className="inline-flex items-center rounded-full border border-[#FFA600]/30 bg-[#FFA600]/10 px-2.5 py-0.5 text-[9px] font-bold uppercase mapping-widest text-[#FFA600]">
                    SMART SCHOOL ERP MODULES
                  </span>
                  <p className="text-sm font-black text-white leading-tight">
                    Powerful Modules for{" "}
                    <span className="bg-gradient-to-r from-[#429CE4] via-[#E4FF4C] to-[#FFA600] bg-clip-text text-transparent">
                      Complete School
                    </span>
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    <AnimatePresence mode="popLayout">
                      {tags.slice(0, 6).map((tag, idx) => (
                        <motion.div
                          key={`preview-${tag}-${idx}`}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.18 }}
                          className="flex items-center gap-1.5 rounded-lg bg-[#184467]/40 border border-[#20537c]/60 px-2.5 py-1.5"
                        >
                          <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#E4FF4C]/25 text-[#E4FF4C]">
                            <Check className="h-2 w-2 stroke-[3.5]" />
                          </div>
                          <span className="text-[10px] font-bold text-white leading-tight truncate">{tag}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {tags.length > 6 && (
                      <p className="text-[9px] text-white/40 font-medium pl-1">+{tags.length - 6} more…</p>
                    )}
                  </div>
                </div>

                {/* Right: image mockup */}
                <div className="relative">
                  <div className="rounded-xl overflow-hidden bg-slate-950/80 border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-white/5 bg-slate-900/40">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                    </div>
                    <div className="aspect-[16/10] overflow-hidden bg-slate-900 relative flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        {moduleScreens.length > 0 && moduleScreens[currentSlideIndex] ? (
                          <motion.img
                            key={currentSlideIndex}
                            src={moduleScreens[currentSlideIndex]}
                            alt="Mockup preview"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.5 }}
                            onError={(e) => { e.currentTarget.src = DEFAULT_IMAGE; }}
                            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                          />
                        ) : (
                          <img
                            src={DEFAULT_IMAGE}
                            alt="Mockup fallback"
                            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                          />
                        )}
                      </AnimatePresence>

                      {/* Dots indicator overlays in live preview */}
                      {moduleScreens.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-slate-950/60 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                          {moduleScreens.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setCurrentSlideIndex(idx)}
                              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlideIndex
                                  ? "bg-[#FFA600] w-3.5 animate-pulse"
                                  : "bg-white/40 hover:bg-white w-1.5"
                                }`}
                              aria-label={`Go to slide ${idx + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {isUploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-xl backdrop-blur-sm">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">{tags.length} tag{tags.length !== 1 ? "s" : ""} · Updates live as you edit</span>
              <div className="flex items-center gap-1.5">
                <Database className="h-3 w-3 text-slate-400" />
                <span className={`text-[10px] font-bold ${isDbConnected ? "text-emerald-600" : "text-slate-400"}`}>
                  {isDbConnected ? "MongoDB" : "File Store"}
                </span>
              </div>
            </div>
          </div>

          {/* How this works */}
          <div className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 p-5">
            <h4 className="text-xs font-black text-[#8B5CF6] uppercase mapping-wider mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              How This Works
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2"><span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#8B5CF6] shrink-0"></span><span><strong>Upload</strong> multiple mockup screenshots using the uploader above</span></li>
              <li className="flex items-start gap-2"><span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#8B5CF6] shrink-0"></span><span><strong>Reorder</strong> slider screenshots by shifting them left/right, or delete them</span></li>
              <li className="flex items-start gap-2"><span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#8B5CF6] shrink-0"></span><span><strong>Preview</strong> updates in real time — both checklist tags and the autoplaying mockup slider</span></li>
              <li className="flex items-start gap-2"><span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#8B5CF6] shrink-0"></span><span><strong>Save to Database</strong> pushes tags and slider screenshots live to the Modules page</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
