"use client";
import PaymentsClient from "./PaymentsClient";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ImageUploadClient from "./ImageUploadClient";
import PatientList from "./PatientsList";
import Revenue from "./Revenue";
import SeenPatients from "./Seen";
import { User } from "@prisma/client";

export default function DashboardLayout({ user }: { user: User }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get("tab") as
    | "none"
    | "upload"
    | "patients"
    | "revenue"
    | "payments"
    | null;

  const [selected, setSelected] = useState<
    "none" | "upload" | "patients" | "revenue" | "payments"
  >(initialTab ?? "none");

  // Sync state with URL changes
  useEffect(() => {
    if (initialTab && initialTab !== selected) {
      setSelected(initialTab);
    }
  }, [initialTab]);

  const handleSelect = (tab: typeof selected) => {
    router.replace(`/?tab=${tab}`);
    setSelected(tab);
  };

  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside
        className={`border-r bg-white shadow-md transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          {sidebarOpen && <h2 className="text-xl font-bold">Menu</h2>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600"
            title="Toggle Sidebar"
          >
            ☰
          </button>
        </div>

        <nav className="mt-6 flex flex-col space-y-2 px-2">
          <SidebarItem
            label="Upload Patient Records"
            value="upload"
            selected={selected}
            onSelect={() => handleSelect("upload")}
            open={sidebarOpen}
          />
          <SidebarItem
            label="Patients"
            value="patients"
            selected={selected}
            onSelect={() => handleSelect("patients")}
            open={sidebarOpen}
          />
          <SidebarItem
            label="Revenue"
            value="revenue"
            selected={selected}
            onSelect={() => handleSelect("revenue")}
            open={sidebarOpen}
          />
          <SidebarItem
            label="Payments"
            value="payments"
            selected={selected}
            onSelect={() => handleSelect("payments")}
            open={sidebarOpen}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {selected === "none" && (
          <>
            <h1 className="mb-4 text-2xl font-bold">Welcome Doctor</h1>
            <SeenPatients />
          </>
        )}

        {selected === "upload" && (
          <>
            <h1 className="mb-4 text-2xl font-bold">Upload Patient Details</h1>
            <ImageUploadClient />
          </>
        )}

        {selected === "patients" && (
          <>
            <h1 className="mb-4 text-2xl font-bold">Patients List</h1>
            <PatientList />
          </>
        )}

        {selected === "revenue" && (
          <>
            <h1 className="mb-4 text-2xl font-bold">Revenue</h1>
            <Revenue />
          </>
        )}
        {selected === "payments" && (
          <>
            <h1 className="mb-4 text-2xl font-bold">Payments</h1>
            <PaymentsClient />
          </>
        )}
      </main>
    </div>
  );
}

function SidebarItem({
  label,
  value,
  selected,
  onSelect,
  open,
}: {
  label: string;
  value: "upload" | "patients" | "revenue" | "payments";
  selected: string;
  onSelect: () => void;
  open: boolean;
}) {
  const isActive = selected === value;

  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-center rounded-md px-4 py-2 text-left transition ${
        isActive
          ? "bg-blue-100 font-semibold text-blue-700"
          : "hover:bg-gray-100"
      } ${!open && "justify-center"}`}
    >
      {open ? (
        <span>{label}</span>
      ) : (
        <div className="h-2 w-2 rounded-full bg-blue-500" />
      )}
    </button>
  );
}
