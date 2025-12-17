import type { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase.js";

/**
 * Middleware to protect routes that require authentication.
 * Verifies the Supabase JWT from the Authorization header.
 *
 * Usage:
 * router.post("/protected", requireAuth, (req, res) => { ... })
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
      return;
    }

    const token = authHeader.split(" ")[1];

    // Verify the token with Supabase
    // This also gives us the authenticated user data
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      res
        .status(401)
        .json({ error: "Unauthorized: Session expired or invalid" });
      return;
    }

    // Attach user to request for use in route handlers
    (req as any).user = user;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res
      .status(500)
      .json({ error: "Internal server error during authentication" });
  }
}
