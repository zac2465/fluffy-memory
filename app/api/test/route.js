export async function GET() {
  try {
    const spreadsheetId = "1qZe_O7wK7ZD3xBprskp0ds9Oin0lR3na-xTi4NOQ2K0";

    // We'll fetch agenda, announcements, and birthday in parallel
    const ranges = ["agenda!A1:Z500", "announcements!A1:B100", "birthday!A1:C200"];
    const apiKey = process.env.GOOGLE_API_KEY;

    // Fetch all three in parallel
    const requests = ranges.map((range) =>
      fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
          range
        )}?key=${apiKey}`
      ).then((res) => res.json())
    );

    const [agendaData, announcementsData, birthdayData] = await Promise.all(requests);

    return new Response(
      JSON.stringify({
        agenda: agendaData.values || [],
        announcements: announcementsData.values || [],
        birthdays: birthdayData.values || [],
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
