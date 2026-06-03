/**
 * Stateless JWT session management using jose.
 * All cookies() calls use the async API required by Next.js 16.
 */
import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export interface SessionPayload {
  userId: string;
  role: "ADMIN" | "USER";
  email: string;
  name: string;
  expiresAt: Date;
}

const secretKey = process.env.AUTH_SECRET;
if (!secretKey) throw new Error("AUTH_SECRET environment variable is not set");
const encodedKey = new TextEncoder().encode(secretKey);

/** Encrypt payload into a JWT */
export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

/** Decrypt and verify a JWT, returns null if invalid */
export async function decrypt(
  session: string | undefined
): Promise<SessionPayload | null> {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Create a session cookie after login */
export async function createSession(payload: Omit<SessionPayload, "expiresAt">) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ ...payload, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

/** Refresh the session expiry (sliding window) */
export async function updateSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get("session")?.value;
  const payload = await decrypt(sessionValue);

  if (!payload) return;

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const newSession = await encrypt({ ...payload, expiresAt });

  cookieStore.set("session", newSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

/** Delete the session (logout) */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

/** Get the current session (returns null if not logged in) */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get("session")?.value;
  return decrypt(sessionValue);
}
