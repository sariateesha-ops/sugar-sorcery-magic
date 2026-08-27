// Server-only helpers for the simple (no OTP / no password) customer session token.
// The token is an HMAC-signed payload, so the browser cannot forge another
// customer's identity. Never import this from client code.

type CustomerTokenPayload = {
  id: string;
  phone: string;
  iat: number;
};

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getKey() {
  const secret = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!secret) throw new Error("Server is not configured for customer sessions.");
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(`sugar-sorcery-customer-session:${secret}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signCustomerToken(payload: {
  id: string;
  phone: string;
}): Promise<string> {
  const body = toBase64Url(
    encoder.encode(JSON.stringify({ ...payload, iat: Date.now() })),
  );
  const key = await getKey();
  const sig = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(body)),
  );
  return `${body}.${toBase64Url(sig)}`;
}

export async function verifyCustomerToken(
  token: string | undefined | null,
): Promise<CustomerTokenPayload | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const key = await getKey();
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(sig) as unknown as ArrayBuffer,
      encoder.encode(body),
    );
    if (!ok) return null;
    const parsed = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as
      | CustomerTokenPayload
      | undefined;
    if (!parsed?.id || !parsed.phone) return null;
    return parsed;
  } catch {
    return null;
  }
}
