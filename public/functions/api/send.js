export async function onRequestPost({ request, env }) {
  if (!env.WA_ACCESS_TOKEN || !env.WA_PHONE_NUMBER_ID) {
    return Response.json({ error: "Server belum dikonfigurasi. Isi WA_ACCESS_TOKEN dan WA_PHONE_NUMBER_ID." }, { status: 503 });
  }
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "JSON tidak valid." }, { status: 400 }); }
  const to = String(body.to || "").replace(/\D/g, "");
  const message = String(body.message || "").trim();
  if (!/^\d{8,15}$/.test(to) || !message || message.length > 4096) {
    return Response.json({ error: "Nomor harus format internasional (8–15 digit) dan pesan tidak boleh kosong." }, { status: 400 });
  }
  const response = await fetch(`https://graph.facebook.com/v23.0/${env.WA_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.WA_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, type: "text", text: { preview_url: false, body: message } })
  });
  const data = await response.json();
  if (!response.ok) return Response.json({ error: data.error?.message || "WhatsApp API request failed." }, { status: response.status });
  return Response.json({ ok: true, messageId: data.messages?.[0]?.id || null });
}
