// app/api/check-url/route.js
export async function POST(req) {
  const { url } = await req.json();

  try {
    const res = await fetch(url, { method: "GET" });

    if (!res.ok) {
      return Response.json({ ok: false });
    }

    const html = await res.text();

    // Detect redirect or generic menu page (no actual hymn content)
    const looksLikeMenu =
      html.includes("hymns-for-home-and-church?lang=eng") ||
      html.includes("Hymns for Home and Church") && !html.includes("<h1");

    // Return ok only if it's not the menu page
    return Response.json({ ok: !looksLikeMenu });
  } catch (error) {
    console.error("Server checkUrlExists error:", error);
    return Response.json({ ok: false });
  }
}
