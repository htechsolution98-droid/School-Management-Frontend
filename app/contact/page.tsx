"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";
import {
  GraduationCap,
  ArrowRight,
  Menu,
  Star,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  Building,
  User,
  Users,
  MessageSquare,
  Sparkles
} from "lucide-react";

export default function ContactPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeFaqIdx, setActiveFaqIdx] = useState<number | null>(null);  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    schoolName: "",
    city: "",
    state: "",
    inquiryType: "General Inquiry",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const serviceId = "service_ps6v4lo";
      const templateId = "template_bkhyngf";
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "";

      // Send via EmailJS
      await emailjs.send(
        serviceId,
        templateId,
        {
          fullName: formData.fullName,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          schoolName: formData.schoolName,
          city: formData.city,
          state: formData.state,
          inquiryType: formData.inquiryType,
          message: formData.message,
        },
        publicKey
      );

      setIsSubmitted(true);
      toast.success("Thank you! Our team will contact you shortly.");
    } catch (error) {
      console.error("EmailJS error:", error);
      toast.error("Failed to submit inquiry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-800 overflow-x-clip relative font-sans">

      {/* Dynamic Background Blurs */}
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
                <span className="text-lg font-black mapping-tight">
                  <span className="text-[#285E89]">Vidya</span><span className="text-[#FFA600]">Sanchalan</span>
                </span>
                <p className="text-[9px] text-[#285E89]/60 font-bold uppercase mapping-wider mt-0.5">Contact Desk</p>
              </div>
            </Link>

            {/* Nav Menu Desktop */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium text-slate-600 transition-colors hover:text-[#FFA600]">Home</Link>
              <Link href="/features" className="text-sm font-medium text-slate-600 transition-colors hover:text-[#FFA600]">Features</Link>
              <Link href="/modules" className="text-sm font-medium text-slate-600 transition-colors hover:text-[#FFA600]">Modules</Link>
              <Link href="/contact" className="text-sm font-bold text-[#285E89] relative transition-colors hover:text-[#FFA600]">
                Contact Us
                <span className="absolute -bottom-1 left-0 h-0.5 w-full bg-gradient-to-r from-[#285E89] to-[#FFA600]"></span>
              </Link>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                asChild
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                size="sm"
                className="rounded-lg bg-[#FFA600] text-white shadow-md hover:bg-[#ED6708] hover:scale-105 transition-all duration-300"
                asChild
              >
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
            <Link href="/modules" className="block text-sm font-medium text-slate-600 py-2 hover:text-[#FFA600]" onClick={() => setIsMenuOpen(false)}>Modules</Link>
            <Link href="/contact" className="block text-sm font-bold text-[#285E89] py-2 hover:text-[#FFA600]" onClick={() => setIsMenuOpen(false)}>Contact Us</Link>
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
      <main className="flex-1 pt-8 md:pt-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            {/* LEFT SIDE - CONTACT FORM */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 bg-[#F8FAFC] border border-slate-100 p-6 sm:p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden"
            >

              {/* Decorative accent element */}
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#429CE4]/5 rounded-full blur-2xl pointer-events-none"></div>

              <div className="space-y-4 mb-8">
                <Badge
                  variant="outline"
                  className="rounded-full px-4 py-1.5 border-[#FFA600]/30 bg-[#FFA600]/10 text-[#FFA600] font-bold mapping-wider uppercase text-xs"
                >
                  ✉️ Connect With Us
                </Badge>
                <h1 className="text-2.5xl sm:text-4xl font-extrabold text-[#1D496C] mapping-tight leading-tight">
                  Get in Touch with VidhyaSanchalan
                </h1>
                <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed">
                  Have questions or want to digitize your school? Fill out the form and our team will contact you shortly.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form
                    key="contact-form"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <Label htmlFor="fullName" className="text-xs sm:text-sm font-bold text-[#1D496C]">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                          <Input
                            id="fullName"
                            type="text"
                            required
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="pl-10.5 h-12 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 text-slate-800 shadow-sm focus:border-[#FFA600] focus:ring-2 focus:ring-[#FFA600]/10 transition-all"
                          />
                        </div>
                      </div>

                      {/* Email Address */}
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs sm:text-sm font-bold text-[#1D496C]">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                          <Input
                            id="email"
                            type="email"
                            required
                            placeholder="Enter your email address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="pl-10.5 h-12 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 text-slate-800 shadow-sm focus:border-[#FFA600] focus:ring-2 focus:ring-[#FFA600]/10 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Mobile Number */}
                      <div className="space-y-1.5">
                        <Label htmlFor="mobileNumber" className="text-xs sm:text-sm font-bold text-[#1D496C]">Mobile Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                          <Input
                            id="mobileNumber"
                            type="tel"
                            required
                            placeholder="Enter your mobile number"
                            value={formData.mobileNumber}
                            onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                            className="pl-10.5 h-12 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 text-slate-800 shadow-sm focus:border-[#FFA600] focus:ring-2 focus:ring-[#FFA600]/10 transition-all"
                          />
                        </div>
                      </div>

                      {/* School Name */}
                      <div className="space-y-1.5">
                        <Label htmlFor="schoolName" className="text-xs sm:text-sm font-bold text-[#1D496C]">School Name *</Label>
                        <div className="relative">
                          <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                          <Input
                            id="schoolName"
                            type="text"
                            required
                            placeholder="Enter your school name"
                            value={formData.schoolName}
                            onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                            className="pl-10.5 h-12 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 text-slate-800 shadow-sm focus:border-[#FFA600] focus:ring-2 focus:ring-[#FFA600]/10 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* City */}
                      <div className="space-y-1.5">
                        <Label htmlFor="city" className="text-xs sm:text-sm font-bold text-[#1D496C]">City *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                          <Input
                            id="city"
                            type="text"
                            required
                            placeholder="Enter your city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="pl-10.5 h-12 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 text-slate-800 shadow-sm focus:border-[#FFA600] focus:ring-2 focus:ring-[#FFA600]/10 transition-all"
                          />
                        </div>
                      </div>

                      {/* State */}
                      <div className="space-y-1.5">
                        <Label htmlFor="state" className="text-xs sm:text-sm font-bold text-[#1D496C]">State *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                          <Input
                            id="state"
                            type="text"
                            required
                            placeholder="Enter your state"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="pl-10.5 h-12 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 text-slate-800 shadow-sm focus:border-[#FFA600] focus:ring-2 focus:ring-[#FFA600]/10 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Inquiry Type Dropdown */}
                    <div className="space-y-1.5">
                      <Label htmlFor="inquiryType" className="text-xs sm:text-sm font-bold text-[#1D496C]">Inquiry Type *</Label>
                      <div className="relative">
                        <select
                          id="inquiryType"
                          value={formData.inquiryType}
                          onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm focus:border-[#FFA600] focus:ring-2 focus:ring-[#FFA600]/10 transition-all appearance-none cursor-pointer text-sm font-medium"
                        >
                          {["General Inquiry", "Request a Demo", "Pricing & Quotation", "Support Request", "Other"].map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Message Box */}
                    <div className="space-y-1.5">
                      <Label htmlFor="message" className="text-xs sm:text-sm font-bold text-[#1D496C]">Message *</Label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                        <textarea
                          id="message"
                          required
                          rows={4}
                          placeholder="Write your requirement"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full pl-10.5 py-3 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 text-slate-800 shadow-sm focus:border-[#FFA600] focus:ring-2 focus:ring-[#FFA600]/10 transition-all text-sm font-medium"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full h-12 rounded-xl bg-gradient-to-r from-[#1D496C] via-[#285E89] to-[#429CE4] text-white font-bold text-sm shadow-md hover:shadow-lg hover:from-[#153957] hover:to-[#2e7ca8] active:scale-[0.98] transition-all duration-200"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Submitting Inquiry…
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            Submit Inquiry
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        )}
                      </Button>
                    </div>

                  </motion.form>
                ) : (
                  <motion.div
                    key="success-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 px-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col items-center justify-center gap-4"
                  >
                    <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 shadow-sm mb-2">
                      <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#1D496C]">Thank you!</h2>
                    <p className="text-sm font-semibold text-slate-500 max-w-sm leading-relaxed">
                      Your inquiry has been successfully sent. One of our coordinators will get in touch with you shortly at <span className="font-bold text-[#FFA600]">{formData.email}</span>.
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                      className="mt-4 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      Send another inquiry
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* RIGHT SIDE - BRANDING & CONTACT INFO */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5 space-y-8"
            >
              {/* Headline Card */}
              <div className="space-y-4">
                <Badge
                  variant="outline"
                  className="rounded-full px-4.5 py-1.5 border-[#429CE4]/30 bg-[#429CE4]/10 text-[#429CE4] shadow-sm font-bold mapping-wider uppercase text-xs"
                >
                  🚀 Let's Innovate Together
                </Badge>
                <h2 className="text-3xl sm:text-4.5xl font-extrabold text-[#1D496C] mapping-tight leading-[1.12]">
                  Let’s Build a <span className="text-[#285E89]">Smarter School</span> Together
                </h2>
                <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed">
                  VidhyaSanchalan helps schools manage admission, fees, attendance, exams, homework, announcements, progress reports, and parent communication from one powerful platform.
                </p>
              </div>

              {/* Ultra-Premium Glassmorphic Contact Details Box (using Brand Colors) */}
              <Card className="border border-slate-100 bg-[#F8FAFC] shadow-2xl rounded-[2.5rem] overflow-hidden relative group cursor-pointer hover:shadow-slate-200/50 transition-all duration-300">

                {/* Glow accent */}
                <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-gradient-to-tr from-[#1D496C]/10 to-[#FFA600]/10 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform"></div>

                <CardContent className="p-8 sm:p-10 relative space-y-6">

                  {/* Contact Info Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-200/60">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1D496C] to-[#285E89] text-white flex items-center justify-center shadow-md">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-[#1D496C] leading-none mb-0.5">Contact Details</h4>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase mapping-wider">Get in Touch</p>
                    </div>
                  </div>

                  {/* Info points */}
                  <div className="space-y-5">
                    {/* Email */}
                    <div className="flex gap-4 group/item">
                      <div className="w-10 h-10 rounded-full border border-slate-200/80 bg-white flex items-center justify-center text-[#1D496C] shadow-sm shrink-0 group-hover/item:bg-[#1D496C] group-hover/item:text-white transition-colors duration-300">
                        <Mail className="h-4.5 w-4.5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase mapping-wider block">Email Us</span>
                        <a href="mailto:info@vidhyasanchalan.com" className="text-sm font-bold text-slate-800 hover:text-[#FFA600] transition-colors leading-tight">
                          info@vidhyasanchalan.com
                        </a>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex gap-4 group/item">
                      <div className="w-10 h-10 rounded-full border border-slate-200/80 bg-white flex items-center justify-center text-[#285E89] shadow-sm shrink-0 group-hover/item:bg-[#285E89] group-hover/item:text-white transition-colors duration-300">
                        <Phone className="h-4.5 w-4.5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase mapping-wider block">Call Us</span>
                        <a href="tel:+91XXXXXXXXXX" className="text-sm font-bold text-slate-800 hover:text-[#FFA600] transition-colors leading-tight">
                          +91 XXXXX XXXXX
                        </a>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex gap-4 group/item">
                      <div className="w-10 h-10 rounded-full border border-slate-200/80 bg-white flex items-center justify-center text-[#FFA600] shadow-sm shrink-0 group-hover/item:bg-[#FFA600] group-hover/item:text-white transition-colors duration-300">
                        <MapPin className="h-4.5 w-4.5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase mapping-wider block">Our Location</span>
                        <span className="text-sm font-bold text-slate-800 leading-tight">
                          Ahmedabad, Gujarat
                        </span>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Extra Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Free 14-Day Setup",
                  "Dedicated Support Team",
                  "No Hidden Modules Fees",
                  "Double Security Audited"
                ].map((highlight, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 shadow-sm hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E4FF4C]/30 text-[#6A7626]">
                      <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-700">{highlight}</span>
                  </div>
                ))}
              </div>

            </motion.div>

          </div>
        </div>

        {/* FAQ Section */}
        <section id="faq" className="pb-16 sm:pb-24 bg-white border-t border-slate-100 relative z-10">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge className="rounded-lg px-4 py-2 bg-[#1D496C]/5 text-[#1D496C] border-0 mb-4 font-bold">
                ❓ FAQs
              </Badge>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl mb-4 text-[#0F172A]">
                Frequently Asked Questions
              </h2>
              <p className="text-[#475569] font-medium">
                Find answers to common questions about the VidyaSanchalan School ERP Platform
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: "What is VidyaSanchalan and how does it benefit schools?",
                  answer: "VidyaSanchalan is an all-in-one Smart School ERP system designed to digitize admissions, fees, timetables, examinations, progress reports, announcements, and tracking operations. It creates role-based access for Trustees, Principals, Clerks, Teachers, Students, and Parents, streamlining daily activities."
                },
                {
                  question: "Can parents track their child's attendance and academic progress?",
                  answer: "Yes! The dedicated Parent/Guardian panel provides real-time access to student attendance, homework completion, exam marks, progress tracking charts, fee dues, and direct school announcements."
                },
                {
                  question: "How secure is school and student data on VidyaSanchalan?",
                  answer: "We prioritize data privacy and security. Our system runs on ISO 27001-certified secure servers, implementing fully encrypted database logs and restricted role-based authorization to protect sensitive records."
                },
                {
                  question: "Does it support offline fee collection and online gateways?",
                  answer: "Absolutely. VidyaSanchalan supports a hybrid model allowing clerks to log offline cash/cheque fee collections as well as enabling parents to pay online securely via integrated payment gateways with immediate receipt generation."
                },
                {
                  question: "How does the Geo Attendance tracking work for staff?",
                  answer: "The Geo Attendance feature allows teachers and administration staff to mark attendance when they are physically inside designated GPS school campus coordinates, preventing proxy entries and ensuring accurate attendance tracking."
                }
              ].map((faq, index) => {
                const isOpen = activeFaqIdx === index;
                return (
                  <div
                    key={index}
                    className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    <button
                      onClick={() => setActiveFaqIdx(isOpen ? null : index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <span className="text-base sm:text-lg font-extrabold text-[#1D496C] transition-colors duration-300">
                        {faq.question}
                      </span>
                      <span className={`w-8 h-8 rounded-full bg-[#1D496C]/5 flex items-center justify-center text-[#1D496C] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                        <ChevronDown className="h-4 w-4 stroke-[2.5]" />
                      </span>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: isOpen ? "auto" : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-sm sm:text-base font-medium text-slate-500 leading-relaxed border-t border-slate-100/50 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer (WHITE/LIGHT BACKGROUND) */}
      <footer className="border-t border-slate-200 bg-white text-slate-600">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5 text-left">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-16 w-auto flex items-center justify-center rounded-xl bg-white p-2 shadow-sm border border-[#285E89]/10">
                  <img src="/logo.png" alt="VidyaSanchalan Logo" className="h-12 w-auto max-w-[160px] object-contain" />
                </div>
                <div>
                  <span className="text-xl font-black mapping-tight"><span className="text-[#285E89]">Vidya</span><span className="text-[#FFA600]">Sanchalan</span></span>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mapping-wider mt-0.5">School Management</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                Complete school management solution based on comprehensive SRS documentation.
                Automating administrative, academic, and operational tasks.
              </p>
              <div className="flex gap-3 mt-6">
                {[
                  { icon: <Twitter />, color: "from-[#285E89] to-[#1D496C]", href: "#" },
                  { icon: <Github />, color: "from-[#6A7626] to-[#4F581D]", href: "#" },
                  { icon: <Linkedin />, color: "from-[#429CE4] to-[#285E89]", href: "#" },
                ].map((social, i) => (
                  <a key={i} href={social.href} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="icon"
                      className={`rounded-lg bg-gradient-to-br ${social.color} text-white hover:shadow-md transition-all duration-300 hover:scale-110`}
                    >
                      {social.icon}
                    </Button>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase mapping-wider">Product</h3>
              <ul className="space-y-3">
                {[
                  { label: "Features", href: "/features" },
                  { label: "Modules", href: "/modules" },
                  { label: "Contact Us", href: "/contact" },
                  { label: "Get Started", href: "/login" },
                ].map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} className="text-sm text-slate-500 hover:text-[#285E89] transition-colors font-medium">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase mapping-wider">Company</h3>
              <ul className="space-y-3">
                {[
                  { label: "Why Choose Us", href: "/#why-choose-us" },
                  { label: "FAQs", href: "#faq" },
                  { label: "Privacy Policy", href: "/privacy-policy" },
                  { label: "Terms of Service", href: "/terms-and-conditions" },
                  { label: "Cookie Policy", href: "#" },
                ].map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} className="text-sm text-slate-500 hover:text-[#285E89] transition-colors font-medium">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase mapping-wider">Contact</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#FFA600] mt-0.5">📍</span>
                  <span className="text-sm text-slate-500 leading-snug">Naroda, Gujarat, India</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#FFA600]">📞</span>
                  <a href="tel:+919876543210" className="text-sm text-slate-500 hover:text-[#285E89] transition-colors font-medium">+91 98765 43210</a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#FFA600]">✉️</span>
                  <a href="mailto:support@h-techsolutions.in" className="text-sm text-slate-500 hover:text-[#285E89] transition-colors font-medium">support@h-techsolutions.in</a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#FFA600]">🌐</span>
                  <a href="https://h-techsolutions.in" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-[#285E89] transition-colors font-medium">h-techsolutions.in</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200/80 my-8"></div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-slate-500">© 2026 VidyaSanchalan. All rights reserved. Built by H-Tech Solutions.</p>
          </div>
        </div>
      </footer>



    </div>
  );
}

// Social icons helpers for footer
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
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0h.003z" />
    </svg>
  );
}

const getLinkHref = (link: string) => {
  switch (link) {
    case "Modules": return "/modules";
    case "Contact": return "/contact";
    case "About Us": return "https://h-techsolutions.in/aboutus";
    case "Service": return "https://h-techsolutions.in/service";
    case "Gallery": return "https://h-techsolutions.in/gallery";
    default: return "#";
  }
};

const footerLinks = [
  {
    title: "Product",
    links: ["Modules", "Pricing", "Integrations", "Changelog"]
  },
  {
    title: "Company",
    links: ["About Us", "Service", "Gallery", "Blog", "Contact"]
  }
];
