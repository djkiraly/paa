import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";
import { getGcsConfig } from "@/lib/admin-queries";
import { generateSignedUploadUrl } from "@/lib/gcs";

const uploadSchema = z.object({
  filename: z.string().min(1).max(500),
  contentType: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = uploadSchema.parse(body);

    const config = await getGcsConfig();
    if (!config) {
      return NextResponse.json(
        { error: "GCS not configured. Set up in Settings first." },
        { status: 503 }
      );
    }

    const timestamp = Date.now();
    const safeName = parsed.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectName = `uploads/${timestamp}-${safeName}`;

    const { signedUrl, publicUrl } = await generateSignedUploadUrl(
      config,
      objectName,
      parsed.contentType
    );

    return NextResponse.json({ signedUrl, publicUrl });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.issues },
        { status: 400 }
      );
    }
    console.error("Upload URL generation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
