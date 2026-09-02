import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas
  const isLoginPage = pathname === "/login"
  const isRegisterPage = pathname === "/register"
  const isPublicAsset = pathname.startsWith("/patrimonio/") && pathname.split("/").length === 3
  const isApiAuth = pathname.startsWith("/api/auth")

  // Verifica cookie de sessão
  const sessionToken =
    request.cookies.get("ciep_session")?.value ||
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value

  // Se já estiver logado e tentar acessar /login ou /register, redireciona para o dashboard
  if ((isLoginPage || isRegisterPage) && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Permitir acesso às páginas públicas e rotas de autenticação
  if (isLoginPage || isRegisterPage || isPublicAsset || isApiAuth) {
    return NextResponse.next()
  }

  // Se não tiver token, redireciona para o login
  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
