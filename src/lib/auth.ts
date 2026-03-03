import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

// Pas d'adapter avec CredentialsProvider + JWT (incompatible)
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email et mot de passe requis");
          }

          const email = credentials.email.trim().toLowerCase();
          console.log("[AUTH] Tentative login:", email);

          const user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
          });

          console.log("[AUTH] User trouvé:", !!user);

          if (!user || !user.password) {
            throw new Error("Identifiants incorrects");
          }

          const isValid = await bcrypt.compare(credentials.password.trim(), user.password);
          console.log("[AUTH] Password valide:", isValid);

          if (!isValid) {
            throw new Error("Identifiants incorrects");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.nom,
            image: user.logo,
          };
        } catch (err) {
          console.error("[AUTH] Erreur authorize:", err);
          throw err;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
