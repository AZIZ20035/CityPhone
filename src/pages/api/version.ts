import type { NextApiRequest, NextApiResponse } from "next";
import { withApiHandler } from "@/lib/api";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  const pkg = await import("../../../package.json");
  const buildId =
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.NEXT_PUBLIC_APP_VERSION ??
    process.env.APP_VERSION ??
    pkg.version;

  return res.json({
    version: pkg.version,
    buildId,
    deployedAt: new Date().toISOString()
  });
}

export default withApiHandler(handler);
