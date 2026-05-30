import mongoose, { Schema } from "mongoose";

// ==========================================
// 1. Landing Page General Settings Schema
// ==========================================
const LandingSettingsSchema = new Schema({
  heroBadge: { type: String, default: "★ Smart School ERP Platform" },
  heroTitle: { type: String, default: "VidhyaSanchalan" },
  heroSubtitle: { type: String, default: "Complete Smart School Management System" },
  heroDescription: { type: String, default: "Manage the complete school journey — from student admission to leaving certificate — with powerful digital panels for Trustees, Principals, Clerks, Teachers, Students, and Guardians." },
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
  mobileTabs: [
    {
      tabId: { type: String, required: true },
      badge: { type: String, required: true },
      title: { type: String, required: true },
      desc: { type: String, required: true },
      points: [{ type: String }],
      color: { type: String, default: "from-[#429CE4] to-[#1D496C]" },
      accent: { type: String, default: "text-[#429CE4] bg-white/10 border-[#429CE4]/20" }
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
    !schemaPaths.modulesGridCards
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
