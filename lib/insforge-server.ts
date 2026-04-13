import { createClient } from '@insforge/sdk';
import { cookies } from 'next/headers';

const accessCookie = 'insforge_access_token';
const refreshCookie = 'insforge_refresh_token';

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/'
};

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  cookieStore.set(accessCookie, accessToken, { ...authCookieOptions, maxAge: 60 * 15 });
  cookieStore.set(refreshCookie, refreshToken, { ...authCookieOptions, maxAge: 60 * 60 * 24 * 7 });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(accessCookie);
  cookieStore.delete(refreshCookie);
}

export async function createInsForgeServerClient(accessToken?: string) {
  const token = accessToken ?? (await cookies()).get(accessCookie)?.value;
  
  return createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    isServerMode: true,
    edgeFunctionToken: token,
    timeout: 120000
  });
}

export async function getCurrentUser() {
  const accessToken = (await cookies()).get(accessCookie)?.value;
  if (!accessToken) return { user: null };

  const insforge = await createInsForgeServerClient(accessToken);
  const { data, error } = await insforge.auth.getCurrentUser();
  if (error || !data?.user) return { user: null };

  return { user: data.user, insforge };
}

export async function getAuthServer() {
  const accessToken = (await cookies()).get(accessCookie)?.value;
  const insforge = await createInsForgeServerClient(accessToken);
  
  if (!accessToken) {
    return { insforge, user: null };
  }
  
  const { data } = await insforge.auth.getCurrentUser();
  return { insforge, user: data?.user || null };
}