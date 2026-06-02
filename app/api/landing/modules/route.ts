import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { SliderModule, SliderBadge } from "@/lib/models/LandingContent";
import { fsGetModules, fsAddModule, fsUpdateModule, fsDeleteModule } from "@/lib/fileStore";

export async function GET() {
  try {
    await dbConnect();
    const modules = await SliderModule.find().sort({ order: 1 });
    const badges = await SliderBadge.find().sort({ order: 1 });
    return NextResponse.json({ success: true, modules, badges });
  } catch {
    const { modules, badges } = fsGetModules();
    return NextResponse.json({ success: true, modules, badges, usingFileStore: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { label, iconName, type } = body;
    if (!label || !iconName || !type) {
      return NextResponse.json({ success: false, message: "Missing label, iconName, or type" }, { status: 400 });
    }
    try {
      await dbConnect();
      let result;
      if (type === "module") {
        const count = await SliderModule.countDocuments();
        result = await SliderModule.create({ label, iconName, order: count });
      } else {
        const count = await SliderBadge.countDocuments();
        result = await SliderBadge.create({ label, iconName, order: count });
      }
      return NextResponse.json({ success: true, data: result, message: `${type === "module" ? "Module" : "Badge"} added successfully!` });
    } catch {
      const result = fsAddModule({ label, iconName }, type as "module" | "badge");
      return NextResponse.json({ success: true, data: result, message: `${type === "module" ? "Module" : "Badge"} added locally (MongoDB offline).`, usingFileStore: true });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { _id, label, iconName, type } = body;
    if (!_id || !label || !iconName || !type) {
      return NextResponse.json({ success: false, message: "Missing _id, label, iconName, or type" }, { status: 400 });
    }
    try {
      await dbConnect();
      let result;
      if (type === "module") {
        result = await SliderModule.findByIdAndUpdate(_id, { label, iconName }, { new: true });
      } else {
        result = await SliderBadge.findByIdAndUpdate(_id, { label, iconName }, { new: true });
      }
      if (!result) return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: result, message: `${type === "module" ? "Module" : "Badge"} updated successfully!` });
    } catch {
      const result = fsUpdateModule(_id, { label, iconName }, type as "module" | "badge");
      if (!result) return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: result, message: `${type === "module" ? "Module" : "Badge"} updated locally (MongoDB offline).`, usingFileStore: true });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");
    if (!id || !type) return NextResponse.json({ success: false, message: "Missing 'id' or 'type'" }, { status: 400 });
    try {
      await dbConnect();
      let result;
      if (type === "module") {
        result = await SliderModule.findByIdAndDelete(id);
      } else {
        result = await SliderBadge.findByIdAndDelete(id);
      }
      if (!result) return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
      return NextResponse.json({ success: true, message: `${type === "module" ? "Module" : "Badge"} deleted successfully!` });
    } catch {
      const ok = fsDeleteModule(id, type as "module" | "badge");
      if (!ok) return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
      return NextResponse.json({ success: true, message: `${type === "module" ? "Module" : "Badge"} deleted locally (MongoDB offline).`, usingFileStore: true });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
