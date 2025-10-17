"use client";
import { useEffect, useState } from "react";
import { hymns } from "./lib/hymns";


export default function AgendaPage() {
  const [agenda, setAgenda] = useState(null);
  const [announcements, setAnnouncements] = useState(null);
  const [birthdays, setBirthdays] = useState(null);

  // ✅ Local in-memory cache for hymn URLs
  const hymnUrlCache = {};

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
  today.setHours(0, 0, 0, 0);

  let thisWeek = null;
  for (const row of rows) {
    const dateCell = row[0];
    if (!dateCell) continue;
    const rowDate = new Date(dateCell);
    const switchDate = new Date(rowDate);
    switchDate.setDate(rowDate.getDate() - 1);
    if (today >= switchDate) thisWeek = row;
  }

  if (!thisWeek) return <p className="p-6">No agenda found for this week.</p>;

  const meetingDate = new Date(thisWeek[0]).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // ✅ This version talks to your local API route
async function checkUrlExists(url) {
  try {
    const response = await fetch("/api/check-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await response.json();
    return data.ok; // 👈 Make sure this matches your API route return key
  } catch (err) {
    console.error("Client checkUrlExists error:", err);
    return false;
  }
}



  // ✅ Helper: clean up the title for URL slugs
  function slugifyTitle(title) {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

async function getHymnUrl(hymnNumber, title) {
  if (!title) return null;
  const num = parseInt(hymnNumber, 10);
  const slug = slugifyTitle(title);

  if (hymnUrlCache[hymnNumber]) {
    return hymnUrlCache[hymnNumber];
  }

  let finalUrl;

  if (num < 500) {
    finalUrl = `https://www.churchofjesuschrist.org/study/manual/hymns/${slug}?lang=eng`;
  } else {
    const base = "https://www.churchofjesuschrist.org/study/music/hymns-for-home-and-church";
    const releaseUrl = `${base}/${slug}-release-3?lang=eng`;
    const normalUrl = `${base}/${slug}?lang=eng`;

    // Try release version
    const okRelease = await checkUrlExists(releaseUrl, title);
    if (okRelease) {
      finalUrl = releaseUrl;
    } else {
      // fallback
      finalUrl = normalUrl;
    }
  }

  hymnUrlCache[hymnNumber] = finalUrl;
  return finalUrl;
}

function RenderHymnCell({ header, cell }) {
  const hymnNum = (cell || "").toString().replace(/\D/g, "");
  const raw = hymns[hymnNum];

  // Debug logs — keep these for one test
  console.log(
    `cell: ${cell} → hymnNum: ${hymnNum}`,
    raw ? `found: ${raw.title || raw}` : "not found",
    raw ? `url: ${raw.url || "none"}` : ""
  );

  if (!hymnNum || !raw) return <span>{cell}</span>;

  let title = "";
  let url = "";

  if (typeof raw === "string") {
    title = raw;
  } else if (typeof raw === "object") {
    title = raw.title;
    url = raw.url;
  }

  // Fallbacks
  if (!title) title = hymnNum;

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-700 hover:underline font-medium"
      >
        {`${hymnNum} – ${title}`}
      </a>
    );
  }

  // Fallback when no URL
  return <span>{`${hymnNum} – ${title}`}</span>;
}

function renderCell(header, cell) {
  if (header.toLowerCase().includes("hymn")) {
    return <RenderHymnCell header={header} cell={cell} />;
  }
  return cell;
}

  // ✅ Birthday calendar stays as you had it
  function renderBirthdayCalendar() {
    if (!birthdays || birthdays.length <= 1)
      return <p>No birthdays this week</p>;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfRange = new Date(startOfWeek);
    endOfRange.setDate(startOfWeek.getDate() + 13);

    const rows = birthdays.slice(1);

    const upcoming = rows
      .map(([dateStr, name]) => {
        if (!dateStr || !name) return null;

        const [dayStr, month] = dateStr.split(" ");
        const day = parseInt(dayStr);
        if (isNaN(day)) return null;

        const monthIndex = new Date(`${month} 1, 2020`).getMonth();
        let d = new Date(today.getFullYear(), monthIndex, day);
        d.setHours(0, 0, 0, 0);

        if (d < startOfWeek) d.setFullYear(today.getFullYear() + 1);
        if (d > endOfRange) return null;

        const parts = name.split(",").map((p) => p.trim());
        let formattedName = name;
        if (parts.length >= 2) {
          const firstLast = parts[1].split(" ");
          formattedName = `${firstLast[0]} ${parts[0]}`;
        }

        return { date: d, name: formattedName };
      })
      .filter(Boolean);

    return (
      <div className="grid grid-cols-7 gap-2 bg-transparent">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="text-center font-semibold border-b border-gray-300 pb-1 text-sm"
          >
            {d}
          </div>
        ))}

        {Array.from({ length: 14 }, (_, i) => {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + i);
          date.setHours(0, 0, 0, 0);

          const dayBirthdays = upcoming.filter(
            (b) => b.date.toDateString() === date.toDateString()
          );

          return (
            <div
              key={i}
              className="min-h-[80px] flex flex-col border-t border-gray-200 pt-1 text-xs"
            >
              <div className="font-bold">{date.getDate()}</div>
              {dayBirthdays.map((b, idx) => (
                <div key={idx} className="text-blue-700 truncate" title={b.name}>
                  {b.name}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <main className="bg-with-overlay text-black min-h-screen mx-auto max-w-4xl p-4 space-y-8">
      <header className="text-center space-y-1">
        <h1 className="text-2xl font-bold">
          Welcome to the Church of Jesus Christ of Latter-day Saints
        </h1>
        <h2 className="text-lg font-semibold">
          Tremonton 6th Ward Sacrament Meeting
        </h2>
        <p className="text-gray-700 text-base">{meetingDate}</p>
      </header>

      <section className="p-4 space-y-2 bg-transparent">
        {headers.slice(1).map((header, i) => {
          const cell = thisWeek[i + 1];
          if (!cell) return null;
          return (
            <div key={i} className="flex text-base">
              <span className="font-medium w-40">{header}</span>
              <span className="flex-1 border-b border-dotted border-gray-400 mx-2"></span>
              <span>{renderCell(header, cell)}</span>
            </div>
          );
        })}
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-2">Announcements</h3>
        <div className="p-4 space-y-2">
          {(() => {
            if (!announcements || announcements.length <= 1) {
              return <p>No announcements for this week.</p>;
            }

            // Extract date + announcement rows
            const rows = announcements.slice(1); // skip header row
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // find the one matching this week's agenda
            const thisWeekRow = rows.find(([dateStr]) => {
              if (!dateStr) return false;
              const d = new Date(dateStr);
              const diff = today - d;
              // Match the same logic as your agenda (Sunday–Saturday window)
              return diff >= -86400000 && diff < 6 * 86400000; // within ±6 days
            });

            const announcementText = thisWeekRow?.[1]?.trim();

            return announcementText ? (
              <p className="text-gray-800 whitespace-pre-line">{announcementText}</p>
            ) : (
              <p>No announcements for this week.</p>
            );
          })()}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-2">Birthdays (Next 2 Weeks)</h3>
        {renderBirthdayCalendar()}
      </section>
    </main>
  );
}
