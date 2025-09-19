"use client";
import { useEffect, useState } from "react";

export default function AgendaPage() {
  const [agenda, setAgenda] = useState(null);

  useEffect(() => {
    async function fetchAgenda() {
      const res = await fetch("/api/agenda");
      const data = await res.json();
      setAgenda(data.values);
    }
    fetchAgenda();
  }, []);

  if (!agenda) return <p className="p-6 text-gray-600">Loading...</p>;

  const headers = agenda[0];
  const rows = agenda.slice(1);

  // ✅ Figure out the "current week" row
  const today = new Date();

  // ✅ Find the most recent agenda whose switchDate <= today
let thisWeek = null;
for (const row of rows) {
  const dateCell = row[0];
  if (!dateCell) continue;

  const rowDate = new Date(dateCell);
  const switchDate = new Date(rowDate);
  switchDate.setDate(rowDate.getDate() - 1);

  if (today >= switchDate) {
    thisWeek = row; // keep updating until the latest valid one
  }
}


  if (!thisWeek) return <p className="p-6">No agenda found for this week.</p>;

  const meetingDate = new Date(thisWeek[0]).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // ✅ Render text or clean hymn link
  function renderCell(header, cell) {
    if (cell && cell.startsWith("http") && header.toLowerCase().includes("hymn")) {
      try {
        const url = new URL(cell);
        const parts = url.pathname.split("/");

        // Get the last slug before query string
        let slug = parts[parts.length - 1] || parts[parts.length - 2] || "";
        slug = slug.split("?")[0];

        // Strip "release-x" and trailing numbers
        slug = slug.replace(/-release-\d+/i, "");
        slug = slug.replace(/-\d+$/i, "");

        // Title Case
        const title = slug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <a
            href={cell}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {title}
          </a>
        );
      } catch {
        return cell; // fallback if URL parsing fails
      }
    }
    return cell;
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full p-6 bg-white shadow-lg rounded-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">
          Tremonton 6th Ward Sacrament Meeting <br />
          <span className="text-gray-600 text-lg">{meetingDate}</span>
        </h1>

        <div className="space-y-3">
          {headers.slice(1).map((header, i) => {
            const cellValue = thisWeek[i + 1] || "";

            // ✅ Skip if right-hand side is empty
            if (!cellValue) return null;

            return (
              <div key={i} className="flex text-lg">
                <span className="whitespace-nowrap">{header}</span>
                <span className="flex-1 border-b border-dotted border-gray-400 mx-2"></span>
                <span className="whitespace-nowrap">
                  {renderCell(header, cellValue)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
