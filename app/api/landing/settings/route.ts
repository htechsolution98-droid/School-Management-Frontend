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
        if (body.stats) settings.stats = body.stats;
        if (body.whyChooseUs) settings.whyChooseUs = body.whyChooseUs;
        if (body.mobileTabs) settings.mobileTabs = body.mobileTabs;
        if (body.mobileInfrastructure) settings.mobileInfrastructure = body.mobileInfrastructure;
        if (body.modulesHeroTags) settings.modulesHeroTags = body.modulesHeroTags;
        if (body.modulesHeroImage !== undefined) settings.modulesHeroImage = body.modulesHeroImage;
        if (body.modulesGridCards) settings.modulesGridCards = body.modulesGridCards;
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
