import React, { useState } from "react";
import { BetweenVerticalEnd, Table, Grid3X3 } from "lucide-react";

const options = [
  { value: "day", label: "Día", icon: <BetweenVerticalEnd className="w-4 h-4" /> },
  { value: "week", label: "Semana", icon: <Table className="w-4 h-4" /> },
  { value: "month", label: "Mes", icon: <Grid3X3 className="w-4 h-4" /> },
];

export default function CalendarSelect({ typeCalendar, setTypeCalendar }) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find(o => o.value === typeCalendar);

  return (
    <div className="relative inline-block w-40">
      <div
        className="border border-gray-300 rounded px-3 py-1 text-sm flex items-center justify-between cursor-pointer bg-white"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          {selectedOption.icon}
          {selectedOption.label}
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg">
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => {
                setTypeCalendar(opt.value);
                setOpen(false);
              }}
              className="px-3 py-2 flex items-center gap-2 hover:bg-gray-100 cursor-pointer"
            >
              {opt.icon}
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
