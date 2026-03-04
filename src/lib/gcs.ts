import { Storage } from "@google-cloud/storage";

export type GcsConfig = {
  projectId: string;
  bucketName: string;
  credentials: string;
  cdnBaseUrl: string;
};

export function getGcsClient(config: GcsConfig): Storage {
  const creds = JSON.parse(config.credentials);
  return new Storage({
    projectId: config.projectId,
    credentials: creds,
  });
}

export async function generateSignedUploadUrl(
  config: GcsConfig,
  filename: string,
  contentType: string
): Promise<{ signedUrl: string; publicUrl: string }> {
  const storage = getGcsClient(config);
  const bucket = storage.bucket(config.bucketName);
  const file = bucket.file(filename);

  const [signedUrl] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000,
    contentType,
  });

  const base = config.cdnBaseUrl.replace(/\/$/, "");
  const publicUrl = `${base}/${filename}`;

  return { signedUrl, publicUrl };
}

export async function deleteGcsObject(
  config: GcsConfig,
  objectPath: string
): Promise<void> {
  const storage = getGcsClient(config);
  await storage.bucket(config.bucketName).file(objectPath).delete();
}

export async function testGcsConnection(
  config: GcsConfig
): Promise<{ ok: boolean; error?: string }> {
  try {
    const storage = getGcsClient(config);
    const [exists] = await storage.bucket(config.bucketName).exists();
    if (!exists) {
      return { ok: false, error: `Bucket "${config.bucketName}" not found` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
