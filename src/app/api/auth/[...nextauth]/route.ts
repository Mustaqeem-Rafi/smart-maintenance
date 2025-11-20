import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from '@/src/lib/db';
import User from '@/src/models/User';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectDB();

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        // 1. Find User
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error('No user found');
        }

        // 2. Verify Password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        // 3. Return User (this object is passed to the JWT callback)
        return { 
          id: user._id.toString(), 
          name: user.name, 
          email: user.email, 
          role: user.role // We need to pass the role to the session
        };
      }
    })
  ],
  callbacks: {
    // Add the "role" to the JWT token
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    // Add the "role" to the active Session (so we can use it in the UI)
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // Custom login page (we will build this next)
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };