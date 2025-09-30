import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Missing credentials');
          return null;
        }

        const result = await sql`
          SELECT id, email, name, password_hash
          FROM users
          WHERE email = ${credentials.email as string}
        `;

        if (result.rows.length === 0) {
          console.error('User not found:', credentials.email);
          return null;
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!passwordMatch) {
          console.error('Password mismatch for user:', credentials.email);
          return null;
        }

        console.log('Authorization successful for:', credentials.email);
        return {
          id: user.id,
          email: user.email,
          name: user.name
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('[JWT Callback]', { hasUser: !!user, userId: user?.id, tokenId: token.id });
      if (user) {
        token.id = user.id;
      }
      console.log('[JWT Callback] Returning token with id:', token.id);
      return token;
    },
    async session({ session, token }) {
      console.log('[Session Callback]', {
        hasToken: !!token,
        tokenId: token?.id,
        hasSession: !!session,
        hasSessionUser: !!session?.user
      });
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      console.log('[Session Callback] Returning session with user.id:', session?.user?.id);
      return session;
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      console.log('[Authorized Callback]', {
        pathname,
        isLoggedIn,
        hasUser: !!auth?.user,
        userId: auth?.user?.id
      });

      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

      if (isAuthPage) {
        console.log('[Authorized] Auth page, allowing access');
        return true;
      }

      if (!isLoggedIn) {
        console.log('[Authorized] Not logged in, denying access');
        return false;
      }

      console.log('[Authorized] Logged in, allowing access');
      return true;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  }
});

export async function createUser(email: string, password: string, name: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  const userId = crypto.randomUUID();

  try {
    await sql`
      INSERT INTO users (id, email, password_hash, name)
      VALUES (${userId}, ${email}, ${passwordHash}, ${name})
    `;

    const emptyCareerPreferences = {
      whatMatters: [],
      idealRole: "",
      workEnvironment: [],
      dealBreakers: [],
      motivations: [],
      skillsToLeverage: [],
      skillsToGrow: [],
      cultureFit: [],
      workLifeBalance: "",
      compensationPriority: "",
      customNotes: ""
    };

    await sql`
      INSERT INTO user_profiles (
        user_id,
        name,
        location,
        bio,
        education,
        experience,
        skills,
        strengths,
        interests,
        values,
        career_goals,
        preferred_industries,
        preferred_locations,
        career_preferences
      ) VALUES (
        ${userId},
        ${name},
        '',
        '',
        '[]'::jsonb,
        '[]'::jsonb,
        '[]'::jsonb,
        '[]'::jsonb,
        '[]'::jsonb,
        '[]'::jsonb,
        '[]'::jsonb,
        '[]'::jsonb,
        '[]'::jsonb,
        ${JSON.stringify(emptyCareerPreferences)}::jsonb
      )
    `;

    return { success: true, userId };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return { success: false, error: 'Email already exists' };
    }
    throw error;
  }
}