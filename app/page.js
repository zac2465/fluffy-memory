"use client";
import { useEffect, useState } from "react";

export default function AgendaPage() {
  const [agenda, setAgenda] = useState(null);
  const [announcements, setAnnouncements] = useState(null);
  const [birthdays, setBirthdays] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/agenda");
      const data = await res.json();

      setAgenda(data.agenda);
      setAnnouncements(data.announcements);
      setBirthdays(data.birthdays);
    }
    fetchData();
  }, []);

  if (!agenda) return <p className="p-6 text-gray-800">Loading...</p>;

  const headers = agenda[0];
  const rows = agenda.slice(1);

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

  // ---- Announcements Fix ----
  let announcementsForThisWeek = [];
  if (announcements && announcements.length > 1) {
    const rows = announcements.slice(1);

    const matchingRows = rows.filter((r) => {
      if (!r[0]) return false;
      const rowDate = new Date(r[0]);

      const start = new Date(rowDate);
      start.setDate(rowDate.getDate() - 1); // show 1 day early

      const end = new Date(rowDate);
      end.setDate(rowDate.getDate() + 6); // keep for 7 days total

      return today >= start && today <= end;
    });

    if (matchingRows.length > 0) {
      announcementsForThisWeek = matchingRows.flatMap((row, rowIdx) =>
        row[1]
          ? row[1].split("\n").map((line, idx) => <p key={`${rowIdx}-${idx}`}>{line}</p>)
          : []
      );
    }
  }

  // ---- Birthdays ----
  function getUpcomingBirthdays() {
    if (!birthdays || birthdays.length <= 1) return [];
    const twoWeeks = new Date(today);
    twoWeeks.setDate(today.getDate() + 13);

    const rows = birthdays.slice(1);
    return rows
      .map(([dateStr, name]) => {
        if (!dateStr || !name) return null;
        const [day, month] = dateStr.split(" ");
        const monthIndex = new Date(`${month} 1, 2020`).getMonth();
        const thisYearDate = new Date(today.getFullYear(), monthIndex, day);
        if (thisYearDate < today) {
          thisYearDate.setFullYear(today.getFullYear() + 1);
        }
        if (thisYearDate >= today && thisYearDate <= twoWeeks) {
          return { date: thisYearDate, name };
        }
        return null;
      })
      .filter(Boolean);
  }

  const upcomingBirthdays = getUpcomingBirthdays();

  function formatName(name) {
    const [last, firstAndMiddle] = name.split(",").map((p) => p.trim());
    if (!firstAndMiddle) return name;
    const first = firstAndMiddle.split(" ")[0];
    return `${first} ${last}`;
  }

  function renderBirthdayCalendar() {
    if (upcomingBirthdays.length === 0)
      return <p>No birthdays this week</p>;

    const start = new Date(today);
    start.setDate(start.getDate() - start.getDay());
    const days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });

    return (
      <div className="grid grid-cols-7 gap-2 border border-gray-300 p-2 rounded-lg">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center font-semibold border-b pb-1">
            {d}
          </div>
        ))}

        {days.map((date) => {
          const birthdaysForDay = upcomingBirthdays.filter(
            (b) => b.date.toDateString() === date.toDateString()
          );

          return (
            <div
              key={date.toISOString()}
              className="min-h-[100px] flex flex-col border-t pt-1 px-1 text-xs leading-tight rounded-lg"
            >
              <div className="font-bold">{date.getDate()}</div>
              {birthdaysForDay.map((b, idx) => (
                <div key={idx} className="text-blue-700 break-words">
                  {formatName(b.name)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <main className="bg-with-overlay text-black min-h-screen mx-auto max-w-xl p-4">
      <h1 className="text-3xl font-bold text-center mb-2">
        Welcome to the Church of Jesus Christ of Latter-day Saints
      </h1>
      <h2 className="text-xl font-semibold text-center mb-2">
        Tremonton 6th Ward Sacrament Meeting
      </h2>
      <p className="text-center text-black text-xl mb-6">{meetingDate}</p>

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
      <section className="mt-8">
        <h3 className="text-2xl font-bold mb-2">Announcements</h3>
        {announcementsForThisWeek.length > 0 ? (
          <div className="space-y-1">{announcementsForThisWeek}</div>
        ) : (
          <p>No announcements for this week.</p>
        )}
      </section>

      {/* Birthdays */}
      <section className="mt-8">
        <h3 className="text-2xl font-bold mb-2">Birthdays (Next 2 Weeks)</h3>
        {renderBirthdayCalendar()}
      </section>
    </main>
  );
}
