"use client";

import { useEffect, useState } from "react";

interface Patient {
  id: string;
  name: string;
  age: number | null;
  ipdNumber: string | null;
  hospital: string;
  visitingCharge: number | null;
  createdAt: string;
}

export default function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/patients");
        const data = await res.json();
        setPatients(data);
      } catch (err) {
        console.error("Error loading patients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this patient?")) return;

    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPatients((prev) => prev.filter((p) => p.id !== id));
      } else {
        const error = await res.json();
        alert(`Delete failed: ${error.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Failed to delete patient", err);
    }
  };

  if (loading) return <p className="text-gray-500">Loading patients...</p>;
  if (patients.length === 0)
    return <p className="text-gray-500">No patients found.</p>;

  return (
    <ul className="space-y-2">
      {patients.map((p) => (
        <li
          key={p.id}
          className="flex items-center justify-between rounded border bg-white p-4 shadow"
        >
          <div>
            <h2 className="text-lg font-bold">{p.name}</h2>
            <p className="text-sm text-gray-600">
              IPD: {p.ipdNumber || "N/A"} | Age: {p.age ?? "N/A"} | Hospital:{" "}
              {p.hospital}
            </p>
            <p className="text-sm text-gray-700">
              Visiting Charge: ₹{p.visitingCharge ?? 0}
            </p>
          </div>
          <button
            onClick={() => handleDelete(p.id)}
            className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
