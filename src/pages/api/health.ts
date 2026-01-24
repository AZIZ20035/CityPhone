import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { withApiHandler } from "@/lib/api";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  const dbCheck = await prisma.settings.findFirst();
  const sessionUser = await getSessionUser(req, res);

  return res.json({
    ok: true,
    db: dbCheck ? "ok" : "empty",
    session: sessionUser ? "ok" : "none"
  });
}

export default withApiHandler(handler);
