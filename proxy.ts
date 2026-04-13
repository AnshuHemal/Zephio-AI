import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get('insforge_access_token')?.value
  const pathname = request.nextUrl.pathname;
  
  // Public routes that don't require authentication
  const isPublicRoute = pathname === '/' || pathname.startsWith('/auth')
  
  if (!accessToken && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
