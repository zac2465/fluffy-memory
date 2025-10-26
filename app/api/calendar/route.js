/*
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.SHEET_ID;

    const range = "Calendar!A2:D"; // skip header
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });

    const rows = response.data.values || [];
    const events = rows.map(([date, title, location, description]) => ({
      date,
      time,
      title,
      location,
      description,
    }));

    return NextResponse.json({ events });
  } catch (err) {
    console.error("Calendar API error:", err);
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}
*/