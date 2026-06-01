/**
 * fileStore.ts — JSON file-based data store (fallback when MongoDB is unavailable).
 * Auto-seeds with default landing page content on first run.
 * Data stored in: /data/landing-content.json
 */
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "landing-content.json");

// ── Default seed data (mirrors page.tsx static fallbacks) ─────────────────────
const DEFAULT_DATA = {
  settings: {
    heroBadge: "★ Smart School ERP Platform",
    heroTitle: "VidhyaSanchalan",
    heroSubtitle: "Complete Smart School Management System",
    heroDescription:
      "Manage the complete school journey — from student admission to leaving certificate — with powerful digital panels for Trustees, Principals, Clerks, Teachers, Students, and Guardians.",
    satisfactionRate: 99.8,
    stats: [
      { label: "Schools",  target: 500, suffix: "+",   iconName: "GraduationCap" },
      { label: "Students", target: 50,  suffix: "K+",  iconName: "Users" },
      { label: "Teachers", target: 5,   suffix: "K+",  iconName: "BookOpen" },
      { label: "Parents",  target: 100, suffix: "K+",  iconName: "Heart" },
    ],
    whyChooseUs: [
      {
        title: "Innovation at our core",
        description: "VidyaSanchalan stands as the vanguard of school-management solutions, consistently pioneering the integration of next-generation technologies that redefine educational administration worldwide.",
        iconName: "Lightbulb",
        color: "text-[#5D3FD3]",
      },
      {
        title: "Simplifying complexity",
        description: "Infographics & animations distill complex academic data into intuitive visuals—transforming every report and result into an easily grasped, optimized experience for students, parents, and educators.",
        iconName: "Target",
        color: "text-[#285E89]",
      },
      {
        title: "Empowering institutional growth",
        description: "Our platform equips schools with automated workflows, real-time communication, and scalable features designed for any school size to thrive in the modern age.",
        iconName: "TrendingUp",
        color: "text-[#FFA600]",
      },
    ],
    aboutBadge: "★ About VidhyaSanchalan",
    aboutTitle: "One Platform for Complete School Management",
    aboutTitleHighlight: "Complete School",
    aboutDescription: "VidhyaSanchalan is an advanced school ERP and management system designed to simplify daily school operations. It helps schools manage admissions, fees, staff, attendance, examinations, homework, reports, announcements, and student progress through separate role-based panels.",
    aboutQuote: "The system supports both online and offline processes and provides transparency between school staff, students, and parents.",
    aboutImage: "/about sms.jpg",
    aboutHighlights: [
      { title: "Transparency", desc: "For staff, students & parents" },
      { title: "Role-Based Access", desc: "Private secure panels" }
    ],
    whyBadge: "Why Choose Us?",
    whyTitle: "VidyaSanchalan is a revolution in education management",
    whyTitleHighlight: "revolution",
    whyPills: ["100% Free Forever", "Instant Insights", "Limitless Scale"],
    whyImageMain: "/why chooseus.jpeg",
    whyImageLeft: "/why choose us.jpg",
    whyImageBottomLeft: "/progress report.jpeg",
    whyImageBottomRight: "/admission (1).jpg",
    mobileScreens: [
      {
        title: "Student Portal UI",
        image: "/mobile-1.png",
        description: "Direct access to homework schedules, exam tables, marksheet analytics, and virtual classrooms."
      },
      {
        title: "Parent Companion UI",
        image: "/mobile-2.png",
        description: "Instant notifications for attendance alerts, online fee invoice payments, and teacher chat boards."
      },
      {
        title: "Teacher Administration UI",
        image: "/mobile-3.png",
        description: "Smart geo-fenced attendance registration, digital grading interfaces, and rapid notice distributions."
      }
    ],
    mobileStudent: {
      badge: "Student Application",
      title: "Learn Smarter, Grow Faster",
      desc: "Designed to keep students organized, motivated, and engaged.",
      points: [
        "Homework Tracker",
        "Online Examination",
        "Student Timetable",
        "Academic Analytics"
      ]
    },
    mobileParent: {
      badge: "Parent Companion App",
      title: "Your Child's Progress, In Your Pocket",
      desc: "Stay intimately connected with your child's educational journey.",
      points: [
        "Real-Time Geo-Attendance",
        "Digital Fee Desk",
        "Direct Parent-Teacher Chats",
        "Comprehensive Report Cards"
      ]
    },
    mobileTeacher: {
      badge: "Teacher Dashboard",
      title: "Focus on Teaching, Automate the Rest",
      desc: "Powerful admin tools in the palm of your hand.",
      points: [
        "Geo-Fenced Biometric Attendance",
        "Mobile Grading Engine",
        "Broadcaster Bulletin",
        "Substitution Alerts"
      ]
    },
    mobileCapabilities: [
      {
        title: "Bank-Grade Encryption",
        desc: "All financial data and API transactions are locked under high-strength TLS protocols ensuring completely secure fees transactions.",
        iconName: "Lock"
      },
      {
        title: "Offline Operations Mode",
        desc: "Never lose school data inside poor networks. The application synchronizes critical homework and logs directly from local cashiers.",
        iconName: "Wifi"
      },
      {
        title: "Instant Broadcaster Alerts",
        desc: "Integrated micro-sockets delivery engine providing notifications the exact millisecond announcements go active.",
        iconName: "Bell"
      },
      {
        title: "Biometric & Geo-location",
        desc: "Security tracking logs for teacher roll-call ensuring verifiable attendance entries using mobile GPS services.",
        iconName: "Fingerprint"
      }
    ],
    moduleHeroBadge: "SMART SCHOOL ERP MODULES",
    moduleHeroTitle: "Powerful Modules for Complete School Management",
    moduleHeroDesc: "VidhyaSanchalan provides all essential school management modules in one powerful platform — from admissions and fees to attendance, examinations, homework, reports, and parent communication.",
    modulePoints: [
      "Admission Management",
      "Fee Management",
      "Attendance & Geo Tracking",
      "Homework & Assignments",
      "Timetable Management",
      "Online Examination",
      "Progress Reports",
      "Parent & Student Panels"
    ],
    moduleScreens: ["/moduleg.jpeg"],
    gridModules: [
      {
        title: "Student Dashboard",
        emoji: "👨‍🎓",
        iconName: "GraduationCap",
        desc: "Designed to keep students organized, motivated, academic-centric, and highly engaged.",
        points: [
          "Attendance percentage",
          "Academic performance analytics",
          "Timetable & upcoming exams",
          "Homework and assignment tracker"
        ]
      },
      {
        title: "Parent Portal",
        emoji: "👨‍👩‍👧",
        iconName: "Users",
        desc: "Instant tracking companion providing real-time data sync, fee alerts, and direct chats.",
        points: [
          "Real-time student updates",
          "Fee payment alerts",
          "Direct communication with teachers",
          "Daily activity reports"
        ]
      },
      {
        title: "Online Fee Management",
        emoji: "💳",
        iconName: "CreditCard",
        desc: "Secure banking integration handling automatic reminders, instant receipts, and payouts.",
        points: [
          "UPI/card/net banking integration",
          "Auto fee reminders",
          "Downloadable receipts",
          "Pending fee analytics"
        ]
      },
      {
        title: "AI-Based Features",
        emoji: "🧠",
        iconName: "Brain",
        desc: "Smarter school intelligence systems generating predictions, notes, and report remarks.",
        points: [
          "AI chatbot for student queries",
          "Smart performance prediction",
          "Personalized study recommendations",
          "AI-generated report remarks"
        ]
      },
      {
        title: "Smart Attendance System",
        emoji: "📅",
        iconName: "Fingerprint",
        desc: "Instant roll-calls utilizing dynamic biometric readers, QR checks, and parent alerts.",
        points: [
          "Face recognition attendance",
          "RFID/QR code attendance",
          "Biometric integration",
          "Instant parent SMS alerts"
        ]
      },
      {
        title: "Learning Management Features",
        emoji: "📚",
        iconName: "Laptop",
        desc: "Comprehensive virtual classrooms allowing easy study uploads, recordings, and gradings.",
        points: [
          "Online classes integration",
          "Study materials & notes upload",
          "Assignment submission portal",
          "Recorded lecture access"
        ]
      },
      {
        title: "Communication Features",
        emoji: "💬",
        iconName: "MessageSquare",
        desc: "Integrated micro-sockets connecting chat channels, live broadcasts, and meet systems.",
        points: [
          "Teacher-parent chat",
          "Broadcast messaging",
          "Email/SMS integration",
          "Video meeting integration"
        ]
      }
    ],
    isSeeded: true,
  },
  features: [
    { _id: "f1", title: "Admission Management",   iconName: "GraduationCap", color: "from-[#1D496C] to-[#1A3F5C]",   points: ["Online admission forms", "Offline admission entries", "Public admission form sharing", "Student document management", "Admission approval system"],            order: 0 },
    { _id: "f2", title: "Fee Management",          iconName: "CreditCard",    color: "from-[#6A7626] to-[#596420]",   points: ["Online & offline fee collection", "Dynamic fee structure creation", "Monthly / Quarterly / Custom fee setup", "Fee receipt generation"],                     order: 1 },
    { _id: "f3", title: "Timetable Management",    iconName: "Calendar",      color: "from-[#429CE4] to-[#2E85CC]",   points: ["Class-wise timetable creation", "Subject assignment", "Teacher allocation", "Editable schedules"],                                                            order: 2 },
    { _id: "f4", title: "Homework & Assignment",   iconName: "BookOpen",      color: "from-[#ED6708] to-[#CD5804]",   points: ["Online and offline homework", "Assignment uploads", "Subject-wise homework tracking", "Teacher to student communication"],                                    order: 3 },
    { _id: "f5", title: "Progress Reports",        iconName: "TrendingUp",    color: "from-[#FFA600] to-[#E09200]",   points: ["Report cards", "Marksheets", "Attendance tracking", "Student performance analytics", "Guardian visibility panel"],                                          order: 4 },
    { _id: "f6", title: "Announcement System",     iconName: "Bell",          color: "from-[#1D496C] to-[#6A7626]",   points: ["School announcements", "Holiday notices", "Emergency alerts", "Event updates for students and parents"],                                                     order: 5 },
    { _id: "f7", title: "Geo Attendance Feature",  iconName: "Shield",        color: "from-[#6A7626] to-[#1D496C]",   points: ["Staff attendance with geo-location", "Secure attendance monitoring", "Real-time attendance records"],                                                         order: 6 },
    { _id: "f8", title: "Online Examination",      iconName: "Award",         color: "from-[#429CE4] to-[#ED6708]",   points: ["Conduct online exams", "MCQ and written tests", "Result generation", "Student performance reports"],                                                         order: 7 },
  ],
  testimonials: [
    { _id: "t1", name: "Rajesh Sharma",   role: "Principal, Apex International School", content: "VidyaSanchalan simplified our complete admission and fee management process, saving our staff hundreds of hours.", rating: 5, image: "", order: 0 },
    { _id: "t2", name: "Sunita Deshmukh", role: "Parent of Class IX Student",            content: "Parents can now easily track student performance and attendance. The mobile app experience is absolutely seamless.", rating: 5, image: "", order: 1 },
    { _id: "t3", name: "Devendra Patel",  role: "Administration Trustee",                content: "The geo-attendance feature made staff management much easier, and the financial audit logs are completely transparent.", rating: 5, image: "", order: 2 },
  ],
  modules: [
    { _id: "m1", label: "Online & Offline Admissions",    iconName: "GraduationCap", order: 0 },
    { _id: "m2", label: "Smart Fee Collection",           iconName: "DollarSign",    order: 1 },
    { _id: "m3", label: "Dynamic Timetable Planner",      iconName: "Calendar",      order: 2 },
    { _id: "m4", label: "Classroom Homework",             iconName: "BookOpen",      order: 3 },
    { _id: "m5", label: "Online Examination Desk",        iconName: "Award",         order: 4 },
    { _id: "m6", label: "Real-time Progress Reports",     iconName: "TrendingUp",    order: 5 },
    { _id: "m7", label: "GPS Attendance Tracking",        iconName: "Shield",        order: 6 },
    { _id: "m8", label: "Instant Announcement System",    iconName: "Bell",          order: 7 },
  ],
  badges: [
    { _id: "b1", label: "Trusted by 500+ Schools",    iconName: "Star",         order: 0 },
    { _id: "b2", label: "ISO 27001 Secure Data",       iconName: "CheckCircle2", order: 1 },
    { _id: "b3", label: "99.9% Cloud Uptime",          iconName: "Rocket",       order: 2 },
    { _id: "b4", label: "Dedicated Guardian App",      iconName: "Users",        order: 3 },
    { _id: "b5", label: "Encrypted Database Logs",     iconName: "Shield",       order: 4 },
    { _id: "b6", label: "24/7 Priority Support Desk",  iconName: "Heart",        order: 5 },
    { _id: "b7", label: "AI Powered Report Cards",     iconName: "Sparkles",     order: 6 },
    { _id: "b8", label: "SRS Compliance Approved",     iconName: "BookMarked",   order: 7 },
  ],
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    // Auto-seed with defaults on first run
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2), "utf-8");
  }
}

function readStore(): typeof DEFAULT_DATA {
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

function writeStore(data: typeof DEFAULT_DATA) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── Settings ──────────────────────────────────────────────────────────────────
export function fsGetSettings() { return readStore().settings; }

export function fsSaveSettings(update: Partial<typeof DEFAULT_DATA["settings"]>) {
  const store = readStore();
  store.settings = { ...store.settings, ...update, isSeeded: true };
  writeStore(store);
  return store.settings;
}

// ── Features ──────────────────────────────────────────────────────────────────
export function fsGetFeatures() { return readStore().features; }

export function fsAddFeature(feature: any) {
  const store = readStore();
  const item = { ...feature, _id: genId(), order: feature.order ?? store.features.length };
  store.features.push(item);
  writeStore(store);
  return item;
}

export function fsUpdateFeature(_id: string, update: any) {
  const store = readStore();
  const idx = store.features.findIndex((f: any) => f._id === _id);
  if (idx === -1) return null;
  store.features[idx] = { ...store.features[idx], ...update };
  writeStore(store);
  return store.features[idx];
}

export function fsDeleteFeature(_id: string) {
  const store = readStore();
  const idx = store.features.findIndex((f: any) => f._id === _id);
  if (idx === -1) return false;
  store.features.splice(idx, 1);
  writeStore(store);
  return true;
}

// ── Testimonials ──────────────────────────────────────────────────────────────
export function fsGetTestimonials() { return readStore().testimonials; }

export function fsAddTestimonial(t: any) {
  const store = readStore();
  const item = { ...t, _id: genId(), order: t.order ?? store.testimonials.length };
  store.testimonials.push(item);
  writeStore(store);
  return item;
}

export function fsUpdateTestimonial(_id: string, update: any) {
  const store = readStore();
  const idx = store.testimonials.findIndex((t: any) => t._id === _id);
  if (idx === -1) return null;
  store.testimonials[idx] = { ...store.testimonials[idx], ...update };
  writeStore(store);
  return store.testimonials[idx];
}

export function fsDeleteTestimonial(_id: string) {
  const store = readStore();
  const idx = store.testimonials.findIndex((t: any) => t._id === _id);
  if (idx === -1) return false;
  store.testimonials.splice(idx, 1);
  writeStore(store);
  return true;
}

// ── Modules & Badges ──────────────────────────────────────────────────────────
export function fsGetModules() {
  const s = readStore();
  return { modules: s.modules, badges: s.badges };
}

export function fsAddModule(item: any, type: "module" | "badge") {
  const store = readStore();
  const list: any[] = type === "module" ? store.modules : store.badges;
  const newItem = { ...item, _id: genId(), order: list.length };
  list.push(newItem);
  writeStore(store);
  return newItem;
}

export function fsUpdateModule(_id: string, update: any, type: "module" | "badge") {
  const store = readStore();
  const list: any[] = type === "module" ? store.modules : store.badges;
  const idx = list.findIndex((m: any) => m._id === _id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...update };
  writeStore(store);
  return list[idx];
}

export function fsDeleteModule(_id: string, type: "module" | "badge") {
  const store = readStore();
  const list: any[] = type === "module" ? store.modules : store.badges;
  const idx = list.findIndex((m: any) => m._id === _id);
  if (idx === -1) return false;
  list.splice(idx, 1);
  writeStore(store);
  return true;
}

// ── Full Seed / Reset ─────────────────────────────────────────────────────────
export function fsSeedAll() {
  const fresh = JSON.parse(JSON.stringify(DEFAULT_DATA));
  fresh.settings.isSeeded = true;
  writeStore(fresh);
  return fresh;
}
