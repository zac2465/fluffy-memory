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

  if (!agenda) return <p className="p-6 text-gray-800">Loading...</p>;

  const headers = agenda[0];
  const rows = agenda.slice(1);

  // Find the most recent agenda whose switchDate <= today
  const today = new Date();
  let thisWeek = null;
  for (const row of rows) {
    const dateCell = row[0];
    if (!dateCell) continue;

    const rowDate = new Date(dateCell);
    const switchDate = new Date(rowDate);
    switchDate.setDate(rowDate.getDate() - 1);

    if (today >= switchDate) {
      thisWeek = row;
    }
  }

  if (!thisWeek) return <p className="p-6">No agenda found for this week.</p>;

  const meetingDate = new Date(thisWeek[0]).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  function renderCell(header, cell) {
    if (cell && cell.startsWith("http") && header.toLowerCase().includes("hymn")) {
      try {
        const url = new URL(cell);
        const parts = url.pathname.split("/");

        let slug = parts[parts.length - 1] || parts[parts.length - 2] || "";
        slug = slug.split("?")[0];
        slug = slug.replace(/-release-\d+/i, "");
        slug = slug.replace(/-\d+$/i, "");

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
        return cell;
      }
    }
    return cell;
  }

      return (
        <main className="bg-with-overlay text-black min-h-screen mx-auto max-w-xl p-4">
          <h1 className="text-3xl font-bold text-center mb-2">
            Welcome to the Church of Jesus Christ of Latter-day Saints
          </h1>

          <h2 className="text-xl font-semibold text-center mb-2">
            Tremonton 6th Ward Sacrament Meeting
          </h2>

          <p className="text-center text-black text-xl mb-6">
            {meetingDate}
          </p>

      <div className="space-y-3">
        {headers.slice(1).map((header, i) => {
          const cellValue = thisWeek[i + 1] || "";
          if (!cellValue) return null;
          return (
            <div key={i} className="flex text-xl text-black">
              <span className="whitespace-nowrap">{header}</span>
              <span className="flex-1 border-b border-dotted border-gray-400 mx-2"></span>
              <span className="whitespace-nowrap">
                {renderCell(header, cellValue)}
              </span>
            </div>
          );
        })}
      </div>
    </main>
  );
}