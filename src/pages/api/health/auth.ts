import type { NextApiRequest, NextApiResponse } from "next";
import { getSessionUser } from "@/lib/auth";
import { withApiHandler } from "@/lib/api";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  const user = await getSessionUser(req, res);
  return res.json({
    ok: Boolean(user),
    session: user ? "ok" : "none"
  });
}

export default withApiHandler(handler);
