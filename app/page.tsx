  "use client";

  import { useEffect, useState } from "react";
  import Link from "next/link";
  import { AnimatePresence, motion } from "framer-motion";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import { Separator } from "@/components/ui/separator";
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

    const handleGetStarted = () => {
      window.location.href = "/signup";
    };

    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#F8FAFC] via-white to-[#EEF2FF]">

        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-[#34D399]/20 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#3730A3] text-white shadow-md">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#34D399] ring-2 ring-white"></div>
                </div>
                <div>
                  <span className="text-xl font-bold text-[#0F172A]">Edu<span className="text-[#4F46E5]">Manage</span></span>
                  <p className="text-xs text-[#475569]">School Management System</p>
                </div>
              </div>
              
              <nav className="hidden md:flex items-center gap-8">
                {["Features", "Modules", "About", "Pricing", "Contact"].map((item) => (
                  <Link 
                    key={item} 
                    href={`#${item.toLowerCase()}`} 
                    className="group relative text-sm font-medium text-[#475569] transition-colors hover:text-[#4F46E5]"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-[#4F46E5] to-[#34D399] transition-all group-hover:w-full"></span>
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden md:inline-flex rounded-lg text-[#475569] hover:bg-[#EEF2FF] hover:text-[#4F46E5]" 
                  asChild
                >
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button 
                  size="sm" 
                  className="rounded-lg bg-[#4F46E5] text-white shadow-md hover:bg-[#3730A3] transition-all duration-300" 
                  onClick={handleGetStarted}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
                <Button variant="outline" size="icon" className="md:hidden rounded-lg border-[#34D399]/30 text-[#4F46E5]">
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Admission Marquee */}
        {formLink && (
          <div className="sticky top-16 z-40 overflow-hidden bg-blue-600 py-2 border-b border-blue-700/20 shadow-sm">
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
                    className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/20 underline decoration-white/40 underline-offset-4 transition-all"
                  >
                    {formLink}
                  </a>
                </div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-24">
          {/* Soft background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[#34D399]/10 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#4F46E5]/5 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#EEF2FF] blur-3xl"></div>
          </div>
          
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <Badge 
                  variant="outline" 
                  className="rounded-lg px-4 py-2 border-[#34D399] bg-white/80 text-[#4F46E5] shadow-sm"
                >
                  <Sparkles className="mr-2 h-3 w-3 text-[#4F46E5]" />
                  Complete School Management Solution
                </Badge>
                
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  <span className="text-[#0F172A]">Streamline Your School</span>
                  <br />
                  <span className="text-[#4F46E5]">Operations with</span>
                  <br />
                  <span className="bg-gradient-to-r from-[#4F46E5] to-[#34D399] bg-clip-text text-transparent">
                    EduManage
                  </span>
                </h1>
                
                <p className="text-lg text-[#475569] max-w-lg leading-relaxed">
                  An all-in-one platform automating admissions, attendance, fees, exams, 
                  and communication. Built for admins, teachers, students, and parents.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    className="rounded-lg bg-[#4F46E5] text-white shadow-md hover:bg-[#3730A3] transition-all duration-300 transform hover:scale-105"
                    onClick={handleGetStarted}
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="rounded-lg border-2 border-[#34D399] bg-white text-[#4F46E5] hover:bg-[#EEF2FF]"
                    asChild
                  >
                    <Link href="/login">Watch Demo</Link>
                  </Button>
                </div>

                {/* Trust badges */}
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Avatar key={i} className="h-10 w-10 border-2 border-white ring-2 ring-[#34D399]/30">
                        <AvatarImage src={`https://i.pravatar.cc/40?img=${i}`} />
                        <AvatarFallback className="bg-gradient-to-br from-[#4F46E5] to-[#34D399] text-white">U{i}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-[#0F172A]">500+</span>{" "}
                    <span className="text-[#475569]">schools trust us</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-[#34D399] text-[#34D399]" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Users, label: "Active Users", value: "10K+", color: "from-[#4F46E5] to-[#3730A3]", bg: "bg-[#EDE9FE]" },
                  { icon: BookOpen, label: "Students", value: "50K+", color: "from-[#34D399] to-[#059669]", bg: "bg-[#F5F3FF]" },
                  { icon: TrendingUp, label: "Efficiency", value: "95%", color: "from-[#475569] to-[#4338CA]", bg: "bg-[#ECFDF5]" },
                  { icon: Award, label: "Satisfaction", value: "4.9/5", color: "from-[#4F46E5] to-[#34D399]", bg: "bg-[#EEF2FF]" },
                ].map((stat, i) => (
                  <Card key={i} className={`group border-0 ${stat.bg} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}>
                    <CardContent className="p-6">
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white mb-4 shadow-sm`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <p className="text-2xl font-bold text-[#0F172A]">{stat.value}</p>
                      <p className="text-sm text-[#475569]">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge className="rounded-lg px-4 py-2 bg-[#EEF2FF] text-[#4F46E5] border-0 mb-4">
                <Sparkles className="mr-2 h-3 w-3 text-[#4F46E5]" />
                Features
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-[#0F172A]">
                Everything You Need in One Place
              </h2>
              <p className="text-[#475569]">
                Comprehensive features based on your SRS requirements, designed for efficiency and ease of use
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="group border-0 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                >
                  <CardHeader>
                    <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} text-white shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl text-[#0F172A]">{feature.title}</CardTitle>
                    <CardDescription className="text-[#475569]">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      {feature.points.map((point, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle2 className={`h-4 w-4 ${feature.checkColor} shrink-0`} />
                          <span className="text-[#475569]">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Role-Based Modules */}
        <section id="modules" className="py-20 bg-[#F8FAFC]">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <Badge className="rounded-lg px-4 py-2 bg-white text-[#4F46E5] border-0 mb-4">
                <Users className="mr-2 h-3 w-3 text-[#4F46E5]" />
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
              <Card className="group border-0 bg-gradient-to-br from-[#F5F3FF] to-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
                <div className="absolute top-0 right-0 h-40 w-40 bg-[#34D399]/10 rounded-full blur-3xl -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-700"></div>
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#3730A3] text-white shadow-sm">
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
                      <div key={i} className="rounded-lg bg-[#F8FAFC] p-3 text-sm font-medium text-[#4F46E5] border border-[#34D399]/20">
                        {category}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="rounded-lg bg-[#EDE9FE] text-[#4F46E5] border-0">RTE Reimbursement</Badge>
                    <Badge className="rounded-lg bg-[#F5F3FF] text-[#34D399] border-0">Late Fee Penalties</Badge>
                    <Badge className="rounded-lg bg-[#ECFDF5] text-[#475569] border-0">Discount Management</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Inventory & Library */}
              <Card className="group border-0 bg-gradient-to-br from-[#EDE9FE] to-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
                <div className="absolute top-0 right-0 h-40 w-40 bg-[#4F46E5]/10 rounded-full blur-3xl -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-700"></div>
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-[#34D399] to-[#059669] text-white shadow-sm">
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
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/80 hover:bg-white transition-colors border border-[#34D399]/10">
                        <CheckCircle2 className="h-4 w-4 text-[#34D399] shrink-0" />
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
            <Card className="border-0 bg-gradient-to-r from-[#4F46E5] to-[#3730A3] text-white shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>
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
              <Badge className="rounded-lg px-4 py-2 bg-white text-[#4F46E5] border-0 mb-4">
                <Star className="mr-2 h-3 w-3 fill-[#34D399] text-[#34D399]" />
                Testimonials
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-[#0F172A]">
                Loved by Educators
              </h2>
              <p className="text-[#475569]">
                See what schools are saying about EduManage
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
                        <Star key={i} className="h-4 w-4 fill-[#34D399] text-[#34D399]" />
                      ))}
                    </div>
                    <p className="text-[#475569] mb-4">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-[#34D399]/30">
                        <AvatarFallback className="bg-gradient-to-br from-[#4F46E5] to-[#34D399] text-white">
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
            <Card className="border-0 bg-gradient-to-br from-[#EEF2FF] to-white shadow-xl overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-grid-[#4F46E5]/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>
              <CardContent className="p-16 text-center relative">
                <div className="max-w-2xl mx-auto space-y-6">
                  <Badge variant="outline" className="rounded-lg px-4 py-2 border-[#34D399] bg-white text-[#4F46E5]">
                    <Rocket className="mr-2 h-3 w-3 text-[#4F46E5]" />
                    Get Started Today
                  </Badge>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-[#0F172A]">
                    Ready to Transform Your School Management?
                  </h2>
                  <p className="text-[#475569] text-lg">
                    Join thousands of schools already using EduManage to streamline their operations
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <Button 
                      size="lg" 
                      className="rounded-lg bg-[#4F46E5] text-white shadow-md hover:bg-[#3730A3] transition-all duration-300 transform hover:scale-105" 
                      onClick={handleGetStarted}
                    >
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="rounded-lg border-2 border-[#34D399] bg-white text-[#4F46E5] hover:bg-[#EEF2FF]"
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
        <footer className="border-t border-[#34D399]/20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#3730A3] text-white shadow-md">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-[#0F172A]">EduManage</span>
                    <p className="text-xs text-[#475569]">School Management System</p>
                  </div>
                </div>
                <p className="text-sm text-[#475569] max-w-md leading-relaxed">
                  Complete school management solution based on comprehensive SRS documentation. 
                  Automating administrative, academic, and operational tasks.
                </p>
                <div className="flex gap-3 mt-6">
                  {[
                    { icon: <Twitter />, color: "from-[#4F46E5] to-[#3730A3]" },
                    { icon: <Github />, color: "from-[#34D399] to-[#059669]" },
                    { icon: <Linkedin />, color: "from-[#475569] to-[#4338CA]" },
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
                        <Link href="#" className="text-sm text-[#475569] hover:text-[#4F46E5] transition-colors">
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <Separator className="my-8 bg-[#34D399]/20" />
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
              <p className="text-[#475569]">© 2025 EduManage. All rights reserved. Based on School Management SRS v1.0</p>
              <div className="flex gap-6">
                <Link href="#" className="text-[#475569] hover:text-[#4F46E5] transition-colors">Privacy Policy</Link>
                <Link href="#" className="text-[#475569] hover:text-[#4F46E5] transition-colors">Terms of Service</Link>
                <Link href="#" className="text-[#475569] hover:text-[#4F46E5] transition-colors">Cookie Policy</Link>
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
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    );
  }

  function Linkedin() {
    return (
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    );
  }

  // Data arrays
  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Student Management",
      description: "Complete student lifecycle management from admission to alumni",
      color: "from-[#4F46E5] to-[#3730A3]",
      checkColor: "text-[#34D399]",
      points: ["Online & offline admissions", "Document management", "Transfer certificates", "Alumni tracking"]
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Attendance System",
      description: "Multi-mode attendance with real-time parent notifications",
      color: "from-[#34D399] to-[#059669]",
      checkColor: "text-[#4F46E5]",
      points: ["Biometric integration", "SMS/Email alerts", "Leave management", "Attendance reports"]
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Fee Management",
      description: "Comprehensive financial management with RTE compliance",
      color: "from-[#F59E0B] to-[#D97706]",
      checkColor: "text-[#34D399]",
      points: ["Online payment gateway", "RTE reimbursement", "Discount management", "Receipt generation"]
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Exam & Results",
      description: "Complete examination management with automated report cards",
      color: "from-[#EC4899] to-[#BE185D]",
      checkColor: "text-[#4F46E5]",
      points: ["Exam scheduling", "Mark entry system", "Report card generation", "Rank & merit lists"]
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Communication Hub",
      description: "Multi-channel communication between all stakeholders",
      color: "from-[#06B6D4] to-[#0891B2]",
      checkColor: "text-[#34D399]",
      points: ["SMS & email notifications", "Parent portal app", "Circular management", "Event announcements"]
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Security & Access",
      description: "Role-based access control with comprehensive audit trails",
      color: "from-[#8B5CF6] to-[#6D28D9]",
      checkColor: "text-[#4F46E5]",
      points: ["Role-based permissions", "Activity logs", "Data encryption", "2FA support"]
    }
  ];

  const roles = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Administrator",
      role: "Full System Control",
      color: "from-[#4F46E5] to-[#3730A3]",
      features: ["School configuration", "User management", "Financial oversight", "Report generation", "System audit logs"]
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Teacher",
      role: "Academic Management",
      color: "from-[#34D399] to-[#059669]",
      features: ["Attendance marking", "Mark entry", "Assignment management", "Parent communication", "Timetable view"]
    },
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: "Student",
      role: "Learning Portal",
      color: "from-[#F59E0B] to-[#D97706]",
      features: ["View attendance", "Check results", "Fee payment", "Download materials", "Event calendar"]
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Parent",
      role: "Child Monitoring",
      color: "from-[#EC4899] to-[#BE185D]",
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
      links: ["Features", "Modules", "Pricing", "Integrations", "Changelog"]
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

  