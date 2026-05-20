"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card as MuiCard, CardContent as MuiCardContent, CardMedia as MuiCardMedia } from "@mui/material";
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
  Sparkles,
  Menu,
  Star,
  TrendingUp,
  Award,
  Heart,
  Rocket,
  DollarSign,
  BookMarked,
  X,
  Loader2,
} from "lucide-react";
import { getPublishedFormLink } from "@/lib/forms";
import { toast } from "sonner";

export default function LandingPage() {
  const [formLink, setFormLink] = useState("");

  useEffect(() => {
    getPublishedFormLink()
      .then((data) => setFormLink(data.form_link))
      .catch((err) => console.error("Failed to fetch link", err));
  }, []);

  const gsapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.fromTo(".main-feature-card", 
          { opacity: 0, y: 60, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: gsapContainerRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            }
          }
        );
      }, gsapContainerRef);

      return () => ctx.revert();
    }
  }, []);

  const handleGetStarted = () => {
    window.location.href = "/signup";
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#F8FAFC] via-white to-[#429CE4]/5">

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#1D496C]/10 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center">
                <div className="flex h-14 w-auto items-center justify-center rounded-xl bg-white p-1.5 shadow-md border border-[#1D496C]/10">
                  <img src="/logo.png" alt="VidyaSanchalan Logo" className="h-10 w-auto max-w-[160px] object-contain" />
                </div>
                <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#FFA600] ring-2 ring-white"></div>
              </div>
              <div>
                <span className="text-xl font-black tracking-tight"><span className="text-[#285E89]">Vidya</span><span className="text-[#FFA600]">Sanchalan</span></span>
                <p className="text-[10px] text-[#475569]/80 font-bold uppercase tracking-wider mt-0.5">School Management</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              {["Modules", "About", "Pricing", "Contact"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="group relative text-sm font-medium text-[#475569] transition-colors hover:text-[#285E89]"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-[#1D496C] to-[#6A7626] transition-all group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex rounded-lg text-[#475569] hover:bg-[#429CE4]/10 hover:text-[#285E89]"
                asChild
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                size="sm"
                className="rounded-lg bg-[#429CE4] text-white shadow-md hover:bg-[#1D496C] transition-all duration-300"
                onClick={handleGetStarted}
              >
                Get Started
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
              <Button variant="outline" size="icon" className="md:hidden rounded-lg border-[#6A7626]/30 text-[#1D496C]">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admission Marquee */}
      {formLink && (
        <div className="sticky top-16 z-40 overflow-hidden bg-[#ED6708] py-2 border-b border-[#ED6708]/20 shadow-sm">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
            className="flex whitespace-nowrap items-center gap-12 px-4"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-medium text-white">
                <Sparkles className="h-4 w-4 text-white/80" />
                <span>Admission forms are available! Follow the link to apply:</span>
                <a
                  href={formLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/15 hover:bg-white/25 px-3 py-1 rounded-full border border-white/30 underline decoration-white/50 underline-offset-4 transition-all"
                >
                  {formLink}
                </a>
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-8 lg:pt-8 lg:pb-12 bg-gradient-to-b from-white via-[#429CE4]/5 to-white">
        {/* Soft background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-[#429CE4]/10 blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full bg-[#6A7626]/5 blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Left Side Content */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-8 text-left"
            >
              <div className="space-y-4">
                <Badge
                  variant="outline"
                  className="rounded-full px-4 py-1.5 border-[#6A7626]/30 bg-[#6A7626]/10 text-[#6A7626] shadow-sm font-bold tracking-wider uppercase text-xs"
                >
                  ★ Smart School ERP Platform
                </Badge>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                  <span className="bg-gradient-to-r from-[#285E89] to-[#FFA600] bg-clip-text text-transparent block font-black mb-2 text-5xl sm:text-6xl lg:text-7.5xl tracking-tighter">
                    VidhyaSanchalan
                  </span>
                  <span className="text-[#1D496C] text-2xl sm:text-3xl lg:text-4xl font-extrabold block">
                    Complete Smart School Management System
                  </span>
                </h1>
              </div>

              <p className="text-base sm:text-lg text-[#475569] leading-relaxed font-medium">
                Manage the complete school journey — from student admission to leaving certificate — with powerful digital panels for Trustees, Principals, Clerks, Teachers, Students, and Guardians.
              </p>

              {/* Small Highlights Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  "Online & Offline Admission",
                  "Smart Fee Management",
                  "Attendance & Geo Tracking",
                  "Parent Progress Reports",
                  "Homework & Online Exams"
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.08, duration: 0.5 }}
                    className="flex items-center gap-3 bg-[#1D496C]/5 hover:bg-[#1D496C]/10 border border-[#1D496C]/10 rounded-xl px-4 py-3 transition-colors shadow-sm"
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6A7626]/20 text-[#6A7626]">
                      <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                    </div>
                    <span className="text-sm font-semibold text-[#1D496C]">{item}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  size="lg"
                  className="rounded-xl bg-[#429CE4] text-white shadow-xl shadow-[#429CE4]/20 hover:shadow-2xl hover:shadow-[#429CE4]/30 hover:bg-[#1D496C] px-8 py-6 text-base font-bold transition-all duration-300 transform hover:scale-105"
                  onClick={handleGetStarted}
                >
                  Request Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl border-2 border-[#6A7626] bg-white text-[#6A7626] hover:bg-[#6A7626]/5 px-8 py-6 text-base font-bold transition-all duration-300 transform hover:scale-105"
                  asChild
                >
                  <Link href="#about">Learn More</Link>
                </Button>
              </div>
            </motion.div>

            {/* Right Side Image with translate curv & motion effect */}
            <motion.div
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="lg:col-span-5 relative flex justify-center"
            >
              {/* Ambient glow under the image */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#429CE4]/30 to-[#6A7626]/20 rounded-[2.5rem] blur-2xl opacity-70 -z-10 animate-pulse"></div>

              {/* Floating 3D image frame */}
              <motion.div
                animate={{
                  y: [0, -12, 0],
                  rotate: [0, 1.5, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative overflow-hidden rounded-[2.5rem] border-4 border-white bg-slate-100 shadow-2xl shadow-slate-900/10 hover:shadow-slate-900/20 transition-shadow duration-500 max-w-[480px] w-full aspect-[4/3] flex items-center justify-center group"
              >
                <img
                  src="/sms hero.jpg"
                  alt="VidhyaSanchalan Smart School Management"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Decorative glass overlay elements */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent"></div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute bottom-6 left-6 right-6 backdrop-blur-md bg-white/80 border border-white/20 p-4 rounded-2xl shadow-lg flex items-center justify-between"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#6A7626] font-bold">Admission Portal</p>
                    <p className="text-sm font-extrabold text-[#1D496C]">Active & Open for 2026</p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                </motion.div>
              </motion.div>

              {/* Additional floating card to create a 3D overlay aesthetic */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-4 backdrop-blur-md bg-white/90 border border-slate-100 px-4 py-3 rounded-2xl shadow-lg hidden sm:flex items-center gap-3"
              >
                <div className="h-9 w-9 rounded-xl bg-[#6A7626]/10 flex items-center justify-center text-[#6A7626]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">Parent Portal</p>
                  <p className="text-sm font-black text-[#1D496C]">Geo Tracking Enabled</p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 overflow-hidden bg-gradient-to-br from-[#1D496C]/5 via-white to-white border-y border-[#1D496C]/10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Side: Image with translate curv & hover float effect */}
            <motion.div 
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative flex justify-center"
            >
              {/* Ambient backdrop glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#6A7626]/20 to-[#429CE4]/20 rounded-[2.5rem] blur-2xl opacity-75 -z-10 animate-pulse"></div>
              
              {/* Floating Image Frame */}
              <motion.div
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -1, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative overflow-hidden rounded-[2.5rem] border-4 border-white bg-slate-100 shadow-2xl shadow-slate-900/10 max-w-[480px] w-full aspect-[4/3] flex items-center justify-center group"
              >
                <img 
                  src="/about sms.jpg" 
                  alt="One Platform for Complete School Management" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                {/* Dynamic corner decoration */}
                <div className="absolute top-4 left-4 backdrop-blur-md bg-white/80 border border-white/20 px-3 py-1.5 rounded-full shadow-sm">
                  <span className="text-xs font-bold text-[#1D496C] flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#FFA600]"></span>
                    ERP System
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side: Content */}
            <motion.div 
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              <div className="space-y-3">
                <Badge 
                  variant="outline" 
                  className="rounded-full px-4 py-1.5 border-[#6A7626]/30 bg-[#6A7626]/10 text-[#6A7626] shadow-sm font-bold tracking-wider uppercase text-xs"
                >
                  ★ About VidhyaSanchalan
                </Badge>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1D496C] leading-tight">
                  One Platform for <span className="bg-gradient-to-r from-[#285E89] to-[#FFA600] bg-clip-text text-transparent">Complete School</span> Management
                </h2>
              </div>
              
              <div className="space-y-4 text-slate-600 font-medium leading-relaxed text-base sm:text-lg">
                <p>
                  VidhyaSanchalan is an advanced school ERP and management system designed to simplify daily school operations. It helps schools manage admissions, fees, staff, attendance, examinations, homework, reports, announcements, and student progress through separate role-based panels.
                </p>
                <p className="border-l-4 border-[#FFA600] pl-4 italic text-[#1D496C]/90 bg-[#FFA600]/5 py-2.5 rounded-r-xl">
                  The system supports both online and offline processes and provides transparency between school staff, students, and parents.
                </p>
              </div>

              {/* Decorative Features list */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {[
                  { title: "Transparency", desc: "For staff, students & parents" },
                  { title: "Role-Based Access", desc: "Private secure panels" }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#429CE4]/10 flex items-center justify-center text-[#429CE4] shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-[#1D496C] text-sm">{item.title}</p>
                      <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section id="features" className="py-20 bg-white overflow-hidden border-b border-[#1D496C]/10" ref={gsapContainerRef}>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge 
              variant="outline" 
              className="rounded-full px-4 py-1.5 border-[#6A7626]/30 bg-[#6A7626]/10 text-[#6A7626] shadow-sm font-bold tracking-wider uppercase text-xs"
            >
              ★ Full Capabilities
            </Badge>
            <h2 className="text-3.5xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1D496C] leading-tight">
              Powerful Features of <span className="bg-gradient-to-r from-[#285E89] to-[#FFA600] bg-clip-text text-transparent">VidhyaSanchalan</span>
            </h2>
            <p className="text-slate-500 font-medium text-base sm:text-lg">
              Empower your school with 8 advanced modules custom-built to maximize academic transparency and administrative efficiency.
            </p>
          </div>

          <div className="flex overflow-x-auto gap-8 pb-8 pt-4 px-2 premium-scrollbar snap-x">
            {mainFeatures.map((feature, index) => (
              <MuiCard 
                key={index} 
                className="main-feature-card group relative bg-white rounded-[24px] border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/60 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 overflow-hidden cursor-pointer min-w-[320px] md:min-w-[360px] max-w-[380px] shrink-0 snap-start"
              >
                <MuiCardMedia
                  component="img"
                  height="200"
                  image={feature.image}
                  alt={feature.title}
                  className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                <MuiCardContent className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Accent color bar */}
                    <div className={`w-12 h-1 bg-gradient-to-r ${feature.color} rounded-full mb-4 group-hover:w-20 transition-all duration-300`}></div>

                    <h3 className="font-extrabold text-[#1D496C] text-xl leading-snug group-hover:text-[#FFA600] transition-colors duration-300 mb-4">
                      {feature.title}
                    </h3>

                    <ul className="space-y-3.5 pl-0.5">
                      {feature.points.map((point, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                          <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 text-[#6A7626] stroke-[2.5] shrink-0" />
                          <span className="text-slate-600 font-semibold leading-relaxed group-hover:text-slate-700 transition-colors">
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Subtle bottom highlights indicator */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1D496C]">
                    <span className="text-[#6A7626]">Advanced Module</span>
                    <div className="h-5 w-5 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#429CE4]/10 group-hover:text-[#429CE4] transition-colors">
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </MuiCardContent>
              </MuiCard>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Modules */}
      <section id="modules" className="py-20 bg-[#F8FAFC]">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="rounded-lg px-4 py-2 bg-[#1D496C]/5 text-[#1D496C] border-0 mb-4">
              <Users className="mr-2 h-3 w-3 text-[#1D496C]" />
              Role-Based Access
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-[#0F172A]">
              Tailored for Every Stakeholder
            </h2>
            <p className="text-[#475569]">
              Each user gets a personalized experience with exactly what they need
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {roles.map((role, index) => (
              <Card
                key={index}
                className="group border-0 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              >
                <CardHeader>
                  <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br ${role.color} text-white shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    {role.icon}
                  </div>
                  <CardTitle className="text-xl text-[#0F172A]">{role.title}</CardTitle>
                  <CardDescription className="text-sm font-medium text-[#475569]">
                    {role.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {role.features.slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-3 w-3 text-[#34D399] shrink-0" />
                        <span className="text-[#475569]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Special Modules Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Fee Management */}
            <Card className="group border-0 bg-gradient-to-br from-[#1D496C]/5 to-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
              <div className="absolute top-0 right-0 h-40 w-40 bg-[#6A7626]/10 rounded-full blur-3xl -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-700"></div>
              <CardHeader>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-[#1D496C] to-[#15354F] text-white shadow-sm">
                  <DollarSign className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl text-[#0F172A]">Fee Management</CardTitle>
                <CardDescription className="text-[#475569]">
                  Complete financial management with RTE compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {feeCategories.map((category, i) => (
                    <div key={i} className="rounded-lg bg-[#F8FAFC] p-3 text-sm font-medium text-[#1D496C] border border-[#6A7626]/20">
                      {category}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-lg bg-[#1D496C]/10 text-[#1D496C] border-0">RTE Reimbursement</Badge>
                  <Badge className="rounded-lg bg-[#6A7626]/10 text-[#6A7626] border-0">Late Fee Penalties</Badge>
                  <Badge className="rounded-lg bg-[#429CE4]/10 text-[#1D496C] border-0">Discount Management</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Inventory & Library */}
            <Card className="group border-0 bg-gradient-to-br from-[#6A7626]/5 to-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
              <div className="absolute top-0 right-0 h-40 w-40 bg-[#1D496C]/10 rounded-full blur-3xl -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-700"></div>
              <CardHeader>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-[#6A7626] to-[#4F581D] text-white shadow-sm">
                  <BookMarked className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl text-[#0F172A]">Inventory & Library</CardTitle>
                <CardDescription className="text-[#475569]">
                  Complete asset and book tracking system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {inventoryFeatures.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/80 hover:bg-white transition-colors border border-[#6A7626]/10">
                      <CheckCircle2 className="h-4 w-4 text-[#6A7626] shrink-0" />
                      <span className="text-sm text-[#475569]">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="border-0 bg-gradient-to-r from-[#1D496C] to-[#15354F] text-white shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.08] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>
            <CardContent className="p-12 relative">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { label: "Schools", value: "500+", icon: <GraduationCap className="h-6 w-6 mx-auto mb-2 opacity-80" /> },
                  { label: "Students", value: "50K+", icon: <Users className="h-6 w-6 mx-auto mb-2 opacity-80" /> },
                  { label: "Teachers", value: "5K+", icon: <BookOpen className="h-6 w-6 mx-auto mb-2 opacity-80" /> },
                  { label: "Parents", value: "100K+", icon: <Heart className="h-6 w-6 mx-auto mb-2 opacity-80" /> },
                ].map((stat, i) => (
                  <div key={i} className="group hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                    <div className="text-3xl font-bold mb-2">{stat.value}</div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="rounded-lg px-4 py-2 bg-white text-[#1D496C] border-0 mb-4">
              <Star className="mr-2 h-3 w-3 fill-[#FFA600] text-[#FFA600]" />
              Testimonials
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-[#0F172A]">
              Loved by Educators
            </h2>
            <p className="text-[#475569]">
              See what schools are saying about VidyaSanchalan
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Sarah Johnson",
                role: "Principal, Greenfield School",
                content: "EduManage has transformed how we handle admissions and attendance. The parent communication feature is a game-changer!",
                rating: 5,
                color: "bg-white"
              },
              {
                name: "Michael Chen",
                role: "Head of Administration",
                content: "The fee management system is incredibly intuitive. We've reduced our administrative workload by 60%.",
                rating: 5,
                color: "bg-white"
              },
              {
                name: "Priya Patel",
                role: "Teacher, Oakridge School",
                content: "Entering marks and generating progress reports has never been easier. My students love the parent portal!",
                rating: 5,
                color: "bg-white"
              }
            ].map((testimonial, i) => (
              <Card key={i} className={`border-0 ${testimonial.color} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#FFA600] text-[#FFA600]" />
                    ))}
                  </div>
                  <p className="text-[#475569] mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-[#6A7626]/30">
                      <AvatarFallback className="bg-gradient-to-br from-[#1D496C] to-[#6A7626] text-white">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-[#0F172A]">{testimonial.name}</p>
                      <p className="text-xs text-[#475569]">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="border-0 bg-gradient-to-br from-[#429CE4]/5 to-white shadow-xl overflow-hidden cursor-pointer">
            <div className="absolute inset-0 bg-grid-[#1D496C]/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>
            <CardContent className="p-16 text-center relative">
              <div className="max-w-2xl mx-auto space-y-6">
                <Badge variant="outline" className="rounded-lg px-4 py-2 border-[#6A7626] bg-white text-[#1D496C]">
                  <Rocket className="mr-2 h-3 w-3 text-[#1D496C]" />
                  Get Started Today
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-[#0F172A]">
                  Ready to Transform Your School Management?
                </h2>
                <p className="text-[#475569] text-lg">
                  Join thousands of schools already using VidyaSanchalan to streamline their operations
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <Button
                    size="lg"
                    className="rounded-lg bg-[#429CE4] text-white shadow-md hover:bg-[#1D496C] transition-all duration-300 transform hover:scale-105"
                    onClick={handleGetStarted}
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-lg border-2 border-[#6A7626] bg-white text-[#6A7626] hover:bg-[#6A7626]/5"
                    asChild
                  >
                    <Link href="/login">Contact Sales</Link>
                  </Button>
                </div>
                <p className="text-sm text-[#475569]">
                  No credit card required • Free 14-day trial • 24/7 support
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#6A7626]/20 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-20 w-auto flex items-center justify-center rounded-xl bg-white p-2 shadow-md border border-[#1D496C]/10">
                  <img src="/logo.png" alt="VidyaSanchalan Logo" className="h-16 w-auto max-w-[180px] object-contain" />
                </div>
                <div>
                  <span className="text-xl font-black tracking-tight"><span className="text-[#285E89]">Vidya</span><span className="text-[#FFA600]">Sanchalan</span></span>
                  <p className="text-[10px] text-[#475569]/80 font-bold uppercase tracking-wider mt-0.5">School Management</p>
                </div>
              </div>
              <p className="text-sm text-[#475569] max-w-md leading-relaxed">
                Complete school management solution based on comprehensive SRS documentation.
                Automating administrative, academic, and operational tasks.
              </p>
              <div className="flex gap-3 mt-6">
                {[
                  { icon: <Twitter />, color: "from-[#1D496C] to-[#15354F]" },
                  { icon: <Github />, color: "from-[#6A7626] to-[#4F581D]" },
                  { icon: <Linkedin />, color: "from-[#429CE4] to-[#1D496C]" },
                ].map((social, i) => (
                  <Button
                    key={i}
                    size="icon"
                    className={`rounded-lg bg-gradient-to-br ${social.color} text-white hover:shadow-md transition-all duration-300 hover:scale-110`}
                  >
                    {social.icon}
                  </Button>
                ))}
              </div>
            </div>

            {footerLinks.map((section, i) => (
              <div key={i}>
                <h3 className="font-semibold text-[#0F172A] mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link href="#" className="text-sm text-[#475569] hover:text-[#285E89] transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Separator className="my-8 bg-[#6A7626]/20" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-[#475569]">© 2026 VidyaSanchalan. All rights reserved. Based on School Management SRS v1.0</p>
            <div className="flex gap-6">
              <Link href="#" className="text-[#475569] hover:text-[#285E89] transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-[#475569] hover:text-[#285E89] transition-colors">Terms of Service</Link>
              <Link href="#" className="text-[#475569] hover:text-[#285E89] transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}


// Social icons
function Twitter() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
    </svg>
  );
}

function Github() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function Linkedin() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}



const mainFeatures = [
  {
    title: "Admission Management",
    image: "/admission (1).jpg",
    icon: <GraduationCap className="h-6 w-6" />,
    color: "from-[#1D496C] to-[#1A3F5C]",
    points: [
      "Online admission forms",
      "Offline admission entries",
      "Public admission form sharing",
      "Student document management",
      "Admission approval system"
    ]
  },
  {
    title: "Fee Management",
    image: "/fees (1).jpg",
    icon: <CreditCard className="h-6 w-6" />,
    color: "from-[#6A7626] to-[#596420]",
    points: [
      "Online & offline fee collection",
      "Dynamic fee structure creation",
      "Monthly / Quarterly / Custom fee setup",
      "Tuition fee, library fee, transport fee, etc.",
      "Fee verification by clerk and principal",
      "Fee receipt generation"
    ]
  },
  {
    title: "Timetable Management",
    image: "/timetable (1).jpg",
    icon: <Calendar className="h-6 w-6" />,
    color: "from-[#429CE4] to-[#2E85CC]",
    points: [
      "Class-wise timetable creation",
      "Subject assignment",
      "Teacher allocation",
      "Editable schedules for teachers and students"
    ]
  },
  {
    title: "Homework & Assignment",
    image: "/homework (1).jpg",
    icon: <BookOpen className="h-6 w-6" />,
    color: "from-[#ED6708] to-[#CD5804]",
    points: [
      "Online and offline homework",
      "Assignment uploads",
      "Subject-wise homework tracking",
      "Teacher to student communication"
    ]
  },
  {
    title: "Progress Reports",
    image: "/progress report.jpeg",
    icon: <TrendingUp className="h-6 w-6" />,
    color: "from-[#FFA600] to-[#E09200]",
    points: [
      "Report cards",
      "Marksheets",
      "Attendance tracking",
      "Student performance analytics",
      "Guardian visibility panel"
    ]
  },
  {
    title: "Announcement System",
    image: "/announcement.jpeg",
    icon: <Bell className="h-6 w-6" />,
    color: "from-[#1D496C] to-[#6A7626]",
    points: [
      "School announcements",
      "Holiday notices",
      "Emergency alerts",
      "Event updates for students and parents"
    ]
  },
  {
    title: "Geo Attendance Feature",
    image: "/geo mapping.jpeg",
    icon: <Shield className="h-6 w-6" />,
    color: "from-[#6A7626] to-[#1D496C]",
    points: [
      "Staff attendance with geo-location tracking",
      "Secure attendance monitoring",
      "Real-time attendance records"
    ]
  },
  {
    title: "Online Examination",
    image: "/examination.jpeg",
    icon: <Award className="h-6 w-6" />,
    color: "from-[#429CE4] to-[#ED6708]",
    points: [
      "Conduct online exams",
      "MCQ and written tests",
      "Result generation",
      "Student performance reports"
    ]
  }
];

const roles = [
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Administrator",
    role: "Full System Control",
    color: "from-[#1D496C] to-[#15354F]",
    features: ["School configuration", "User management", "Financial oversight", "Report generation", "System audit logs"]
  },
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: "Teacher",
    role: "Academic Management",
    color: "from-[#6A7626] to-[#4F581D]",
    features: ["Attendance marking", "Mark entry", "Assignment management", "Parent communication", "Timetable view"]
  },
  {
    icon: <GraduationCap className="h-8 w-8" />,
    title: "Student",
    role: "Learning Portal",
    color: "from-[#ED6708] to-[#FFA600]",
    features: ["View attendance", "Check results", "Fee payment", "Download materials", "Event calendar"]
  },
  {
    icon: <Heart className="h-8 w-8" />,
    title: "Parent",
    role: "Child Monitoring",
    color: "from-[#429CE4] to-[#1D496C]",
    features: ["Real-time alerts", "Fee payment", "Progress tracking", "Communication", "Leave applications"]
  }
];

const feeCategories = [
  "Tuition Fee", "Transport Fee", "Library Fee", "Lab Fee",
  "Sports Fee", "Exam Fee", "Hostel Fee", "Miscellaneous"
];

const inventoryFeatures = [
  "Book catalog with ISBN tracking",
  "Issue & return management",
  "Overdue alerts & fine calculation",
  "Asset lifecycle management",
  "Vendor & purchase management",
  "Stock level alerts"
];

const footerLinks = [
  {
    title: "Product",
    links: ["Modules", "Pricing", "Integrations", "Changelog"]
  },
  {
    title: "Company",
    links: ["About Us", "Blog", "Careers", "Press", "Contact"]
  },
  {
    title: "Support",
    links: ["Documentation", "Help Center", "Community", "Status", "Privacy"]
  }
];

