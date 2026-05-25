import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import {
  LandingSettings,
  Feature,
  Testimonial,
  SliderModule,
  SliderBadge,
} from "@/lib/models/LandingContent";
import { fsSeedAll } from "@/lib/fileStore";

export async function POST() {
  try {
    await dbConnect();

    // 1. Clear existing data to prevent duplicate seeds
    await LandingSettings.deleteMany({});
    await Feature.deleteMany({});
    await Testimonial.deleteMany({});
    await SliderModule.deleteMany({});
    await SliderBadge.deleteMany({});

    // 2. Insert Default Settings
    const defaultSettings = await LandingSettings.create({
      heroBadge: "★ Smart School ERP Platform",
      heroTitle: "VidhyaSanchalan",
      heroSubtitle: "Complete Smart School Management System",
      heroDescription: "Manage the complete school journey — from student admission to leaving certificate — with powerful digital panels for Trustees, Principals, Clerks, Teachers, Students, and Guardians.",
      satisfactionRate: 99.8,
      stats: [
        { label: "Schools", target: 500, suffix: "+", iconName: "GraduationCap" },
        { label: "Students", target: 50, suffix: "K+", iconName: "Users" },
        { label: "Teachers", target: 5, suffix: "K+", iconName: "BookOpen" },
        { label: "Parents", target: 100, suffix: "K+", iconName: "Heart" },
      ],
      whyChooseUs: [
        {
          title: "Innovation at our core",
          description: "VidyaSanchalan stands as the vanguard of school-management solutions, consistently pioneering the integration of next-generation technologies that redefine educational administration worldwide.",
          iconName: "Lightbulb",
          color: "text-[#5D3FD3]"
        },
        {
          title: "Simplifying complexity",
          description: "Infographics & animations distill complex academic data into intuitive visuals—transforming every report and result into an easily grasped, optimized experience for students, parents, and educators.",
          iconName: "Target",
          color: "text-[#285E89]"
        },
        {
          title: "Empowering institutional growth",
          description: "Our platform equips schools with automated workflows, real-time communication, and scalable features designed for any school size to thrive in the modern age.",
          iconName: "TrendingUp",
          color: "text-[#FFA600]"
        }
      ],
      isSeeded: true
    });

    // 3. Insert Default Features
    const defaultFeatures = [
      {
        title: "Admission Management",
        iconName: "GraduationCap",
        color: "from-[#1D496C] to-[#1A3F5C]",
        points: [
          "Online admission forms",
          "Offline admission entries",
          "Public admission form sharing",
          "Student document management",
          "Admission approval system"
        ],
        order: 0
      },
      {
        title: "Fee Management",
        iconName: "CreditCard",
        color: "from-[#6A7626] to-[#596420]",
        points: [
          "Online & offline fee collection",
          "Dynamic fee structure creation",
          "Monthly / Quarterly / Custom fee setup",
          "Tuition fee, library fee, transport fee, etc.",
          "Fee verification by clerk and principal",
          "Fee receipt generation"
        ],
        order: 1
      },
      {
        title: "Timetable Management",
        iconName: "Calendar",
        color: "from-[#429CE4] to-[#2E85CC]",
        points: [
          "Class-wise timetable creation",
          "Subject assignment",
          "Teacher allocation",
          "Editable schedules for teachers and students"
        ],
        order: 2
      },
      {
        title: "Homework & Assignment",
        iconName: "BookOpen",
        color: "from-[#ED6708] to-[#CD5804]",
        points: [
          "Online and offline homework",
          "Assignment uploads",
          "Subject-wise homework tracking",
          "Teacher to student communication"
        ],
        order: 3
      },
      {
        title: "Progress Reports",
        iconName: "TrendingUp",
        color: "from-[#FFA600] to-[#E09200]",
        points: [
          "Report cards",
          "Marksheets",
          "Attendance tracking",
          "Student performance analytics",
          "Guardian visibility panel"
        ],
        order: 4
      },
      {
        title: "Announcement System",
        iconName: "Bell",
        color: "from-[#1D496C] to-[#6A7626]",
        points: [
          "School announcements",
          "Holiday notices",
          "Emergency alerts",
          "Event updates for students and parents"
        ],
        order: 5
      },
      {
        title: "Geo Attendance Feature",
        iconName: "Shield",
        color: "from-[#6A7626] to-[#1D496C]",
        points: [
          "Staff attendance with geo-location tracking",
          "Secure attendance monitoring",
          "Real-time attendance records"
        ],
        order: 6
      },
      {
        title: "Online Examination",
        iconName: "Award",
        color: "from-[#429CE4] to-[#ED6708]",
        points: [
          "Conduct online exams",
          "MCQ and written tests",
          "Result generation",
          "Student performance reports"
        ],
        order: 7
      }
    ];
    await Feature.create(defaultFeatures);

    // 4. Insert Default Slider Modules
    const defaultModules = [
      { label: "Online & Offline Admissions", iconName: "GraduationCap", order: 0 },
      { label: "Smart Fee Collection", iconName: "DollarSign", order: 1 },
      { label: "Dynamic Timetable Planner", iconName: "Calendar", order: 2 },
      { label: "Classroom Homework", iconName: "BookOpen", order: 3 },
      { label: "Online Examination Desk", iconName: "Award", order: 4 },
      { label: "Real-time Progress Reports", iconName: "TrendingUp", order: 5 },
      { label: "GPS Attendance Tracking", iconName: "Shield", order: 6 },
      { label: "Instant Announcement System", iconName: "Bell", order: 7 }
    ];
    await SliderModule.create(defaultModules);

    // 5. Insert Default Slider Badges
    const defaultBadges = [
      { label: "Trusted by 500+ Schools", iconName: "Star", order: 0 },
      { label: "ISO 27001 Secure Data", iconName: "CheckCircle2", order: 1 },
      { label: "99.9% Cloud Uptime", iconName: "Rocket", order: 2 },
      { label: "Dedicated Guardian App", iconName: "Users", order: 3 },
      { label: "Encrypted Database Logs", iconName: "Shield", order: 4 },
      { label: "24/7 Priority Support Desk", iconName: "Heart", order: 5 },
      { label: "AI Powered Report Cards", iconName: "Sparkles", order: 6 },
      { label: "SRS Compliance Approved", iconName: "BookMarked", order: 7 }
    ];
    await SliderBadge.create(defaultBadges);

    // 6. Insert Default Testimonials
    const defaultTestimonials = [
      {
        name: "Rajesh Sharma",
        role: "Principal, Apex International School",
        content: "VidyaSanchalan simplified our complete admission and fee management process, saving our staff hundreds of hours.",
        rating: 5,
        image: "/testimonial-1.jpg",
        order: 0
      },
      {
        name: "Sunita Deshmukh",
        role: "Parent of Class IX Student",
        content: "Parents can now easily track student performance and attendance. The mobile app experience is absolutely seamless.",
        rating: 5,
        image: "/testimonial-2.jpg",
        order: 1
      },
      {
        name: "Devendra Patel",
        role: "Administration Trustee",
        content: "The geo-attendance feature made staff management much easier, and the financial audit logs are completely transparent.",
        rating: 5,
        image: "/testimonial-3.jpg",
        order: 2
      }
    ];
    await Testimonial.create(defaultTestimonials);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with dynamic default page copy!",
    });
  } catch (error: any) {
    console.error("Seeding Error (MongoDB):", error.message);
    try {
      // Fall back to resetting the JSON file store
      fsSeedAll();
      return NextResponse.json({
        success: true,
        message: "Database seeded locally (MongoDB offline). Data saved to file store.",
        usingFileStore: true,
      });
    } catch (fsError: any) {
      return NextResponse.json({ success: false, message: "Seeding failed: " + fsError.message }, { status: 500 });
    }
  }
}
