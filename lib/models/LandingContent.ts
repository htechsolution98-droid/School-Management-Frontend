import mongoose, { Schema } from "mongoose";

// ==========================================
// 1. Landing Page General Settings Schema
// ==========================================
const LandingSettingsSchema = new Schema({
  heroBadge: { type: String, default: "★ Smart School ERP Platform" },
  heroTitle: { type: String, default: "VidhyaSanchalan" },
  heroSubtitle: { type: String, default: "Complete Smart School Management System" },
  heroDescription: { type: String, default: "Manage the complete school journey — from student admission to leaving certificate — with powerful digital panels for Trustees, Principals, Clerks, Teachers, Students, and Guardians." },
  heroImage: { type: String, default: "/sms hero.jpg" },
  heroImages: { type: [String], default: ["/sms hero.jpg"] },
  satisfactionRate: { type: Number, default: 99.8 },
  stats: [
    {
      label: { type: String, required: true },
      target: { type: Number, required: true },
      suffix: { type: String, default: "+" },
      iconName: { type: String, required: true } // lucide icon name
    }
  ],
  whyChooseUs: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      iconName: { type: String, required: true }, // lucide icon name
      color: { type: String, default: "text-[#5D3FD3]" } // text/border color config
    }
  ],
  aboutBadge: { type: String, default: "★ About VidhyaSanchalan" },
  aboutTitle: { type: String, default: "One Platform for Complete School Management" },
  aboutTitleHighlight: { type: String, default: "Complete School" },
  aboutDescription: { type: String, default: "VidhyaSanchalan is an advanced school ERP and management system designed to simplify daily school operations. It helps schools manage admissions, fees, staff, attendance, examinations, homework, reports, announcements, and student progress through separate role-based panels." },
  aboutQuote: { type: String, default: "The system supports both online and offline processes and provides transparency between school staff, students, and parents." },
  aboutImage: { type: String, default: "/about sms.jpg" },
  aboutImages: { type: [String], default: ["/about sms.jpg"] },
  aboutHighlights: [
    {
      title: { type: String, required: true },
      desc: { type: String, required: true }
    }
  ],
  whyBadge: { type: String, default: "Why Choose Us?" },
  whyTitle: { type: String, default: "VidyaSanchalan is a revolution in education management" },
  whyTitleHighlight: { type: String, default: "revolution" },
  whyPills: { type: [String], default: ["100% Free Forever", "Instant Insights", "Limitless Scale"] },
  whyImageMain: { type: String, default: "/why chooseus.jpeg" },
  whyImagesMain: { type: [String], default: ["/why chooseus.jpeg"] },
  whyImageLeft: { type: String, default: "/why choose us.jpg" },
  whyImageBottomLeft: { type: String, default: "/progress report.jpeg" },
  whyImageBottomRight: { type: String, default: "/admission (1).jpg" },
  whyCollageCards: [
    {
      label: { type: String, required: true },
      image: { type: String, required: true },
      position: { type: String, enum: ["behind-left", "bottom-left", "bottom-right"], required: true }
    }
  ],
  mobileScreens: [
    {
      title: { type: String, required: true },
      image: { type: String, required: true }, // Base64 string from device
      description: { type: String, required: true }
    }
  ],
  mobileStudent: {
    badge: { type: String, default: "Student Application" },
    title: { type: String, default: "Learn Smarter, Grow Faster" },
    desc: { type: String, default: "Designed to keep students organized, motivated, and engaged." },
    points: { type: [String], default: ["Homework Tracker", "Online Examination", "Student Timetable", "Academic Analytics"] }
  },
  mobileParent: {
    badge: { type: String, default: "Parent Companion App" },
    title: { type: String, default: "Your Child's Progress, In Your Pocket" },
    desc: { type: String, default: "Stay intimately connected with your child's educational journey." },
    points: { type: [String], default: ["Real-Time Geo-Attendance", "Digital Fee Desk", "Direct Parent-Teacher Chats", "Comprehensive Report Cards"] }
  },
  mobileTeacher: {
    badge: { type: String, default: "Teacher Dashboard" },
    title: { type: String, default: "Focus on Teaching, Automate the Rest" },
    desc: { type: String, default: "Powerful admin tools in the palm of your hand." },
    points: { type: [String], default: ["Geo-Fenced Biometric Attendance", "Mobile Grading Engine", "Broadcaster Bulletin", "Substitution Alerts"] }
  },
  mobileCapabilities: [
    {
      title: { type: String, required: true },
      desc: { type: String, required: true },
      iconName: { type: String, required: true }
    }
  ],
  moduleHeroBadge: { type: String, default: "SMART SCHOOL ERP MODULES" },
  moduleHeroTitle: { type: String, default: "Powerful Modules for Complete School Management" },
  moduleHeroDesc: { type: String, default: "VidhyaSanchalan provides all essential school management modules in one powerful platform — from admissions and fees to attendance, examinations, homework, reports, and parent communication." },
  modulePoints: { type: [String], default: ["Admission Management", "Fee Management", "Attendance & Geo mapping", "Homework & Assignments", "Timetable Management", "Online Examination", "Progress Reports", "Parent & Student Panels"] },
  moduleScreens: { type: [String], default: ["/moduleg.jpeg"] },
  gridModules: [
    {
      title: { type: String, required: true },
      emoji: { type: String, default: "💡" },
      iconName: { type: String, default: "Sparkles" },
      desc: { type: String, required: true },
      points: { type: [String], default: [] }
    }
  ],
  mobileTabs: [
    {
      tabId: { type: String, required: true },
      badge: { type: String, required: true },
      title: { type: String, required: true },
      desc: { type: String, required: true },
      points: [{ type: String }],
      color: { type: String, default: "from-[#429CE4] to-[#1D496C]" },
      accent: { type: String, default: "text-[#429CE4] bg-white/10 border-[#429CE4]/20" },
      image: { type: String }
    }
  ],
  mobileInfrastructure: [
    {
      title: { type: String, required: true },
      desc: { type: String, required: true },
      iconName: { type: String, required: true },
      hoverBg: { type: String, default: "hover:bg-[#429CE4] hover:border-[#429CE4] hover:shadow-xl hover:shadow-[#429CE4]/20" }
    }
  ],
  modulesHeroTags: [{ type: String }],
  modulesHeroImage: { type: String, default: "/moduleg.jpeg" },
  modulesGridCards: [
    {
      title: { type: String, required: true },
      emoji: { type: String, default: "📋" },
      iconName: { type: String, default: "Layers" },
      desc: { type: String, required: true },
      points: [{ type: String }],
      hoverFrom: { type: String, default: "#1D496C" },
      hoverTo: { type: String, default: "#429CE4" },
      accentColor: { type: String, default: "#429CE4" },
      order: { type: Number, default: 0 }
    }
  ],
  isSeeded: { type: Boolean, default: false }
}, { timestamps: true });

// ==========================================
// 2. Landing Page Feature Schema
// ==========================================
const FeatureSchema = new Schema({
  title: { type: String, required: true },
  iconName: { type: String, required: true },
  color: { type: String, default: "from-[#1D496C] to-[#1A3F5C]" },
  points: [{ type: String }],
  order: { type: Number, default: 0 }
}, { timestamps: true });

// ==========================================
// 3. Landing Page Testimonial Schema
// ==========================================
const TestimonialSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  content: { type: String, required: true },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  image: { type: String, default: "/testimonial-placeholder.jpg" },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// ==========================================
// 4. Horizontal Slider Modules Schema
// ==========================================
const SliderModuleSchema = new Schema({
  label: { type: String, required: true },
  iconName: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// ==========================================
// 5. Horizontal Slider Badges Schema
// ==========================================
const SliderBadgeSchema = new Schema({
  label: { type: String, required: true },
  iconName: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// ==========================================
// 6. Contact Form Inquiry Schema
// ==========================================
const InquirySchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, default: "General Inquiry" },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

// Export Models (prevent OverwriteModelError in Next.js hot-reloading Mongoose cache)
if (mongoose.models.LandingSettings) {
  const schemaPaths = mongoose.models.LandingSettings.schema.paths;
  if (
    !schemaPaths.mobileInfrastructure ||
    !schemaPaths.mobileTabs ||
    !schemaPaths.modulesHeroTags ||
    !schemaPaths.modulesHeroImage ||
    !schemaPaths.modulesGridCards ||
    !schemaPaths.heroImages ||
    !schemaPaths.aboutImages ||
    !schemaPaths.whyImagesMain ||
    !schemaPaths.whyCollageCards ||
    !schemaPaths.moduleScreens
  ) {
    delete mongoose.models.LandingSettings;
  }
}

export const LandingSettings = mongoose.models.LandingSettings || mongoose.model("LandingSettings", LandingSettingsSchema);
export const Feature = mongoose.models.Feature || mongoose.model("Feature", FeatureSchema);
export const Testimonial = mongoose.models.Testimonial || mongoose.model("Testimonial", TestimonialSchema);
export const SliderModule = mongoose.models.SliderModule || mongoose.model("SliderModule", SliderModuleSchema);
export const SliderBadge = mongoose.models.SliderBadge || mongoose.model("SliderBadge", SliderBadgeSchema);
export const Inquiry = mongoose.models.Inquiry || mongoose.model("Inquiry", InquirySchema);
