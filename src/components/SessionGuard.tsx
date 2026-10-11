"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

/**
 * Forces logout when the backend access/refresh tokens can no longer be renewed,
 * so a stale NextAuth cookie cannot keep the dashboard shell visible.
 */
export function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const signingOut = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || signingOut.current) return;

    if (session?.error === "RefreshAccessTokenError" || !session?.accessToken) {
      signingOut.current = true;
      void signOut({ callbackUrl: "/auth/login" });
    }
  }, [session, status]);

  return <>{children}</>;
}
