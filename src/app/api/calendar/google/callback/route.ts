import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return new NextResponse(
      `<html><body><script>window.close()</script><p>Erreur: ${error}</p></body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "Code d'autorisation manquant" },
      { status: 400 }
    );
  }

  // TODO: Exchange code for tokens and store in DB
  // For now, just acknowledge and close the popup
  console.log("Google Calendar auth code received:", code);

  return new NextResponse(
    `<html>
      <body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a0f;color:#fff">
        <div style="text-align:center">
          <p>Google Calendar connecté avec succès.</p>
          <p style="color:#888;font-size:14px">Cette fenêtre va se fermer...</p>
        </div>
        <script>
          setTimeout(function() { window.close(); }, 1500);
        </script>
      </body>
    </html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
