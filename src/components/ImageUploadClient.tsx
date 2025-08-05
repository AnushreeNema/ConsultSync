"use client";

import { useState } from "react";

export default function ImageUploadClient() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Extraction failed");
      }

      const data = await res.json();

      // Optional: check if data.patients exists, else just confirm success
      setStatus(" Successfully uploaded patient details.");
    } catch (error) {
      console.error("Upload error:", error);
      setStatus(" Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl p-6">
      <input type="file" accept="image/*" onChange={handleUpload} />
      {loading && (
        <p className="mt-4 text-gray-500">Uploading and extracting...</p>
      )}
      {!loading && status && (
        <p className="mt-4 text-lg font-semibold text-blue-700">{status}</p>
      )}
    </div>
  );
}
