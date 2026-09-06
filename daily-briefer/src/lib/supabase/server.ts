import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/** Request-scoped client that reads/writes the auth cookies.
 *  In a Server Component the cookie write throws; that is expected and
 *  harmless because src/proxy.ts already refreshed the session for us. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Component render pass — see comment above.
          }
        },
      },
    },
  );
}
