import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

/**
 * Protege rutas:
 *  - /login          -> público (si ya hay sesión, redirige al dashboard)
 *  - /admin/*         -> solo admin
 *  - resto de la app  -> requiere sesión
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  // Ruta de login.
  if (pathname === "/login") {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Resto de rutas protegidas: requieren sesión.
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Rutas admin: solo Daniel (role admin).
  if (pathname.startsWith("/admin") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protege todo salvo assets estáticos, API y la home (que redirige por sí sola).
  matcher: [
    "/dashboard/:path*",
    "/predicciones/:path*",
    "/resultados/:path*",
    "/tabla/:path*",
    "/partido/:path*",
    "/admin/:path*",
    "/login",
  ],
};
