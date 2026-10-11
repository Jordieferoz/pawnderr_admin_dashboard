"use client";

import { SessionProvider } from "next-auth/react";
import { SessionGuard } from "./SessionGuard";

export const NextAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <SessionProvider refetchOnWindowFocus refetchInterval={5 * 60}>
      <SessionGuard>{children}</SessionGuard>
    </SessionProvider>
  );
};
