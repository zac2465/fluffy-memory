export async function GET() {
  try {
    const spreadsheetId = "1qZe_O7wK7ZD3xBprskp0ds9Oin0lR3na-xTi4NOQ2K0";
    const apiKey = process.env.GOOGLE_API_KEY;

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
      fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Calendar!A1:E500?key=${apiKey}`
      ),
    ]);

    const [agendaData, announcementsData, birthdaysData] = await Promise.all([
      agendaRes.json(),
      announcementsRes.json(),
      birthdaysRes.json(),
    ]);

    // DEBUGGING: Log what we got back from Google Sheets
    console.log("Agenda rows:", agendaData.values?.length);
    console.log("Announcements rows:", announcementsData.values?.length);
    console.log("Birthdays rows:", birthdaysData.values?.length);

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
    console.error("Error fetching sheets:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
