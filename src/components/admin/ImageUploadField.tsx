"use client";

import { useState, useRef } from "react";

type Props = {
  name: string;
  defaultValue?: string;
  gcsConfigured: boolean;
};

export function ImageUploadField({ name, defaultValue, gcsConfigured }: Props) {
  const [url, setUrl] = useState(defaultValue || "");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    setProgress(0);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to get upload URL");
      }

      const { signedUrl, publicUrl } = await res.json();

      setProgress(30);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setProgress(30 + Math.round((ev.loaded / ev.total) * 70));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed (${xhr.status})`));
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(file);
      });

      setUrl(publicUrl);
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />

      {url && (
        <div className="flex items-center gap-3">
          <img
            src={url}
            alt="Preview"
            className="h-12 w-12 rounded-lg border border-white/10 object-cover"
          />
          <span className="truncate text-xs text-[var(--paa-gray)]">{url}</span>
        </div>
      )}

      {gcsConfigured && (
        <>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[var(--paa-gray)] hover:text-[var(--paa-white)] hover:border-white/20 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {uploading && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[var(--paa-accent)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </>
      )}

      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={gcsConfigured ? "Or enter URL manually" : "Image URL"}
        className="w-full rounded-lg border border-white/10 bg-[var(--paa-midnight)] px-3 py-2 text-sm text-[var(--paa-white)] focus:border-[var(--paa-accent)] focus:outline-none"
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
