"use client";

import { useState } from "react";

interface PaymentCheck {
  name: string;
  ipd?: number;
  expectedAmount: number;
  paidAmount: number;
  status: "OK" | "Check";
  missingDates: string[];
}

export default function PaymentsClient() {
  const [file, setFile] = useState<File | null>(null);
  const [payments, setPayments] = useState<PaymentCheck[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (Array.isArray(data)) {
        setPayments(data);
      } else {
        console.error("Unexpected response:", data);
        setPayments([]);
      }
    } catch (err) {
      console.error("Upload failed", err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        onChange={handleFileChange}
        className="block rounded border p-2"
      />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Processing..." : "Upload & Match"}
      </button>

      {payments.length > 0 && (
        <div className="overflow-x-auto rounded-lg bg-white p-4 shadow">
          <table className="w-full table-auto text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Patient</th>
                <th className="border px-4 py-2">IPD</th>
                <th className="border px-4 py-2">Expected ₹</th>
                <th className="border px-4 py-2">Paid ₹</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Missing Dates</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">{p.ipd ?? "N/A"}</td>
                  <td className="px-4 py-2">₹ {p.expectedAmount}</td>
                  <td className="px-4 py-2">₹ {p.paidAmount}</td>
                  <td className="px-4 py-2 font-medium">
                    {p.status === "OK" ? (
                      <span className="text-green-600">OK</span>
                    ) : (
                      <span className="text-red-600">Check</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {p.missingDates.length === 0 ? (
                      <span>—</span>
                    ) : (
                      <ul className="ml-4 list-disc">
                        {p.missingDates.map((d, idx) => (
                          <li key={idx}>{d}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
