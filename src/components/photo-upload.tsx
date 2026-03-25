"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, X, Loader2, Link2 } from "lucide-react";
import { useTranslation } from "@/i18n";

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export function PhotoUpload({ photos, onChange, max = 5 }: PhotoUploadProps) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const cloudinaryConfigured = !!(CLOUD_NAME && UPLOAD_PRESET);
  const [urlMode, setUrlMode] = useState(!cloudinaryConfigured);
  const [urlInput, setUrlInput] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const canAdd = photos.length < max;

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) return data.secure_url;
      console.error("Cloudinary upload error:", data);
      setUploadError(data?.error?.message || "Upload failed");
      return null;
    } catch (err) {
      console.error("Cloudinary upload exception:", err);
      setUploadError("Upload failed — check connection");
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError("");
    const newPhotos = [...photos];

    for (let i = 0; i < files.length && newPhotos.length < max; i++) {
      const url = await uploadToCloudinary(files[i]);
      if (url) newPhotos.push(url);
    }

    onChange(newPhotos);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const addUrl = () => {
    const u = urlInput.trim();
    if (!u || photos.length >= max) return;
    onChange([...photos, u]);
    setUrlInput("");
  };

  const remove = (idx: number) => {
    onChange(photos.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-1.5">
        {t("market.photos")}{" "}
        <span className="text-white/30">
          ({t("common.optional")} - {photos.length}/{max})
        </span>
      </label>

      {/* Photo previews */}
      <AnimatePresence>
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 mb-3 overflow-x-auto hide-scrollbar"
          >
            {photos.map((url, i) => (
              <div
                key={`${url}-${i}`}
                className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-white/10"
              >
                <img
                  src={url}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="absolute top-0.5 end-0.5 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-white/80 hover:text-white"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload error */}
      {uploadError && (
        <div className="mb-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400 flex items-center justify-between">
          <span>{uploadError}</span>
          <button type="button" onClick={() => setUploadError("")} className="text-red-400/60 hover:text-red-400 ms-2">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Upload controls */}
      {canAdd && (
        <div className="space-y-2">
          {!urlMode ? (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-3 text-sm text-white/40 hover:text-[#c8ff00] hover:border-[#c8ff00]/30 transition-all disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ImagePlus size={16} />
                  )}
                  {uploading ? t("common.loading") : t("market.addPhoto")}
                </button>
                <button
                  type="button"
                  onClick={() => setUrlMode(true)}
                  className="shrink-0 flex items-center justify-center rounded-xl border border-white/10 px-3 text-white/30 hover:text-white/60 transition-colors"
                  title="Add by URL"
                >
                  <Link2 size={14} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addUrl();
                  }
                }}
                placeholder={t("market.photoUrl")}
                dir="ltr"
                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#c8ff00]/50 transition-all"
              />
              <button
                type="button"
                onClick={addUrl}
                disabled={!urlInput.trim()}
                className="shrink-0 rounded-xl bg-white/5 border border-white/10 px-4 text-white/40 hover:text-[#c8ff00] hover:border-[#c8ff00]/30 transition-all disabled:opacity-30"
              >
                <ImagePlus size={18} />
              </button>
              {CLOUD_NAME && UPLOAD_PRESET && (
                <button
                  type="button"
                  onClick={() => setUrlMode(false)}
                  className="shrink-0 flex items-center justify-center rounded-xl border border-white/10 px-3 text-white/30 hover:text-white/60 transition-colors"
                  title="Upload file"
                >
                  <ImagePlus size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
