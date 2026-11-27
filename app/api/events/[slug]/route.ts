import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import { NextResponse } from "next/server";

type EventRouteContext = {
  params: Promise<{ slug: string }>;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(
  _request: Request,
  { params }: EventRouteContext
) {
  try {
    const { slug } = await params;

    if (typeof slug !== "string" || slug.trim().length === 0) {
      return NextResponse.json(
        { message: "A slug is required." },
        { status: 400 }
      );
    }

    if (!SLUG_PATTERN.test(slug)) {
      return NextResponse.json(
        { message: "The slug format is invalid." },
        { status: 400 }
      );
    }

    await connectDB();
    const event = await Event.findOne({ slug });

    if (!event) {
      return NextResponse.json(
        { message: "Event not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({message: "Event fetched successfully.", event }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch event by slug:", error);
    return NextResponse.json(
      { message: "Failed to fetch event." },
      { status: 500 }
    );
  }
}
