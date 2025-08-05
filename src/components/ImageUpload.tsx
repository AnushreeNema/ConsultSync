"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";

export default function ImageUpload() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImage(base64);
      setLoading(true);
      const result = await Tesseract.recognize(base64, "eng", {
        logger: (m) => console.log(m),
      });
      setText(result.data.text);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mx-auto max-w-xl space-y-4 p-6">
      <h2 className="text-2xl font-bold">Upload Patient Sheet Image</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="block"
      />
      {loading && <p className="text-blue-500">Extracting text...</p>}
      {image && (
        <img
          src={image}
          alt="Uploaded"
          className="mt-4 max-h-60 rounded shadow"
        />
      )}
      {text && (
        <div className="mt-4">
          <h3 className="font-semibold">Extracted Text:</h3>
          <pre className="whitespace-pre-wrap rounded bg-gray-100 p-3">
            {text}
          </pre>
        </div>
      )}
    </div>
  );
}
