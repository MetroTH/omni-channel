import { createHmac, timingSafeEqual } from "crypto";

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

export function formDataToRecord(formData: FormData): Record<string, string> {
  const record: Record<string, string> = {};
  formData.forEach((value, key) => {
    record[key] = String(value);
  });
  return record;
}
