import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { type Role } from "@/lib/constants";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
};

export async function getSessionUser(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  return session?.user as SessionUser | undefined;
}

export function requireRole(user: SessionUser | undefined, roles: Role[]) {
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  if (!roles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
}
