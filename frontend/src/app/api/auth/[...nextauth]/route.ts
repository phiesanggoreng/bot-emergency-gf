import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/",
  },
  // Use JWT strategy (default for NextAuth v4)
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // On first login, copy user info into the JWT
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Expose the raw JWT to the client so it can be sent to the backend
        (session as typeof session & { accessToken: typeof token }).accessToken = token;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
