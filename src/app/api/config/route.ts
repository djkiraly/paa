import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/queries";

export async function GET() {
  try {
    const data = await getSiteConfig();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
  }
}
