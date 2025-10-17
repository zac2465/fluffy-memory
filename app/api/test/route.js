// app/api/agenda/route.js
// Server-side: fetch Google Sheets (agenda, announcements, birthdays)
// and attempt to enrich hymn URLs with hymn numbers (best-effort).

export async function GET() {
  try {
    const spreadsheetId = "1qZe_O7wK7ZD3xBprskp0ds9Oin0lR3na-xTi4NOQ2K0"; // replace if needed
    const apiKey = process.env.GOOGLE_API_KEY;

    async function fetchSheet(range) {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        range
      )}?key=${apiKey}`;
      const r = await fetch(url);
      if (!r.ok) {
        throw new Error(`Failed to fetch ${range}: ${r.status} ${r.statusText}`);
      }
      return r.json();
    }

    const [agendaData, announcementsData, birthdaysData] = await Promise.all([
      fetchSheet("agenda!A1:Z500"),
      fetchSheet("announcements!A1:B500"),
      fetchSheet("birthdays!A1:B500"),
    ]);

    // Attempt to enrich hymn cells in agendaData: if a cell contains a URL (no "number | url"),
    // fetch the hymn page server-side and try to extract a number.
    // This is best-effort (remote sites differ). We'll only fetch unique URLs and limit concurrency.
    const agendaValues = agendaData.values || [];
    if (agendaValues.length > 0) {
      const headers = agendaValues[0].map((h) => (h ? h.toString().toLowerCase() : ""));
      // collect hymn column indexes
      const hymnCols = headers
        .map((h, idx) => (h.includes("hymn") ? idx : -1))
        .filter((i) => i >= 0);

      // gather unique urls to fetch
      const urls = new Map(); // url -> { rows: [ {r,c} ] }
      for (let r = 1; r < agendaValues.length; r++) {
        const row = agendaValues[r];
        for (const c of hymnCols) {
          const cell = (row[c] || "").toString();
          if (!cell) continue;
          // If cell already contains "number | url", skip
          if (cell.includes("|")) continue;
          // check if contains http
          const m = cell.match(/https?:\/\/[^\s]+/i);
          if (m) {
            const url = m[0];
            if (!urls.has(url)) urls.set(url, []);
            urls.get(url).push({ r, c });
          }
        }
      }

      // helper: extract hymn number heuristically from HTML text
      function extractHymnNumberFromHtml(html, url) {
        try {
          const lowered = html.toLowerCase();
          // attempt 1: find the URL slug/title in the HTML and look backwards for 2-4 digit number
          try {
            const slug = new URL(url).pathname.split("/").pop().split("?")[0].replace(/-release-\d+/i, "").replace(/-\d+$/i, "");
            const titleText = slug.replace(/-/g, " ").toLowerCase();
            const idx = lowered.indexOf(titleText);
            if (idx > -1) {
              // look back up to 300 chars for a 2-4 digit number
              const before = lowered.slice(Math.max(0, idx - 300), idx);
              const m = before.match(/(\d{2,4})/);
              if (m) return m[1];
            }
          } catch (e) {
            // ignore
          }

          // attempt 2: search for patterns like "<span...>1028</span>" near words "hymn" or "number"
          const m2 = lowered.match(/(hymn[^<>]{0,30}(\d{2,4}))|((\d{2,4})[^<>]{0,30}hymn)/);
          if (m2) {
            const mm = m2[0].match(/(\d{2,4})/);
            if (mm) return mm[1];
          }

          // attempt 3: fallback - first 2-4 digit number in the page
          const m3 = lowered.match(/(\d{2,4})/);
          if (m3) return m3[1];

          return null;
        } catch (err) {
          return null;
        }
      }

      // fetch unique urls with bounded concurrency
      const limit = 5;
      const entries = Array.from(urls.keys());
      async function fetchWithConcurrency(list) {
        const results = {};
        let idx = 0;

        async function worker() {
          while (idx < list.length) {
            const i = idx++;
            const url = list[i];
            try {
              // timeout controller
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 8000);
              const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "agenda-site/1.0" } });
              clearTimeout(timeout);
              if (!res.ok) {
                results[url] = null;
                continue;
              }
              const text = await res.text();
              const number = extractHymnNumberFromHtml(text, url);
              results[url] = number;
            } catch (err) {
              results[url] = null;
            }
          }
        }

        // spawn workers
        const workers = Array.from({ length: Math.min(limit, list.length) }, worker);
        await Promise.all(workers);
        return results;
      }

      if (entries.length > 0) {
        const urlToNumber = await fetchWithConcurrency(entries);
        // apply numbers back into agendaValues by updating cells to "NUMBER | URL" if found
        for (const [url, number] of Object.entries(urlToNumber)) {
          if (!number) continue;
          const positions = urls.get(url) || [];
          for (const pos of positions) {
            const cur = (agendaValues[pos.r][pos.c] || "").toString();
            // update only if not already containing a number
            if (!cur.includes("|")) {
              agendaValues[pos.r][pos.c] = `${number} | ${url}`;
            }
          }
        }
      }

      // commit back changed agendaData
      agendaData.values = agendaValues;
    }

    return new Response(
      JSON.stringify({
        agenda: agendaData.values || [],
        announcements: announcementsData.values || [],
        birthdays: birthdaysData.values || [],
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("API error:", err);
    return new Response(JSON.stringify({ error: String(err.message || err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
