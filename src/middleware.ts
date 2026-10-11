import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized: ({ token }) =>
      !!token &&
      !!token.accessToken &&
      token.error !== "RefreshAccessTokenError",
  },
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|auth|images).*)",
  ],
};
