export async function GET() {
  try {
    const spreadsheetId = "1qZe_O7wK7ZD3xBprskp0ds9Oin0lR3na-xTi4NOQ2K0";
    const apiKey = process.env.GOOGLE_API_KEY;

    // --- Fetch all 3 sheets in parallel ---
    const [agendaRes, announcementsRes, birthdaysRes] = await Promise.all([
      fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/agenda!A1:Z500?key=${apiKey}`
      ),
      fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/announcements!A1:B100?key=${apiKey}`
      ),
      fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/birthday!A1:B500?key=${apiKey}`
      ),
    ]);

    const [agendaData, announcementsData, birthdaysData] = await Promise.all([
      agendaRes.json(),
      announcementsRes.json(),
      birthdaysRes.json(),
    ]);

    return new Response(
      JSON.stringify({
        agenda: agendaData.values || [],
        announcements: announcementsData.values || [],
        birthdays: birthdaysData.values || [],
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
