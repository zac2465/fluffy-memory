export async function GET() {
  try {
    // Google Sheets API endpoint
    const spreadsheetId = "1qZe_O7wK7ZD3xBprskp0ds9Oin0lR3na-xTi4NOQ2K0"; // <-- replace this with your Sheet ID
    const range = "agenda!A1:M500"; // adjust range to your sheet

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${process.env.GOOGLE_API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
