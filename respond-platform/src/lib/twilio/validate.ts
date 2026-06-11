import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verify a Twilio webhook signature.
 *
 * Twilio signs every request with HMAC-SHA1 over:
 *   (full request URL) + (sorted POST params key+value concatenated)
 * using the auth token as the secret, base64-encoded.
 *
 * https://www.twilio.com/docs/usage/security#validating-signatures-from-twilio
 */
export function verifyTwilioSignature(
  authToken: string,
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  if (!authToken || !signature) return false;

  const sortedKeys = Object.keys(params).sort();
  const paramStr = sortedKeys.reduce(
    (acc, key) => acc + key + (params[key] ?? ""),
    ""
  );

  const expected = createHmac("sha1", authToken)
    .update(url + paramStr)
    .digest("base64");

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

/** Extract all FormData entries as a plain object for signature validation. */
export function formDataToRecord(formData: FormData): Record<string, string> {
  const record: Record<string, string> = {};
  formData.forEach((value, key) => {
    record[key] = String(value);
  });
  return record;
}
