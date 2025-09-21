"use client";
import { useEffect, useState } from "react";

export default function AgendaPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/agenda");
      const json = await res.json();
      setData(json);
    }
    fetchData();
  }, []);

  if (!data) return <p className="p-6 text-gray-800">Loading...</p>;

  const agenda = data.agenda || [];
  const announcements = data.announcements || [];
  const birthdays = data.birthdays || [];

  if (!agenda.length) return <p className="p-6">No agenda data found.</p>;

  const headers = agenda[0];
  const rows = agenda.slice(1);

  // === AGENDA: find this week's row ===
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

  // === HELPER: Format hymn links ===
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

  // === ANNOUNCEMENTS: filter this week's announcements ===
  const thisWeeksAnnouncements = announcements.filter((row) => {
    if (!row[0]) return false;
    const date = new Date(row[0]);
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === thisWeek ? date.getDate() : date.getDate()
    );
  });

  // === BIRTHDAYS: filter birthdays this week ===
  const upcomingBirthdays = birthdays.filter((row) => {
    if (!row[0]) return false;
    const birthday = new Date(row[0]);
    const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());

    const diffDays = (thisYearBirthday - today) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  });

  // Helper: format names as "First Last"
  function formatName(name) {
    const [last, firstMiddle] = name.split(",");
    if (!last || !firstMiddle) return name;
    return `${firstMiddle.trim().split(" ")[0]} ${last.trim()}`;
  }

  return (
    <main className="bg-with-overlay text-black min-h-screen mx-auto max-w-xl p-4">
      {/* Header */}
      <h1 className="text-3xl font-bold text-center mb-2">
        Welcome to the Church of Jesus Christ of Latter-day Saints
      </h1>
      <h2 className="text-xl font-semibold text-center mb-2">
        Tremonton 6th Ward Sacrament Meeting
      </h2>
      <p className="text-center text-black text-xl mb-6">{meetingDate}</p>

      {/* Agenda */}
      <div className="space-y-3">
        {headers.slice(1).map((header, i) => {
          if (i + 1 >= thisWeek.length) return null;
          const cellValue = thisWeek[i + 1];
          if (!cellValue) return null;
          return (
            <div key={i} className="flex text-lg text-gray-800">
              <span className="whitespace-nowrap">{header}</span>
              <span className="flex-1 border-b border-dotted border-gray-400 mx-2"></span>
              <span className="whitespace-nowrap">{renderCell(header, cellValue)}</span>
            </div>
          );
        })}
      </div>

      {/* Announcements */}
      {thisWeeksAnnouncements.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-bold text-center mb-4">Announcements</h3>
          <div className="space-y-4">
            {thisWeeksAnnouncements.map((row, idx) => (
              <p
                key={idx}
                className="whitespace-pre-line text-gray-800"
              >
                {row[1] || ""}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Birthdays */}
      {upcomingBirthdays.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl font-bold text-center mb-4">Birthdays This Week</h3>
          <table className="w-full border-collapse border border-gray-400">
            <tbody>
              {upcomingBirthdays.map((row, idx) => (
                <tr key={idx} className="border-t border-gray-300">
                  <td className="p-2">{formatName(row[1] || "")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
