import type { NextApiRequest, NextApiResponse } from "next";
import { withApiHandler } from "@/lib/api";

function clearCookie(name: string, secure: boolean) {
  const parts = [
    `${name}=`,
    "Path=/",
    "Max-Age=0",
    "SameSite=Lax"
  ];
  if (secure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secure = process.env.NODE_ENV === "production";
  const cookieNames = [
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
    "__Host-next-auth.csrf-token",
    "next-auth.csrf-token",
    "__Secure-next-auth.callback-url",
    "next-auth.callback-url"
  ];

  res.setHeader(
    "Set-Cookie",
    cookieNames.map((name) => clearCookie(name, secure))
  );

  if (req.method === "GET") {
    res.writeHead(302, { Location: "/login?reason=logout" });
    res.end();
    return;
  }

  return res.json({ ok: true });
}

export default withApiHandler(handler);
