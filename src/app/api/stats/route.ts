import { NextResponse } from "next/server";
import { getStats } from "@/lib/queries";

export async function GET() {
  try {
    const data = await getStats();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
