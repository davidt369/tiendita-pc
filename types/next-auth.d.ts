declare module "next-auth" {
  interface User {
    id: string
    name: string
    email: string
    image?: string
    role?: string
  }

  interface Session {
    user: User & {
      id: string
      role: string
    }
    accessToken?: string
  }

  interface JWT {
    accessToken?: string
    role?: string
  }
}
