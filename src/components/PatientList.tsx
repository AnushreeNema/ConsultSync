// src/components/PatientsList.tsx
"use client";

import { useEffect, useState } from "react";

interface Patient {
  id: string;
  name: string;
  age: number;
  ipdNumber: string;
  hospital: string;
  visitingCharge: number;
  seen: boolean;
}

export default function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patient-list")
      .then((res) => res.json())
      .then((data) => {
        setPatients(data);
        setLoading(false);
      });
  }, []);

  const toggleSeen = async (id: string, seen: boolean) => {
    await fetch(`/api/patient-list/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ seen }),
    });

    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, seen } : p)));
  };

  if (loading) return <p>Loading patients...</p>;

  return (
    <ul className="space-y-4">
      {patients.map((p) => (
        <li key={p.id} className="rounded border bg-white p-4 shadow">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-sm text-gray-500">
                {p.hospital} (IPD: {p.ipdNumber})
              </p>
              <p className="text-sm text-gray-500">
                Charge: ₹{p.visitingCharge}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className={`rounded px-3 py-1 text-sm ${
                  p.seen ? "bg-green-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => toggleSeen(p.id, true)}
              >
                Seen
              </button>
              <button
                className={`rounded px-3 py-1 text-sm ${
                  !p.seen ? "bg-red-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => toggleSeen(p.id, false)}
              >
                Not Seen
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
