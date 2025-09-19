export async function GET() {
  return new Response(
    JSON.stringify({ key: process.env.GOOGLE_API_KEY }),
    { headers: { "Content-Type": "application/json" } }
  );
}
