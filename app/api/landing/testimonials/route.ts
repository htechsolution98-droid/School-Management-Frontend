import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Testimonial } from "@/lib/models/LandingContent";
import { fsGetTestimonials, fsAddTestimonial, fsUpdateTestimonial, fsDeleteTestimonial } from "@/lib/fileStore";

export async function GET() {
  try {
    await dbConnect();
    const testimonials = await Testimonial.find().sort({ order: 1 });
    return NextResponse.json({ success: true, testimonials });
  } catch {
    const testimonials = fsGetTestimonials();
    return NextResponse.json({ success: true, testimonials, usingFileStore: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    try {
      await dbConnect();
      if (body.order === undefined || body.order === null) {
        const count = await Testimonial.countDocuments();
        body.order = count;
      }
      const testimonial = await Testimonial.create(body);
      return NextResponse.json({ success: true, testimonial, message: "Testimonial added successfully!" });
    } catch {
      const testimonial = fsAddTestimonial(body);
      return NextResponse.json({ success: true, testimonial, message: "Testimonial added locally (MongoDB offline).", usingFileStore: true });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { _id, ...updateData } = body;
    if (!_id) return NextResponse.json({ success: false, message: "Testimonial ID (_id) is required" }, { status: 400 });
    try {
      await dbConnect();
      const testimonial = await Testimonial.findByIdAndUpdate(_id, updateData, { new: true });
      if (!testimonial) return NextResponse.json({ success: false, message: "Testimonial not found" }, { status: 404 });
      return NextResponse.json({ success: true, testimonial, message: "Testimonial updated successfully!" });
    } catch {
      const testimonial = fsUpdateTestimonial(_id, updateData);
      if (!testimonial) return NextResponse.json({ success: false, message: "Testimonial not found" }, { status: 404 });
      return NextResponse.json({ success: true, testimonial, message: "Testimonial updated locally (MongoDB offline).", usingFileStore: true });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "Testimonial ID 'id' is required" }, { status: 400 });
    try {
      await dbConnect();
      const testimonial = await Testimonial.findByIdAndDelete(id);
      if (!testimonial) return NextResponse.json({ success: false, message: "Testimonial not found" }, { status: 404 });
      return NextResponse.json({ success: true, message: "Testimonial deleted successfully!" });
    } catch {
      const ok = fsDeleteTestimonial(id);
      if (!ok) return NextResponse.json({ success: false, message: "Testimonial not found" }, { status: 404 });
      return NextResponse.json({ success: true, message: "Testimonial deleted locally (MongoDB offline).", usingFileStore: true });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
