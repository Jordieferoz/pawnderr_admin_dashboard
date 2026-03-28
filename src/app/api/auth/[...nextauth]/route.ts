import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

async function refreshAccessToken(token: any) {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/auth/refresh-token`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    const payloadBase64 = refreshedTokens.data.accessToken.split(".")[1];
    const decodedJson = Buffer.from(payloadBase64, "base64").toString();
    const decoded = JSON.parse(decodedJson);

    return {
      ...token,
      accessToken: refreshedTokens.data.accessToken,
      refreshToken: refreshedTokens.data.refreshToken ?? token.refreshToken, // Fall back to old refresh token
      accessTokenExpires: decoded.exp * 1000,
    };
  } catch (error) {
    console.error("Error refreshing token:", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        user: { label: "User", type: "text" },
      },
      async authorize(credentials) {
        if (credentials?.user) {
          try {
            const user = JSON.parse(credentials.user);
            return user;
          } catch (e) {
            console.error("Error parsing user data", e);
            return null;
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.id = user.id;

        if (user.accessToken) {
          try {
            const payloadBase64 = user.accessToken.split(".")[1];
            if (payloadBase64) {
              const decodedJson = Buffer.from(
                payloadBase64,
                "base64",
              ).toString();
              const decoded = JSON.parse(decodedJson);
              token.accessTokenExpires = decoded.exp * 1000;
            }
          } catch (e) {
            console.error("Error parsing JWT for expiration", e);
            // Default 1 hour if parsing fails
            token.accessTokenExpires = Date.now() + 60 * 60 * 1000;
          }
        }

        return token;
      }

      // Return previous token if the access token has not expired yet
      // Subtract 60 seconds (60000ms) to refresh just before expiration
      if (
        token.accessTokenExpires &&
        Date.now() < (token.accessTokenExpires as number) - 60000
      ) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string | undefined;
        session.error = token.error as string | undefined;
        if (session.user) {
          session.user.id = token.id as string | undefined;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login", // Adjust to your actual login page path
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
