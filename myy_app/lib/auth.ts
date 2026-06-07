// Auth helpers — sign and verify JWT tokens

import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

// Creates a JWT token containing the user's id and email
export function signToken(payload: { id: number; email: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

// Verifies a JWT token and returns its payload, or null if invalid
export function verifyToken(token: string): { id: number; email: string } | null {
  try {
    return jwt.verify(token, SECRET) as { id: number; email: string };
  } catch {
    return null;
  }
}
