"use client";
import { useEffect, useState } from "react";

export default function CalendarPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      const res = await fetch("/api/calendar");
      const data = await res.json();
      setEvents(data.events || []);
    }
    fetchEvents();
  }, []);

  return (
    <main className="bg-with-overlay min-h-screen text-black p-6">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold">Ward Calendar</h1>
        <p className="text-gray-600">Upcoming Activities & Events</p>
      </header>

      {events.length === 0 ? (
        <p className="text-center text-gray-500">No events found.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {events.map((e, i) => (
            <div
              key={i}
              className="p-4 bg-white rounded-xl shadow border border-gray-200"
            >
              <h3 className="font-semibold text-lg">{e.title}</h3>
              <p className="text-gray-600 text-sm">
                {new Date(e.date).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {e.location && (
                <p className="text-gray-700 text-sm">📍 {e.location}</p>
              )}
              {e.description && (
                <p className="text-gray-800 text-sm mt-2">{e.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
