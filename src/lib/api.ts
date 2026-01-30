import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "crypto";

type Handler = (
  req: NextApiRequest,
  res: NextApiResponse,
  context: { requestId: string }
) => Promise<void>;

function getRequestId(req: NextApiRequest) {
  const headerId = req.headers["x-request-id"];
  if (typeof headerId === "string" && headerId.trim().length > 0) {
    return headerId;
  }
  return randomUUID();
}

export function withApiHandler(handler: Handler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const requestId = getRequestId(req);
    (req as any).requestId = requestId;
    res.setHeader("x-request-id", requestId);
    try {
      await handler(req, res, { requestId });
    } catch (error) {
      console.error("API_ERROR", {
        requestId,
        path: req.url,
        method: req.method,
        message: error instanceof Error ? error.message : String(error)
      });
      if (res.headersSent) return;
      res.status(500).json({
        error: "حدث خطأ في الخادم",
        requestId,
        details:
          process.env.NODE_ENV !== "production"
            ? String(error)
            : undefined,
        stack:
          process.env.NODE_ENV !== "production" && error instanceof Error
            ? error.stack
            : undefined
      });
    }
  };
}
