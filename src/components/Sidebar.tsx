"use client";

import { useState } from "react";
import { cn } from "@/lib/utils"; // or replace with a classNames utility

export default function Sidebar({
  onSelect,
}: {
  onSelect: (view: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <aside
      className={cn(
        "h-screen border-r bg-white shadow-md transition-all duration-300",
        open ? "w-64" : "w-16",
      )}
    >
      <div className="flex justify-end p-2">
        <button onClick={() => setOpen(!open)} title="Toggle Sidebar">
          ☰
        </button>
      </div>

      <div className={cn("px-4", open ? "block" : "hidden")}>
        <h2 className="mb-4 text-lg font-bold">Menu</h2>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onSelect("patients")}
              className="w-full rounded px-3 py-2 text-left font-medium text-gray-700 hover:bg-gray-100"
            >
              Patients
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
