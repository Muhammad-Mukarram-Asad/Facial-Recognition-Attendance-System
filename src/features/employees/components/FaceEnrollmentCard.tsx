"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge, Button, Card } from "@/shared/ui";

export interface FaceEnrollmentCardProps {
  /** Notified with the raw File whenever it's picked or cleared, so a
   * parent (e.g. the add-employee flow) can send it along with the form. */
  onFileChange?: (file: File | null) => void;
  /** Saved enrollment photo for this employee. Shown until a new file is picked. */
  existingPhotoUrl?: string | null;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

/** Kiosk capture preview — shows the scanning sweep until a photo is uploaded. */
export function FaceEnrollmentCard({
  onFileChange,
  existingPhotoUrl = null,
}: FaceEnrollmentCardProps = {}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPhotoUrl, setLocalPhotoUrl] = useState<string | null>(null);
  const photoUrl = localPhotoUrl ?? existingPhotoUrl;

  // Revoke only the locally picked object URL. The saved photo is a remote URL.
  useEffect(() => {
    return () => {
      if (localPhotoUrl) URL.revokeObjectURL(localPhotoUrl);
    };
  }, [localPhotoUrl]);

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Photo must be a JPG or PNG image");
      return;
    }

    setLocalPhotoUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
    onFileChange?.(file);
  };

  const clearPhoto = () => {
    setLocalPhotoUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
    onFileChange?.(null);
  };

  return (
    <Card padding={20} style={{ gap: 14, flex: 1, height: "100%", minHeight: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text-strong)",
          }}
        >
          Face enrollment
        </h3>
        <Badge tone={photoUrl ? "success" : "warning"} dot>
          {photoUrl ? "Photo uploaded" : "No photo yet"}
        </Badge>
      </div>

      <div
        style={{
          position: "relative",
          borderRadius: "var(--radius-sm)",
          overflow: "hidden",
          background: "var(--surface-inverse-deep)",
          flex: "1 1 0",
          minHeight: 176,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL, not a served asset.
          <img
            src={photoUrl}
            alt="Uploaded enrollment photo"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <>
            <div
              style={{
                position: "absolute",
                inset: 18,
                borderRadius: 16,
                border: "1px dashed rgba(255,255,255,.28)",
              }}
            />
            <div
              style={{
                width: 92,
                height: 112,
                borderRadius: "46px 46px 38px 38px",
                background:
                  "radial-gradient(120% 90% at 50% 25%, rgba(31,180,162,.34), rgba(46,82,224,.12) 60%, transparent 72%)",
                border: "1px solid rgba(255,255,255,.2)",
              }}
            />
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 18,
                right: 18,
                top: 20,
                height: 2,
                background:
                  "linear-gradient(90deg,transparent,var(--lucky-lime-400),transparent)",
                animation: "ftScan 3s var(--ease-in-out) infinite",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: 14,
                bottom: 12,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "rgba(255,255,255,.72)",
              }}
            >
              enroll cam · 1280×720
            </span>
            <span
              style={{
                position: "absolute",
                right: 14,
                bottom: 12,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--lucky-lime-400)",
              }}
            >
              quality 0.94
            </span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        hidden
        onChange={handleFile}
      />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button
          variant="brand"
          size="sm"
          icon="upload"
          onClick={() => inputRef.current?.click()}
        >
         {photoUrl ? "Update photo" : "Upload photo"}
        </Button>
        {localPhotoUrl && (
          <Button
            variant="secondary"
            size="sm"
            icon="trash"
            onClick={clearPhoto}
          >
            Remove
          </Button>
        )}
      </div>

      <p
        style={{
          margin: 0,
          fontSize: 12,
          lineHeight: 1.5,
          color: "var(--text-faint)",
        }}
      >
        Use a clear, front-facing photo with one visible face. The required
        formats are JPG or PNG only.
      </p>
    </Card>
  );
}
