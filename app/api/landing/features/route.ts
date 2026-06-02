import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Feature } from "@/lib/models/LandingContent";
import { fsGetFeatures, fsAddFeature, fsUpdateFeature, fsDeleteFeature } from "@/lib/fileStore";

export async function GET() {
  try {
    await dbConnect();
    const features = await Feature.find().sort({ order: 1 });
    return NextResponse.json({ success: true, features });
  } catch {
    const features = fsGetFeatures();
    return NextResponse.json({ success: true, features, usingFileStore: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    try {
      await dbConnect();
      if (body.order === undefined || body.order === null) {
        const count = await Feature.countDocuments();
        body.order = count;
      }
      const feature = await Feature.create(body);
      return NextResponse.json({ success: true, feature, message: "Feature card added successfully!" });
    } catch {
      const feature = fsAddFeature(body);
      return NextResponse.json({ success: true, feature, message: "Feature added locally (MongoDB offline).", usingFileStore: true });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { _id, ...updateData } = body;
    if (!_id) return NextResponse.json({ success: false, message: "Feature ID (_id) is required" }, { status: 400 });
    try {
      await dbConnect();
      const feature = await Feature.findByIdAndUpdate(_id, updateData, { new: true });
      if (!feature) return NextResponse.json({ success: false, message: "Feature card not found" }, { status: 404 });
      return NextResponse.json({ success: true, feature, message: "Feature card updated successfully!" });
    } catch {
      const feature = fsUpdateFeature(_id, updateData);
      if (!feature) return NextResponse.json({ success: false, message: "Feature card not found" }, { status: 404 });
      return NextResponse.json({ success: true, feature, message: "Feature updated locally (MongoDB offline).", usingFileStore: true });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "Feature ID 'id' is required" }, { status: 400 });
    try {
      await dbConnect();
      const feature = await Feature.findByIdAndDelete(id);
      if (!feature) return NextResponse.json({ success: false, message: "Feature card not found" }, { status: 404 });
      return NextResponse.json({ success: true, message: "Feature card deleted successfully!" });
    } catch {
      const ok = fsDeleteFeature(id);
      if (!ok) return NextResponse.json({ success: false, message: "Feature card not found" }, { status: 404 });
      return NextResponse.json({ success: true, message: "Feature deleted locally (MongoDB offline).", usingFileStore: true });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
