import { createHmac } from "crypto";

export type FBMessage = {
  senderId: string;
  mid: string;
  text?: string;
  timestamp: number;
};

/**
 * Verify Facebook Messenger webhook signature.
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
 * Parse Facebook Messenger webhook body into a flat array of FBMessage objects.
 * The Messenger body structure:
 * { object: "page", entry: [{ messaging: [{ sender: { id }, message: { mid, text }, timestamp }] }] }
 */
export function parseMessages(body: unknown): FBMessage[] {
  if (typeof body !== "object" || body === null) return [];

  const payload = body as {
    object?: string;
    entry?: Array<{
      messaging?: Array<{
        sender?: { id?: string };
        message?: { mid?: string; text?: string };
        timestamp?: number;
      }>;
    }>;
  };

  const messages: FBMessage[] = [];
  for (const entry of payload.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      const senderId = event.sender?.id;
      const mid = event.message?.mid;
      if (!senderId || !mid) continue;

      messages.push({
        senderId,
        mid,
        text: event.message?.text,
        timestamp: event.timestamp ?? Date.now(),
      });
    }
  }
  return messages;
}

/**
 * Send a text message via Facebook Messenger Send API.
 * POST https://graph.facebook.com/v18.0/{pageId}/messages
 */
export async function sendMessage(
  pageId: string,
  recipientId: string,
  text: string,
  accessToken: string
): Promise<void> {
  const url = `https://graph.facebook.com/v18.0/${pageId}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(
      `Facebook sendMessage failed: ${response.status} ${response.statusText} — ${payload}`
    );
  }
}
