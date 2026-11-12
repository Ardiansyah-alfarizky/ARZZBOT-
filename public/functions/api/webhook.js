export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === env.WA_VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}
export async function onRequestPost({ request, env }) {
  const payload = await request.json().catch(() => null);
  if (!payload) return new Response("Bad Request", { status: 400 });
  // TODO: Verify X-Hub-Signature-256 with WA_APP_SECRET before production use.
  const entries = payload.entry || [];
  for (const entry of entries) {
    for (const change of entry.changes || []) {
      for (const msg of change.value?.messages || []) {
        if (msg.type === "text" && env.WA_ACCESS_TOKEN && env.WA_PHONE_NUMBER_ID && env.AUTO_REPLY_TEXT) {
          await fetch(`https://graph.facebook.com/v23.0/${env.WA_PHONE_NUMBER_ID}/messages`, {
            method: "POST",
            headers: { Authorization: `Bearer ${env.WA_ACCESS_TOKEN}`, "Content-Type": "application/json" },
            body: JSON.stringify({ messaging_product: "whatsapp", to: msg.from, type: "text", text: { body: env.AUTO_REPLY_TEXT } })
          });
        }
      }
    }
  }
  return new Response("EVENT_RECEIVED", { status: 200 });
}
