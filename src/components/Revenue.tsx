"use client";

import { useEffect, useState } from "react";

interface PatientVisit {
  name: string;
  hospital: string | null;
  visitingCharge: number | null;
  dates: string[];
}

export default function Revenue() {
  const [hospitals, setHospitals] = useState<string[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>("");
  const [revenueData, setRevenueData] = useState<PatientVisit[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch the list of hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await fetch("/api/revenue/hospitals");
        const data = await res.json();

        if (Array.isArray(data) && data.every((h) => typeof h === "string")) {
          setHospitals(data);
          if (data.length > 0) setSelectedHospital(data[0]);
        } else {
          console.error("Invalid hospital list response:", data);
          setHospitals([]);
        }
      } catch (err) {
        console.error("Failed to fetch hospitals", err);
        setHospitals([]);
      }
    };

    fetchHospitals();
  }, []);

  // Fetch revenue data for selected hospital
  useEffect(() => {
    if (!selectedHospital) return;

    const fetchRevenue = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/revenue?hospital=${selectedHospital}`);
        const data = await res.json();
        setRevenueData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch revenue", err);
        setRevenueData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [selectedHospital]);

  const totalRevenue = revenueData.reduce(
    (sum, p) => sum + (p.visitingCharge ?? 0) * p.dates.length,
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <label className="mr-3 font-semibold">Select Hospital:</label>
        <select
          value={selectedHospital}
          onChange={(e) => setSelectedHospital(e.target.value)}
          className="rounded border px-3 py-1"
        >
          {hospitals.map((hosp) => (
            <option key={hosp} value={hosp}>
              {hosp}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading revenue data...</p>
      ) : hospitals.length === 0 ? (
        <p className="text-gray-500">Please upload patients first.</p>
      ) : revenueData.length === 0 ? (
        <p className="text-gray-500">No revenue data available.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white p-4 shadow">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="border-b px-4 py-2">Patient</th>
                <th className="border-b px-4 py-2">Visits</th>
                <th className="border-b px-4 py-2">Dates Seen</th>
                <th className="border-b px-4 py-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.map((p, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">{p.dates.length}</td>
                  <td className="px-4 py-2">
                    {p.dates.map((d) => (
                      <span
                        key={d}
                        className="mr-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs"
                      >
                        {new Date(d).toLocaleDateString()}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-2 font-medium text-green-600">
                    ₹ {(p.visitingCharge ?? 0) * p.dates.length}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t font-semibold">
                <td className="px-4 py-2" colSpan={3}>
                  Total Revenue
                </td>
                <td className="px-4 py-2 text-green-700">
                  ₹ {totalRevenue.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
