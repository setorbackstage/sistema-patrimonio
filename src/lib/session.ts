import { cookies } from "next/headers"

const SESSION_COOKIE_NAME = "ciep_session"
const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "ciep395-patrimonio-secure-key-2026-seeduc"

interface SessionPayload {
  id: string
  name: string
  email: string
  role: string
  exp: number
}

// Codifica payload em Base64URL
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  while (base64.length % 4) {
    base64 += "="
  }
  return Buffer.from(base64, "base64").toString("utf8")
}

// Cria assinatura HMAC SHA-256 usando Web Crypto API
async function sign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data))
  return Buffer.from(signature)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

// Verifica assinatura HMAC SHA-256
async function verify(data: string, signature: string, secret: string): Promise<boolean> {
  const expectedSig = await sign(data, secret)
  return expectedSig === signature
}

// Cria o token de sessão JWT-like
export async function createSessionToken(user: { id: string; name: string; email: string; role: string }): Promise<string> {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 // 30 dias
  const payload = base64UrlEncode(
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      exp,
    })
  )

  const dataToSign = `${header}.${payload}`
  const signature = await sign(dataToSign, SECRET)
  return `${dataToSign}.${signature}`
}

// Valida e decodifica o token de sessão
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const [header, payload, signature] = parts
    const dataToSign = `${header}.${payload}`

    const isValid = await verify(dataToSign, signature, SECRET)
    if (!isValid) return null

    const decoded: SessionPayload = JSON.parse(base64UrlDecode(payload))
    const now = Math.floor(Date.now() / 1000)

    if (decoded.exp < now) {
      return null // Token expirado
    }

    return decoded
  } catch {
    return null
  }
}

// Define o cookie de sessão na resposta
export async function setSessionCookie(user: { id: string; name: string; email: string; role: string }) {
  const token = await createSessionToken(user)
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  })

  return token
}

// Remove o cookie de sessão
export async function deleteSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

// Recupera a sessão atual a partir dos cookies
export async function getSession(): Promise<{ user: { id: string; name: string; email: string; role: string } } | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!token) return null

    const payload = await verifySessionToken(token)
    if (!payload) return null

    return {
      user: {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      },
    }
  } catch {
    return null
  }
}

export { SESSION_COOKIE_NAME }
