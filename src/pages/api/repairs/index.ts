import type { NextApiRequest, NextApiResponse } from "next";
import { withApiHandler } from "@/lib/api";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(410).json({ error: "GONE" });
}

export default withApiHandler(handler);
