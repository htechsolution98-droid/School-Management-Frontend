"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Users,
  CreditCard,
  Brain,
  Fingerprint,
  Laptop,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Menu,
  Sparkles,
  Home,
  Check,
  ChevronDown
} from "lucide-react";

export default function ModulesPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Custom lagging cursor follower spring physics
  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 30, stiffness: 220, mass: 0.6 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const touchQuery = window.matchMedia("(pointer: coarse)");
    setIsTouchDevice(touchQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setIsTouchDevice(e.matches);
    };
    touchQuery.addEventListener("change", listener);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 16);
      mouseY.set(e.clientY - 16);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      touchQuery.removeEventListener("change", listener);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  const modules = [
    {
      title: "Student Dashboard",
      emoji: "👨‍🎓",
      icon: <GraduationCap className="h-6 w-6" />,
      desc: "Designed to keep students organized, motivated, academic-centric, and highly engaged.",
      points: [
        "Attendance percentage",
        "Academic performance analytics",
        "Timetable & upcoming exams",
        "Homework and assignment tracker"
      ],
      hoverStyle: "hover:bg-gradient-to-br hover:from-[#1D496C] hover:via-[#285E89] hover:to-[#429CE4] hover:text-white hover:border-transparent hover:shadow-2xl hover:shadow-[#429CE4]/20",
      iconBg: "bg-[#1D496C]/10 text-[#1D496C] group-hover:bg-white/20 group-hover:text-white",
      checkStyle: "text-[#429CE4] group-hover:text-[#E4FF4C]"
    },
    {
      title: "Parent Portal",
      emoji: "👨‍👩‍👧",
      icon: <Users className="h-6 w-6" />,
      desc: "Instant tracking companion providing real-time data sync, fee alerts, and direct chats.",
      points: [
        "Real-time student updates",
        "Fee payment alerts",
        "Direct communication with teachers",
        "Daily activity reports"
      ],
      hoverStyle: "hover:bg-gradient-to-br hover:from-[#6A7626] hover:to-[#4F581D] hover:text-white hover:border-transparent hover:shadow-2xl hover:shadow-[#6A7626]/20",
      iconBg: "bg-[#6A7626]/10 text-[#6A7626] group-hover:bg-white/20 group-hover:text-white",
      checkStyle: "text-[#6A7626] group-hover:text-[#E4FF4C]"
    },
    {
      title: "Online Fee Management",
      emoji: "💳",
      icon: <CreditCard className="h-6 w-6" />,
      desc: "Secure banking integration handling automatic reminders, instant receipts, and payouts.",
      points: [
        "UPI/card/net banking integration",
        "Auto fee reminders",
        "Downloadable receipts",
        "Pending fee analytics"
      ],
      hoverStyle: "hover:bg-gradient-to-br hover:from-[#FFA600] hover:to-[#ED6708] hover:text-white hover:border-transparent hover:shadow-2xl hover:shadow-[#FFA600]/20",
      iconBg: "bg-[#FFA600]/10 text-[#FFA600] group-hover:bg-white/20 group-hover:text-white",
      checkStyle: "text-[#FFA600] group-hover:text-[#E4FF4C]"
    },
    {
      title: "AI-Based Features",
      emoji: "🧠",
      icon: <Brain className="h-6 w-6" />,
      desc: "Smarter school intelligence systems generating predictions, notes, and report remarks.",
      points: [
        "AI chatbot for student queries",
        "Smart performance prediction",
        "Personalized study recommendations",
        "AI-generated report cards/remarks"
      ],
      hoverStyle: "hover:bg-gradient-to-br hover:from-[#285E89] hover:to-[#429CE4] hover:text-white hover:border-transparent hover:shadow-2xl hover:shadow-[#429CE4]/20",
      iconBg: "bg-[#285E89]/10 text-[#285E89] group-hover:bg-white/20 group-hover:text-white",
      checkStyle: "text-[#429CE4] group-hover:text-[#E4FF4C]"
    },
    {
      title: "Smart Attendance System",
      emoji: "📅",
      icon: <Fingerprint className="h-6 w-6" />,
      desc: "Instant roll-calls utilizing dynamic biometric readers, QR checks, and fast parent alerts.",
      points: [
        "Face recognition attendance",
        "RFID/QR code attendance",
        "Biometric integration",
        "Instant parent SMS alerts for absentees"
      ],
      hoverStyle: "hover:bg-gradient-to-br hover:from-[#6A7626] hover:to-[#4F581D] hover:text-white hover:border-transparent hover:shadow-2xl hover:shadow-[#6A7626]/20",
      iconBg: "bg-[#6A7626]/10 text-[#6A7626] group-hover:bg-white/20 group-hover:text-white",
      checkStyle: "text-[#6A7626] group-hover:text-[#E4FF4C]"
    },
    {
      title: "Learning Management Features",
      emoji: "📚",
      icon: <Laptop className="h-6 w-6" />,
      desc: "Comprehensive virtual classrooms allowing easy study uploads, recordings, and gradings.",
      points: [
        "Online classes integration",
        "Study materials & notes upload",
        "Assignment submission portal",
        "Recorded lecture access"
      ],
      hoverStyle: "hover:bg-gradient-to-br hover:from-[#FFA600] hover:to-[#ED6708] hover:text-white hover:border-transparent hover:shadow-2xl hover:shadow-[#FFA600]/20",
      iconBg: "bg-[#FFA600]/10 text-[#FFA600] group-hover:bg-white/20 group-hover:text-white",
      checkStyle: "text-[#FFA600] group-hover:text-[#E4FF4C]"
    },
    {
      title: "Communication Features",
      emoji: "💬",
      icon: <MessageSquare className="h-6 w-6" />,
      desc: "Integrated micro-sockets connecting chat channels, live broadcasts, and meet systems.",
      points: [
        "Teacher-parent chat",
        "Broadcast messaging",
        "Email/SMS integration",
        "Video meeting integration"
      ],
      hoverStyle: "hover:bg-gradient-to-br hover:from-[#1D496C] hover:to-[#FFA600] hover:text-white hover:border-transparent hover:shadow-2xl hover:shadow-[#FFA600]/20",
      iconBg: "bg-[#1D496C]/10 text-[#1D496C] group-hover:bg-white/20 group-hover:text-white",
      checkStyle: "text-[#1D496C] group-hover:text-[#E4FF4C]"
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-800 overflow-x-clip relative font-sans">
      
      {/* Background blurs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-slate-100 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute top-[40%] right-[-100px] w-[600px] h-[600px] bg-[#429CE4]/5 rounded-full blur-[160px] pointer-events-none -z-10"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center">
                <div className="flex h-12 w-auto items-center justify-center rounded-lg bg-white p-1.5 shadow-md border border-[#285E89]/10 group-hover:scale-105 transition-transform duration-300">
                  <img src="/logo.png" alt="VidyaSanchalan Logo" className="h-8 w-auto max-w-[140px] object-contain" />
                </div>
                <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#FFA600] ring-2 ring-white"></div>
              </div>
              <div>
                <span className="text-lg font-black tracking-tight">
                  <span className="text-[#285E89]">Vidya</span><span className="text-[#FFA600]">Sanchalan</span>
                </span>
                <p className="text-[9px] text-[#285E89]/60 font-bold uppercase tracking-wider mt-0.5">Ecosystem Hub</p>
              </div>
            </Link>

            {/* Nav Menu Desktop */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium text-slate-600 transition-colors hover:text-[#FFA600]">Home</Link>
              <Link href="/features" className="text-sm font-medium text-slate-600 transition-colors hover:text-[#FFA600]">Features</Link>
              <Link href="/modules" className="text-sm font-bold text-[#285E89] relative transition-colors hover:text-[#FFA600]">
                Modules
                <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-gradient-to-r from-[#285E89] to-[#FFA600]"></span>
              </Link>
              <Link href="/#why-choose-us" className="text-sm font-medium text-slate-600 transition-colors hover:text-[#FFA600]">Why Choose Us</Link>
              <Link href="/contact" className="text-sm font-medium text-slate-600 transition-colors hover:text-[#FFA600]">Contact</Link>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="hidden md:inline-flex rounded-lg text-slate-600 hover:bg-slate-100" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" className="rounded-lg bg-[#FFA600] text-white hover:bg-[#ED6708] hover:scale-105 transition-all duration-300" asChild>
                <Link href="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="md:hidden rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 bg-transparent"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3 shadow-md"
          >
            <Link href="/" className="block text-sm font-medium text-slate-600 py-2 hover:text-[#FFA600]" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link href="/features" className="block text-sm font-medium text-slate-600 py-2 hover:text-[#FFA600]" onClick={() => setIsMenuOpen(false)}>Features</Link>
            <Link href="/modules" className="block text-sm font-bold text-[#285E89] py-2 hover:text-[#FFA600]" onClick={() => setIsMenuOpen(false)}>Modules</Link>
            <Link href="/#why-choose-us" className="block text-sm font-medium text-slate-600 py-2 hover:text-[#FFA600]" onClick={() => setIsMenuOpen(false)}>Why Choose Us</Link>
            <Link href="/contact" className="block text-sm font-medium text-slate-600 py-2 hover:text-[#FFA600]" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
              <Button variant="outline" className="w-full text-slate-600 border-slate-200 hover:bg-slate-50 bg-transparent" asChild>
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
              </Button>
              <Button className="w-full bg-[#FFA600] text-white hover:bg-[#ED6708]" asChild>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Main Grid Content */}
      <main className="flex-1">
        
        {/* Modules Hero Section - Background set to BRAND DARK BLUE (1D496C) */}
        <section className="relative py-6 md:py-8 flex items-center bg-[#1D496C] text-white overflow-hidden border-b border-[#285E89]/10">
          
          {/* Decorative ambient lights inside Hero */}
          <div className="absolute top-[-50px] right-[-50px] w-[400px] h-[400px] bg-[#429CE4]/10 rounded-full blur-[100px] pointer-events-none -z-0"></div>
          <div className="absolute bottom-[-100px] left-[-50px] w-[400px] h-[400px] bg-[#FFA600]/10 rounded-full blur-[100px] pointer-events-none -z-0"></div>

          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center text-left">
              
              {/* Left Side Column - ERP Highlights & Content */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-6 space-y-6"
              >
                <div className="space-y-4">
                  <Badge
                    variant="outline"
                    className="rounded-full px-4 py-1.5 border-[#FFA600]/30 bg-[#FFA600]/10 text-[#FFA600] shadow-sm font-bold tracking-wider uppercase text-xs"
                  >
                    SMART SCHOOL ERP MODULES
                  </Badge>
                  <h1 className="text-3.5xl sm:text-4.5xl lg:text-5xl font-black tracking-tight leading-[1.12] text-white">
                    Powerful Modules for <span className="bg-gradient-to-r from-[#429CE4] via-[#E4FF4C] to-[#FFA600] bg-clip-text text-transparent block mt-1.5">Complete School Management</span>
                  </h1>
                  <p className="text-slate-200/90 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
                    VidhyaSanchalan provides all essential school management modules in one powerful platform — from admissions and fees to attendance, examinations, homework, reports, and parent communication.
                  </p>
                </div>

                {/* 2-column feature tag list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                  {[
                    "Admission Management",
                    "Fee Management",
                    "Attendance & Geo Tracking",
                    "Homework & Assignments",
                    "Timetable Management",
                    "Online Examination",
                    "Progress Reports",
                    "Parent & Student Panels"
                  ].map((feat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="flex items-center gap-2.5 bg-[#184467]/40 border border-[#20537c]/60 rounded-xl px-4 py-2.5 hover:bg-[#1f547c] transition-colors"
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E4FF4C]/25 text-[#E4FF4C]">
                        <Check className="h-3 w-3 stroke-[3.5]" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-white leading-tight">{feat}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Button
                    size="lg"
                    className="rounded-xl bg-[#FFA600] text-white shadow-xl shadow-[#FFA600]/10 hover:shadow-2xl hover:shadow-[#FFA600]/20 hover:bg-[#ED6708] px-8 py-6 text-base font-bold transition-all duration-300 transform hover:scale-105"
                    asChild
                  >
                    <a href="#explore-grid">
                      Explore Modules
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-xl border border-white/30 bg-transparent text-white hover:bg-white/10 px-8 py-6 text-base font-bold transition-all duration-300 transform hover:scale-105"
                    asChild
                  >
                    <Link href="/contact">Book Free Demo</Link>
                  </Button>
                </div>
              </motion.div>

              {/* Right Side Column - Premium Mockup Container */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-6 relative flex items-center justify-center min-h-[380px] py-4"
              >
                {/* Underglow shadow overlay */}
                <div className="absolute w-[320px] h-[320px] bg-[#429CE4]/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
                
                {/* Premium Mockup Glass Deck */}
                <div className="relative w-full max-w-[480px] group transition-all duration-500 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#FFA600]/10 to-[#429CE4]/10 rounded-[2.5rem] blur-xl -z-10 group-hover:scale-105 transition-transform"></div>
                  
                  {/* Laptop Mockup frame */}
                  <div className="relative border border-white/15 bg-slate-950/80 backdrop-blur-md p-2 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                    
                    {/* Header bar */}
                    <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/5 bg-slate-900/40">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                      <div className="h-4 w-48 bg-slate-800/60 rounded-md mx-auto border border-white/5 flex items-center justify-center">
                        <span className="text-[9px] text-slate-400 font-bold tracking-tight">vidyasanchalan.com/modules</span>
                      </div>
                    </div>

                    {/* Content Image rendering /module-bg.png */}
                    <div className="w-full aspect-[16/10] overflow-hidden bg-slate-900 relative rounded-b-2xl">
                      <img 
                        src="/moduleg.jpeg" 
                        alt="VidyaSanchalan Modules dashboard mockup"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.fallback-container');
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                      
                      {/* Premium Fallback UI Design inside mockup */}
                      <div className="fallback-container hidden absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 space-y-4 text-center">
                        <div className="h-14 w-14 rounded-full bg-[#FFA600]/10 border border-[#FFA600]/30 text-[#FFA600] flex items-center justify-center shadow-lg">
                          <Sparkles className="h-7 w-7 animate-spin" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white">VidyaSanchalan ERP Modules</h4>
                          <p className="text-[10px] text-slate-400 max-w-[280px]">Automating admissions, fee integrations, face-track attendance, progress records, and parent channels</p>
                        </div>
                        <div className="h-1 bg-gradient-to-r from-[#FFA600] via-[#E4FF4C] to-[#429CE4] w-24 rounded-full"></div>
                      </div>

                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Modules Grid Section */}
        <section id="explore-grid" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            
            {/* Subsection header */}
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <Badge
                variant="outline"
                className="rounded-full px-4 py-1.5 border-[#285E89]/30 bg-[#285E89]/10 text-[#285E89] shadow-sm font-bold tracking-wider uppercase text-xs"
              >
                🛠️ Explore System Modules
              </Badge>
              <h2 className="text-3xl sm:text-4.5xl font-black text-[#1D496C] leading-tight">
                Complete Educational <span className="text-[#285E89]">Ecosystem Grids</span>
              </h2>
              <p className="text-slate-500 font-medium text-sm sm:text-base">
                Discover the fully integrated capabilities of VidyaSanchalan based on strict SRS configurations.
              </p>
            </div>

          {/* Interactive Dynamic Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((mod, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`${idx === 6 ? "md:col-span-2 lg:col-span-3 lg:max-w-2xl lg:mx-auto lg:w-full" : ""}`}
              >
                <Card className={`group relative h-full border border-slate-100 bg-white/75 shadow-md rounded-[2.5rem] p-6.5 sm:p-8 transition-all duration-500 hover:-translate-y-2 cursor-pointer ${mod.hoverStyle}`}>
                  
                  {/* Decorative corner shape */}
                  <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-slate-50/10 rounded-full blur-2xl pointer-events-none group-hover:bg-white/10 transition-colors"></div>

                  <CardContent className="p-0 relative flex flex-col justify-between h-full space-y-6">
                    
                    {/* Header info */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm transition-all duration-500 ${mod.iconBg}`}>
                          {mod.icon}
                        </div>
                        <span className="text-3xl select-none group-hover:scale-110 transition-transform duration-300">
                          {mod.emoji}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-xl sm:text-2xl font-extrabold text-[#1D496C] tracking-tight group-hover:text-white transition-colors duration-300">
                          {mod.title}
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-100 transition-colors duration-300 font-medium">
                          {mod.desc}
                        </p>
                      </div>
                    </div>

                    {/* Points grid */}
                    <div className="border-t border-slate-100/60 pt-5 group-hover:border-white/10 transition-colors">
                      <ul className="space-y-3 text-left">
                        {mod.points.map((point, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-3 text-sm">
                            <CheckCircle2 className={`mt-0.5 h-4.5 w-4.5 stroke-[2.5] shrink-0 transition-colors ${mod.checkStyle}`} />
                            <span className="font-bold leading-relaxed text-slate-700 group-hover:text-slate-100 transition-colors duration-300">
                              {point}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA Block */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-20"
          >
            <Card className="border border-slate-100 bg-gradient-to-r from-[#1D496C] via-[#285E89] to-[#1D496C] text-white shadow-2xl overflow-hidden rounded-[2.5rem] relative">
              <div className="absolute inset-0 bg-grid-white/[0.03] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>
              
              <div className="absolute right-[-40px] top-[-40px] w-[200px] h-[200px] bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

              <CardContent className="p-10 sm:p-14 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div className="space-y-4 max-w-xl">
                  <Badge variant="outline" className="rounded-lg px-3 py-1 border-[#FFA600]/30 bg-[#FFA600]/10 text-[#FFA600] font-bold text-xs tracking-wider uppercase">
                    🚀 Discover ERP Capabilities
                  </Badge>
                  <h2 className="text-2.5xl sm:text-4xl font-black text-white leading-tight">
                    Ready to digitize your institution in Gujarat?
                  </h2>
                  <p className="text-slate-200 text-sm sm:text-base font-medium">
                    Contact our educational specialists today to deploy the modules package tailor-made for your school setup.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="rounded-xl bg-[#FFA600] text-white shadow-xl shadow-[#FFA600]/10 hover:shadow-2xl hover:shadow-[#FFA600]/20 hover:bg-[#ED6708] px-8 py-6 text-base font-bold transition-all duration-300 transform hover:scale-105"
                    asChild
                  >
                    <Link href="/contact">
                      Request a Demo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-xl border border-white/30 bg-transparent text-white hover:bg-white/10 px-8 py-6 text-base font-bold transition-all duration-300 transform hover:scale-105"
                    asChild
                  >
                    <Link href="/">Back to Homepage</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </section>
    </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white text-slate-600">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5 text-left">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-16 w-auto flex items-center justify-center rounded-xl bg-white p-2 shadow-sm border border-[#285E89]/10">
                  <img src="/logo.png" alt="VidyaSanchalan Logo" className="h-12 w-auto max-w-[160px] object-contain" />
                </div>
                <div>
                  <span className="text-xl font-black tracking-tight"><span className="text-[#285E89]">Vidya</span><span className="text-[#FFA600]">Sanchalan</span></span>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">School Management</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 max-w-md leading-relaxed">
                Complete school management solution based on comprehensive SRS documentation. Automating administrative, academic, and operational tasks.
              </p>
            </div>

            {footerLinks.map((section, i) => (
              <div key={i}>
                <h3 className="font-semibold text-slate-900 mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link href={link === "Modules" ? "/modules" : link === "Contact" ? "/contact" : "#"} className="text-sm text-slate-500 hover:text-[#285E89] transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200/80 my-8"></div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-slate-500">© 2026 VidyaSanchalan. All rights reserved. Based on School Management SRS v1.0</p>
            <div className="flex gap-6 font-bold">
              <Link href="#" className="text-slate-500 hover:text-[#285E89] transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-slate-500 hover:text-[#285E89] transition-colors">Terms of Service</Link>
              <Link href="#" className="text-slate-500 hover:text-[#285E89] transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Lagging Cursor Follower */}
      {!isTouchDevice && (
        <motion.div
          className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-[#FFA600] bg-[#FFA600]/10 pointer-events-none z-[9999] shadow-[0_0_12px_rgba(255,166,0,0.4)]"
          style={{
            x: cursorX,
            y: cursorY,
          }}
        />
      )}

    </div>
  );
}

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
