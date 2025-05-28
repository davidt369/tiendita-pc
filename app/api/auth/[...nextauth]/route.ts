import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token
        token.role = "user" // Por defecto todos los usuarios son "user"

        // Asignar rol de admin a emails específicos
        const adminEmails = ["maroger369@gmail.com", "maroger369@gmail.com", "user@example.com"] // Add the desired admin email here
        if (user.email && adminEmails.includes(user.email)) {
          token.role = "admin"
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
        session.accessToken = token.accessToken as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Permitir el inicio de sesión para todos los usuarios de Google
      return true
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
