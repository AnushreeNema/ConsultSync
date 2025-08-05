"use client";

import { useEffect, useState } from "react";
import { format, addDays, subDays } from "date-fns";

interface Patient {
  id: string;
  name: string;
  age: number | null;
  hospital: string | null;
  ipdNumber: string | null;
  visitingCharge: number | null;
  seen: boolean;
}

export default function SeenPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());

  const formattedDate = format(date, "yyyy-MM-dd");

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      const res = await fetch(
        `/api/patient-visit-status?date=${formattedDate}`,
      );
      const data = await res.json();
      setPatients(data);
      setLoading(false);
    };

    loadPatients();
  }, [formattedDate]);

  const updateSeenStatus = async (id: string, seen: boolean) => {
    await fetch(`/api/patient-visit-status/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seen, date: formattedDate }),
    });

    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, seen } : p)));
  };

  const updateAllForHospital = async (
    hospital: string | null,
    seen: boolean,
  ) => {
    const idsToUpdate = patients
      .filter((p) => p.hospital === hospital)
      .map((p) => p.id);

    await Promise.all(
      idsToUpdate.map((id) =>
        fetch(`/api/patient-visit-status/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seen, date: formattedDate }),
        }),
      ),
    );

    setPatients((prev) =>
      prev.map((p) => (p.hospital === hospital ? { ...p, seen } : p)),
    );
  };

  if (loading) return <p>Loading patients...</p>;

  if (patients.length === 0)
    return <p className="text-gray-500">No patients uploaded yet.</p>;

  const groupedByHospital: Record<string, Patient[]> = {};
  patients.forEach((p) => {
    const key = p.hospital ?? "Unknown";
    if (!groupedByHospital[key]) {
      groupedByHospital[key] = [];
    }
    groupedByHospital[key].push(p);
  });

  return (
    <div className="space-y-6">
      {/* Date navigation */}
      <div className="flex items-center justify-between border-b pb-2">
        <button
          onClick={() => setDate((prev) => subDays(prev, 1))}
          className="rounded px-3 py-1 text-lg hover:bg-gray-200"
        >
          ←
        </button>
        <h2 className="text-xl font-semibold">{format(date, "dd MMM yyyy")}</h2>
        <button
          onClick={() => setDate((prev) => addDays(prev, 1))}
          className="rounded px-3 py-1 text-lg hover:bg-gray-200"
        >
          →
        </button>
      </div>

      {/* Hospital grouped patients */}
      {Object.entries(groupedByHospital).map(([hospital, group]) => {
        const allSeen = group.every((p) => p.seen);

        return (
          <div key={hospital} className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-bold">{hospital}</h3>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={allSeen}
                  onChange={(e) =>
                    updateAllForHospital(hospital, e.target.checked)
                  }
                  className="h-4 w-4"
                />
                <span>Seen All</span>
              </label>
            </div>

            <div className="space-y-3">
              {group.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded border bg-white p-4 shadow-sm"
                >
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-gray-600">
                      Age: {p.age ?? "N/A"} | IPD: {p.ipdNumber ?? "N/A"} | ₹{" "}
                      {p.visitingCharge ?? 0}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      className={`rounded px-3 py-1 ${
                        p.seen ? "bg-green-500 text-white" : "bg-gray-200"
                      }`}
                      onClick={() => updateSeenStatus(p.id, true)}
                    >
                      Seen
                    </button>
                    <button
                      className={`rounded px-3 py-1 ${
                        !p.seen ? "bg-red-500 text-white" : "bg-gray-200"
                      }`}
                      onClick={() => updateSeenStatus(p.id, false)}
                    >
                      Not Seen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
