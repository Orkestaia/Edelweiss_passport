export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[\w-]{43}$/.test(token)) return new Response("Not found", { status: 404 });
  return Response.json({ id: `/p/${token}`, name: "Edelweiss Swiss Passport", short_name: "Swiss Passport", start_url: `/p/${token}`, scope: "/", display: "standalone", theme_color: "#5E6F52", background_color: "#F4ECD8", icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" }, { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" }] }, { headers: { "Content-Type": "application/manifest+json", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });
}
