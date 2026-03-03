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
        if (!credentials?.email || !credentials?.password) {
          console.error("[AUTH] authorize: email ou password manquant");
          throw new Error("Email et mot de passe requis");
        }

        const email = credentials.email.trim().toLowerCase();
        const password = (credentials.password ?? "").trim();
        console.log("[AUTH] authorize appelé pour:", email);

        try {
          const user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
          });

          if (!user || !user.password) {
            console.error("[AUTH] Utilisateur non trouvé ou sans password:", email);
            throw new Error("Identifiants incorrects");
          }

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            console.error("[AUTH] Mot de passe invalide pour:", email);
            throw new Error("Identifiants incorrects");
          }

          console.log("[AUTH] Connexion OK:", email);
          return {
            id: user.id,
            email: user.email,
            name: user.nom,
            image: user.logo,
          };
        } catch (err) {
          if (err instanceof Error && err.message === "Identifiants incorrects") {
            throw err;
          }
          console.error("[AUTH] Erreur:", err);
          throw new Error("Erreur de connexion à la base de données. Vérifiez que PostgreSQL est démarré (docker compose up -d).");
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
