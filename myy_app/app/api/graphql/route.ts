// GraphQL API route — Apollo Server with type definitions and resolvers
// Handles all student CRUD operations and user login

import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, verifyToken } from "@/lib/auth";

// ─── GraphQL Schema ────────────────────────────────────────────────────────────

const typeDefs = `#graphql
  type Student {
    id: Int!
    name: String!
    email: String!
    department: String!
    year: Int!
    profileImage: String
    createdAt: String!
  }

  type AuthPayload {
    token: String!
  }

  type Query {
    students: [Student!]!
    student(id: Int!): Student
  }

  type Mutation {
    # Login returns a JWT token
    login(email: String!, password: String!): AuthPayload!

    # Register a new admin user (useful for first-time setup)
    register(email: String!, password: String!): AuthPayload!

    # Student mutations — require Authorization header with Bearer token
    addStudent(name: String!, email: String!, department: String!, year: Int!, profileImage: String): Student!
    updateStudent(id: Int!, name: String, email: String, department: String, year: Int, profileImage: String): Student!
    deleteStudent(id: Int!): Boolean!
  }
`;

// ─── Context — extract user from JWT ──────────────────────────────────────────

interface Context {
  userId: number | null;
}

// ─── Resolvers ─────────────────────────────────────────────────────────────────

const resolvers = {
  Query: {
    // Get all students
    students: (_: unknown, __: unknown, ctx: Context) => {
      if (!ctx.userId) throw new Error("Not authenticated");
      return prisma.student.findMany({ orderBy: { createdAt: "desc" } });
    },
    // Get single student by id
    student: (_: unknown, { id }: { id: number }, ctx: Context) => {
      if (!ctx.userId) throw new Error("Not authenticated");
      return prisma.student.findUnique({ where: { id } });
    },
  },

  Mutation: {
    // Login — validate credentials and return JWT
    login: async (_: unknown, { email, password }: { email: string; password: string }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("Invalid credentials");
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Invalid credentials");
      return { token: signToken({ id: user.id, email: user.email }) };
    },

    // Register — hash password and create admin user
    register: async (_: unknown, { email, password }: { email: string; password: string }) => {
      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({ data: { email, password: hashed } });
      return { token: signToken({ id: user.id, email: user.email }) };
    },

    // Add student (protected)
    addStudent: (_: unknown, args: { name: string; email: string; department: string; year: number; profileImage?: string }, ctx: Context) => {
      if (!ctx.userId) throw new Error("Not authenticated");
      return prisma.student.create({ data: args });
    },

    // Update student (protected)
    updateStudent: (_: unknown, { id, ...data }: { id: number; name?: string; email?: string; department?: string; year?: number; profileImage?: string }, ctx: Context) => {
      if (!ctx.userId) throw new Error("Not authenticated");
      return prisma.student.update({ where: { id }, data });
    },

    // Delete student (protected)
    deleteStudent: async (_: unknown, { id }: { id: number }, ctx: Context) => {
      if (!ctx.userId) throw new Error("Not authenticated");
      await prisma.student.delete({ where: { id } });
      return true;
    },
  },
};

// ─── Apollo Server setup ───────────────────────────────────────────────────────

const server = new ApolloServer<Context>({ typeDefs, resolvers });

const handler = startServerAndCreateNextHandler<NextRequest, Context>(server, {
  // Build context from request — extract JWT from Authorization header
  context: async (req: NextRequest) => {
    const auth = req.headers.get("authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    const user = token ? verifyToken(token) : null;
    return { userId: user?.id ?? null };
  },
});

// Next.js App Router requires named exports for each HTTP method
export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}
