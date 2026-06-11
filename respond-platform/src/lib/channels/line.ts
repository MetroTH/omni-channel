import { createHmac } from "crypto";

export type LineEvent = {
  type: string;
  replyToken?: string;
  source: { userId: string };
  message?: {
    type: string;
    text?: string;
    id: string;
  };
};

/**
 * Verify LINE webhook signature.
 * LINE signs with HMAC-SHA256 of the raw body using the channel secret, base64-encoded.
 */
export function verifySignature(
  rawBody: Buffer,
  signature: string,
  secret: string
): boolean {
  const digest = createHmac("sha256", secret)
    .update(rawBody)
    .digest("base64");
  // Constant-time comparison to prevent timing attacks
  if (digest.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < digest.length; i++) {
    mismatch |= digest.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Parse LINE webhook body into an array of LineEvent objects.
 */
export function parseEvents(body: unknown): LineEvent[] {
  if (
    typeof body !== "object" ||
    body === null ||
    !("events" in body) ||
    !Array.isArray((body as { events: unknown }).events)
  ) {
    return [];
  }
  return (body as { events: LineEvent[] }).events;
}

/**
 * Push a message to a LINE user.
 * POST https://api.line.me/v2/bot/message/push
 */
export async function sendMessage(
  to: string,
  messages: object[],
  accessToken: string
): Promise<void> {
  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ to, messages }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `LINE sendMessage failed: ${response.status} ${response.statusText} — ${text}`
    );
  }
}

/**
 * Reply to a LINE message using a reply token.
 * POST https://api.line.me/v2/bot/message/reply
 */
export async function replyMessage(
  replyToken: string,
  messages: object[],
  accessToken: string
): Promise<void> {
  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `LINE replyMessage failed: ${response.status} ${response.statusText} — ${text}`
    );
  }
}
