import { NextResponse } from "next/server";
import { getInitiatives } from "@/lib/queries";

export async function GET() {
  try {
    const data = await getInitiatives();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch initiatives" }, { status: 500 });
  }
}
