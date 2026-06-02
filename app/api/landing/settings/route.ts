import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { LandingSettings } from "@/lib/models/LandingContent";
import { fsGetSettings, fsSaveSettings } from "@/lib/fileStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const settings = await LandingSettings.findOne();
    if (!settings) {
      return NextResponse.json({ success: true, isSeeded: false, message: "No settings found in database. Database seeding required." });
    }
    return NextResponse.json({ success: true, isSeeded: true, settings });
  } catch {
    // MongoDB unavailable — use file store fallback
    const settings = fsGetSettings();
    return NextResponse.json({ success: true, isSeeded: settings.isSeeded, settings, usingFileStore: true });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Try MongoDB first
    try {
      await dbConnect();
      let settings = await LandingSettings.findOne();
      if (!settings) {
        settings = new LandingSettings(body);
      } else {
        settings.heroBadge = body.heroBadge;
        settings.heroTitle = body.heroTitle;
        settings.heroSubtitle = body.heroSubtitle;
        settings.heroDescription = body.heroDescription;
        settings.satisfactionRate = body.satisfactionRate;
        if (body.heroImage !== undefined) settings.heroImage = body.heroImage;
        if (body.heroImages !== undefined) settings.heroImages = body.heroImages;
        if (body.stats) settings.stats = body.stats;
        if (body.whyChooseUs) settings.whyChooseUs = body.whyChooseUs;
        // About Section fields
        if (body.aboutBadge !== undefined) settings.aboutBadge = body.aboutBadge;
        if (body.aboutTitle !== undefined) settings.aboutTitle = body.aboutTitle;
        if (body.aboutTitleHighlight !== undefined) settings.aboutTitleHighlight = body.aboutTitleHighlight;
        if (body.aboutDescription !== undefined) settings.aboutDescription = body.aboutDescription;
        if (body.aboutQuote !== undefined) settings.aboutQuote = body.aboutQuote;
        if (body.aboutImage !== undefined) settings.aboutImage = body.aboutImage;
        if (body.aboutImages !== undefined) settings.aboutImages = body.aboutImages;
        if (body.aboutHighlights !== undefined) settings.aboutHighlights = body.aboutHighlights;

        // Why Choose Us fields
        if (body.whyBadge !== undefined) settings.whyBadge = body.whyBadge;
        if (body.whyTitle !== undefined) settings.whyTitle = body.whyTitle;
        if (body.whyTitleHighlight !== undefined) settings.whyTitleHighlight = body.whyTitleHighlight;
        if (body.whyPills !== undefined) settings.whyPills = body.whyPills;
        if (body.whyImageMain !== undefined) settings.whyImageMain = body.whyImageMain;
        if (body.whyImagesMain !== undefined) settings.whyImagesMain = body.whyImagesMain;
        if (body.whyImageLeft !== undefined) settings.whyImageLeft = body.whyImageLeft;
        if (body.whyImageBottomLeft !== undefined) settings.whyImageBottomLeft = body.whyImageBottomLeft;
        if (body.whyImageBottomRight !== undefined) settings.whyImageBottomRight = body.whyImageBottomRight;
        if (body.whyCollageCards !== undefined) settings.whyCollageCards = body.whyCollageCards;

        // Mobile Ecosystem fields
        if (body.mobileScreens !== undefined) settings.mobileScreens = body.mobileScreens;
        if (body.mobileStudent !== undefined) settings.mobileStudent = body.mobileStudent;
        if (body.mobileParent !== undefined) settings.mobileParent = body.mobileParent;
        if (body.mobileTeacher !== undefined) settings.mobileTeacher = body.mobileTeacher;
        if (body.mobileCapabilities !== undefined) settings.mobileCapabilities = body.mobileCapabilities;

        // Modules Ecosystem fields
        if (body.moduleHeroBadge !== undefined) settings.moduleHeroBadge = body.moduleHeroBadge;
        if (body.moduleHeroTitle !== undefined) settings.moduleHeroTitle = body.moduleHeroTitle;
        if (body.moduleHeroDesc !== undefined) settings.moduleHeroDesc = body.moduleHeroDesc;
        if (body.modulePoints !== undefined) settings.modulePoints = body.modulePoints;
        if (body.moduleScreens !== undefined) settings.moduleScreens = body.moduleScreens;
        if (body.gridModules !== undefined) settings.gridModules = body.gridModules;

        // Incoming branch fields
        if (body.mobileTabs !== undefined) settings.mobileTabs = body.mobileTabs;
        if (body.mobileInfrastructure !== undefined) settings.mobileInfrastructure = body.mobileInfrastructure;
        if (body.modulesHeroTags !== undefined) settings.modulesHeroTags = body.modulesHeroTags;
        if (body.modulesHeroImage !== undefined) settings.modulesHeroImage = body.modulesHeroImage;
        if (body.modulesGridCards !== undefined) settings.modulesGridCards = body.modulesGridCards;
      }
      await settings.save();
      return NextResponse.json({ success: true, settings, message: "Settings updated successfully!" });
    } catch {
      // MongoDB unavailable — use file store fallback
      const saved = fsSaveSettings(body);
      return NextResponse.json({ success: true, settings: saved, message: "Settings saved locally (MongoDB offline).", usingFileStore: true });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
