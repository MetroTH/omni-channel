import { createHmac } from "crypto";

export type WAMessage = {
  from: string;
  id: string;
  type: string;
  text?: { body: string };
  timestamp: string;
};

/**
 * Verify WhatsApp/Meta webhook signature.
 * Meta signs with HMAC-SHA256 of the raw body using the app secret, hex-encoded,
 * and sends the result as "sha256=<hex>" in the X-Hub-Signature-256 header.
 */
export function verifySignature(
  rawBody: Buffer,
  signature: string,
  appSecret: string
): boolean {
  const expected = "sha256=" + createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");

  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Parse WhatsApp Cloud API webhook body into a flat array of WAMessage objects.
 * The Cloud API body structure:
 * { object: "whatsapp_business_account", entry: [{ changes: [{ value: { messages: [...] } }] }] }
 */
export function parseMessages(body: unknown): WAMessage[] {
  if (typeof body !== "object" || body === null) return [];

  const payload = body as {
    object?: string;
    entry?: Array<{
      changes?: Array<{
        value?: {
          messages?: WAMessage[];
        };
      }>;
    }>;
  };

  const messages: WAMessage[] = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const msg of change.value?.messages ?? []) {
        messages.push(msg);
      }
    }
  }
  return messages;
}

/**
 * Send a text message via WhatsApp Cloud API.
 * POST https://graph.facebook.com/v18.0/{phoneNumberId}/messages
 */
export async function sendMessage(
  phoneNumberId: string,
  to: string,
  text: string,
  accessToken: string
): Promise<void> {
  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: false, body: text },
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(
      `WhatsApp sendMessage failed: ${response.status} ${response.statusText} — ${payload}`
    );
  }
}
