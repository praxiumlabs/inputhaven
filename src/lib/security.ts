import crypto from "crypto";

function getHmacSecret(): string {
  return process.env.API_KEY_HMAC_SECRET || "";
}

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = `ih_${crypto.randomBytes(32).toString("hex")}`;
  const hash = hashApiKey(key);
  const prefix = key.slice(0, 10);
  return { key, hash, prefix };
}

export function hashApiKey(key: string): string {
  const secret = getHmacSecret();
  if (secret) {
    return crypto.createHmac("sha256", secret).update(key).digest("hex");
  }
  // Fallback for migration: plain SHA-256 if no secret configured
  return crypto.createHash("sha256").update(key).digest("hex");
}

export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(32).toString("hex")}`;
}

export function signWebhookPayload(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");
  return `t=${timestamp},v1=${signature}`;
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  tolerance = 300
): boolean {
  const parts = signature.split(",");
  if (parts.length < 2) return false;

  const timestampPart = parts[0]?.replace("t=", "");
  const sigPart = parts[1]?.replace("v1=", "");
  if (!timestampPart || !sigPart) return false;

  const timestamp = parseInt(timestampPart);
  if (isNaN(timestamp)) return false;

  // Check timestamp tolerance (default 5 minutes)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > tolerance) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  // Ensure buffers are same length before timing-safe comparison
  const sigBuf = Buffer.from(sigPart);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return false;

  return crypto.timingSafeEqual(sigBuf, expectedBuf);
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
