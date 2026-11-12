export async function onRequestGet({ env }) {
  const configured = Boolean(env.WA_ACCESS_TOKEN && env.WA_PHONE_NUMBER_ID);
  return Response.json({ ok: true, configured, provider: "WhatsApp Cloud API" });
}
