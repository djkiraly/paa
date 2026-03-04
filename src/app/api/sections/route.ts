import { NextResponse } from "next/server";
import { getPageSections } from "@/lib/queries";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSlug = searchParams.get("page");

    if (!pageSlug) {
      return NextResponse.json(
        { error: "Missing 'page' query parameter" },
        { status: 400 }
      );
    }

    const data = await getPageSections(pageSlug);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
  }
}
