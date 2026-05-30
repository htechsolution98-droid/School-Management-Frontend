"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  CreditCard,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Database,
  Save,
  RefreshCw,
  Sparkles,
  Smartphone,
  Cpu,
  CheckSquare,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminDashboard() {
  // Counters
  const [stats, setStats] = useState({
    features: 0,
    modules: 0,
    testimonials: 0,
    inquiries: 0,
    whyChooseUs: 0,
    mobileTabs: 0,
    mobileInfrastructure: 0,
    modulesHeroTags: 0,
  });

  // Settings state
  const [heroBadge, setHeroBadge] = useState("★ Smart School ERP Platform");
  const [heroTitle, setHeroTitle] = useState("VidhyaSanchalan");
  const [heroSubtitle, setHeroSubtitle] = useState("Complete Smart School Management System");
  const [heroDescription, setHeroDescription] = useState("Manage the complete school journey — from student admission to leaving certificate — with powerful digital panels for Trustees, Principals, Clerks, Teachers, Students, and Guardians.");
  const [satisfactionRate, setSatisfactionRate] = useState(99.8);

  // Connection & seeding flags
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch settings and connection status
      const settingsRes = await fetch("/api/landing/settings");
      const settingsData = await settingsRes.json();
      
      let whyChooseUsCount = 3;
      let mobileTabsCount = 3;
      let mobileInfrastructureCount = 4;
      let modulesHeroTagsCount = 8;
      if (settingsRes.ok && settingsData.success) {
        setIsDbConnected(true);
        setIsSeeded(settingsData.isSeeded);
        if (settingsData.settings) {
          setHeroBadge(settingsData.settings.heroBadge || "");
          setHeroTitle(settingsData.settings.heroTitle || "");
          setHeroSubtitle(settingsData.settings.heroSubtitle || "");
          setHeroDescription(settingsData.settings.heroDescription || "");
          setSatisfactionRate(settingsData.settings.satisfactionRate || 99.8);
          if (settingsData.settings.whyChooseUs) {
            whyChooseUsCount = settingsData.settings.whyChooseUs.length;
          }
          if (settingsData.settings.mobileTabs) {
            mobileTabsCount = settingsData.settings.mobileTabs.length;
          }
          if (settingsData.settings.mobileInfrastructure) {
            mobileInfrastructureCount = settingsData.settings.mobileInfrastructure.length;
          }
          if (settingsData.settings.modulesHeroTags) {
            modulesHeroTagsCount = settingsData.settings.modulesHeroTags.length;
          }
        }
      } else {
        setIsDbConnected(false);
      }

      // 2. Fetch features count
      const featuresRes = await fetch("/api/landing/features");
      const featuresData = await featuresRes.json();
      const featuresCount = featuresData.success ? featuresData.features.length : 8;

      // 3. Fetch modules/badges count
      const modulesRes = await fetch("/api/landing/modules");
      const modulesData = await modulesRes.json();
      const modulesCount = modulesData.success ? (modulesData.modules.length + modulesData.badges.length) : 16;

      // 4. Fetch testimonials count
      const testimonialsRes = await fetch("/api/landing/testimonials");
      const testimonialsData = await testimonialsRes.json();
      const testimonialsCount = testimonialsData.success ? testimonialsData.testimonials.length : 3;

      setStats({
        features: featuresCount,
        modules: modulesCount,
        testimonials: testimonialsCount,
        inquiries: 0, // Fallback placeholder
        whyChooseUs: whyChooseUsCount,
        mobileTabs: mobileTabsCount,
        mobileInfrastructure: mobileInfrastructureCount,
        modulesHeroTags: modulesHeroTagsCount,
      });
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      setIsDbConnected(false);
      // Fallbacks
      setStats({
        features: 8,
        modules: 16,
        testimonials: 3,
        inquiries: 0,
        whyChooseUs: 3,
        mobileTabs: 3,
        mobileInfrastructure: 4,
        modulesHeroTags: 8,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDbConnected) {
      toast.error("Database offline. Cannot save settings.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/landing/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroBadge,
          heroTitle,
          heroSubtitle,
          heroDescription,
          satisfactionRate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("General landing copy settings updated successfully!");
        setIsSeeded(true);
      } else {
        toast.error(data.message || "Failed to update settings");
      }
    } catch (err) {
      toast.error("Server connection error while saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeedDatabase = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    const loadingToast = toast.loading("Seeding MongoDB collections with default copy...");
    
    try {
      const res = await fetch("/api/landing/seed", { method: "POST" });
      const data = await res.json();
      
      toast.dismiss(loadingToast);
      if (data.success) {
        toast.success("Database seeded! Default page layout populated successfully.");
        loadDashboardData();
      } else {
        toast.error(data.message || "Seeding failed");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Database connection refused. Check MONGODB_URI in your .env");
    } finally {
      setIsSeeding(false);
    }
  };

  const statCards = [
    {
      title: "Landing Page Features",
      value: stats.features,
      description: "Active cards in features grid",
      icon: <GraduationCap className="h-6 w-6" />,
      color: "border-l-4 border-l-[#1D496C]",
      iconColor: "text-[#1D496C]",
      bg: "bg-[#1D496C]/5",
      href: "/admin/features",
    },
    {
      title: "Active Modules & Badges",
      value: stats.modules,
      description: "Modules in showcase scrollers",
      icon: <CreditCard className="h-6 w-6" />,
      color: "border-l-4 border-l-[#429CE4]",
      iconColor: "text-[#429CE4]",
      bg: "bg-[#429CE4]/5",
      href: "/admin/modules",
    },
    {
      title: "Why Choose Us",
      value: stats.whyChooseUs,
      description: "Homepage value propositions",
      icon: <Sparkles className="h-6 w-6" />,
      color: "border-l-4 border-l-[#5D3FD3]",
      iconColor: "text-[#5D3FD3]",
      bg: "bg-[#5D3FD3]/5",
      href: "/admin/why-choose-us",
    },
    {
      title: "Mobile App Roles",
      value: stats.mobileTabs,
      description: "Interactive ecosystem tabs",
      icon: <Smartphone className="h-6 w-6" />,
      color: "border-l-4 border-l-[#ED6708]",
      iconColor: "text-[#ED6708]",
      bg: "bg-[#ED6708]/5",
      href: "/admin/mobile-app",
    },
    {
      title: "Mobile Infrastructure",
      value: stats.mobileInfrastructure,
      description: "Technical capability showcase",
      icon: <Cpu className="h-6 w-6" />,
      color: "border-l-4 border-l-[#10b981]",
      iconColor: "text-[#10b981]",
      bg: "bg-[#10b981]/5",
      href: "/admin/mobile-infrastructure",
    },
    {
      title: "User Testimonials",
      value: stats.testimonials,
      description: "Student, parent, trustee reviews",
      icon: <Users className="h-6 w-6" />,
      color: "border-l-4 border-l-[#6A7626]",
      iconColor: "text-[#6A7626]",
      bg: "bg-[#6A7626]/5",
      href: "/admin/testimonials",
    },
    {
      title: "Contact Inquiries",
      value: stats.inquiries,
      description: "Messages submitted via contact form",
      icon: <MessageSquare className="h-6 w-6" />,
      color: "border-l-4 border-l-[#FFA600]",
      iconColor: "text-[#FFA600]",
      bg: "bg-[#FFA600]/5",
      href: "/admin/inquiries",
    },
    {
      title: "Modules Hero Tags",
      value: stats.modulesHeroTags,
      description: "Checklist items in modules page hero",
      icon: <CheckSquare className="h-6 w-6" />,
      color: "border-l-4 border-l-[#8B5CF6]",
      iconColor: "text-[#8B5CF6]",
      bg: "bg-[#8B5CF6]/5",
      href: "/admin/modules-hero-tags",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1D496C] via-[#285E89] to-[#429CE4] p-6 text-white shadow-lg md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black md:text-3xl">Hello, Administrator</h2>
            <p className="mt-2 text-white/80 max-w-xl text-sm leading-relaxed">
              Welcome to the VidyaSanchalan Central Command. Manage your website copy, testimonials, modules, and review public-facing form inquiries from a single consolidated dashboard.
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-inner">
            <TrendingUp className="h-8 w-8 text-[#E4FF4C] animate-pulse" />
          </div>
        </div>
      </div>

      {/* Database Sync Status Card */}
      <Card className="overflow-hidden shadow-md border-0 bg-white">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isDbConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800">Database Sync Status</h4>
              <p className="text-xs text-slate-400">Verifying live serverless MongoDB integration</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isDbConnected ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold px-3 py-1 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                MongoDB Connected
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-700 font-extrabold px-3 py-1 text-xs">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                Database Offline (Static Fallback Enabled)
              </span>
            )}
            <Button size="icon" variant="outline" className="h-8 w-8 text-slate-500 rounded-lg hover:text-slate-900" onClick={loadDashboardData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <CardContent className="py-6 px-6">
          <div className="grid gap-6 md:grid-cols-12 items-center">
            <div className="md:col-span-8 text-sm text-slate-600 leading-relaxed">
              {isDbConnected ? (
                isSeeded ? (
                  <p>
                    Your MongoDB database is successfully linked and synced! The public landing page is currently loaded dynamically from your live MongoDB cluster. All updates made inside the admin panel reflect on the homepage instantly.
                  </p>
                ) : (
                  <p className="text-amber-700 font-medium">
                    ⚠️ MONGODB IS CONNECTED, BUT NO COPY CONFIGURED. Click "Seed Default Layout Data" below to instantly populate your empty database with the complete set of landing page settings, modules, cards, and testimonials.
                  </p>
                )
              ) : (
                <p>
                  No database connection could be established. Next.js is automatically utilizing its **gorgeous hardcoded static fallbacks** to maintain 100% website uptime. To complete setup, open your <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-rose-600">.env</code> file and configure a valid connection string as <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-rose-600">MONGODB_URI=...</code>.
                </p>
              )}
            </div>
            <div className="md:col-span-4 flex justify-end">
              <Button
                onClick={handleSeedDatabase}
                disabled={!isDbConnected || isSeeding}
                className="w-full sm:w-auto bg-gradient-to-r from-[#1D496C] to-[#285E89] text-white hover:opacity-95 font-bold rounded-xl"
              >
                <Sparkles className="mr-2 h-4 w-4 text-[#E4FF4C]" />
                {isSeeding ? "Seeding..." : "Seed Default Copy Data"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`overflow-hidden shadow-sm hover:shadow-md transition-all ${card.color} bg-white`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </CardTitle>
                <div className={`rounded-xl p-2 ${card.bg} ${card.iconColor}`}>
                  {card.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black tracking-tight">{card.value}</div>
                <p className="text-xs text-slate-400 mt-1">{card.description}</p>
                <Link href={card.href} className="inline-flex items-center gap-1.5 text-xs font-bold mt-4 text-[#429CE4] hover:text-[#1D496C] transition-colors">
                  Manage section <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Hero Copy Settings Editor */}
      <Card className="shadow-md bg-white border border-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-black text-[#1D496C]">
            <Activity className="h-5 w-5 text-[#FFA600]" />
            Hero Section & Settings Editor
          </CardTitle>
          <CardDescription>Update the primary copywriting, header badge, and metrics visible above the fold on the homepage</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="heroBadge" className="text-sm font-bold text-slate-600">Hero Section Badge Pill</Label>
                <Input
                  id="heroBadge"
                  value={heroBadge}
                  onChange={(e) => setHeroBadge(e.target.value)}
                  placeholder="e.g. ★ Smart School ERP Platform"
                  className="rounded-xl border-slate-200 focus:border-[#429CE4] focus:ring-[#429CE4]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="satisfactionRate" className="text-sm font-bold text-slate-600">Satisfaction Metrics (%)</Label>
                <Input
                  id="satisfactionRate"
                  type="number"
                  step="0.1"
                  value={satisfactionRate}
                  onChange={(e) => setSatisfactionRate(parseFloat(e.target.value))}
                  placeholder="e.g. 99.8"
                  className="rounded-xl border-slate-200 focus:border-[#429CE4] focus:ring-[#429CE4]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroTitle" className="text-sm font-bold text-slate-600">Main Hero Title Copy</Label>
              <Input
                id="heroTitle"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="e.g. VidhyaSanchalan"
                className="rounded-xl border-slate-200 focus:border-[#429CE4] focus:ring-[#429CE4]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroSubtitle" className="text-sm font-bold text-slate-600">Hero Subtitle Text</Label>
              <Input
                id="heroSubtitle"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="e.g. Complete Smart School Management System"
                className="rounded-xl border-slate-200 focus:border-[#429CE4] focus:ring-[#429CE4]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroDescription" className="text-sm font-bold text-slate-600">Hero Paragraph Description</Label>
              <Textarea
                id="heroDescription"
                rows={4}
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                placeholder="e.g. Manage the complete school journey — from student admission to leaving certificate..."
                className="rounded-xl border-slate-200 focus:border-[#429CE4] focus:ring-[#429CE4] leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
                type="submit"
                disabled={isSaving || !isDbConnected}
                className="bg-[#429CE4] text-white hover:bg-[#1D496C] font-bold rounded-xl px-6 py-5 shadow-lg shadow-[#429CE4]/10"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving Copy..." : "Save Copy Settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
