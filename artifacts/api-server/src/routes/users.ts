import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, postsTable, eq, count } from "@workspace/db";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.clerkUserId = userId;
  req.clerkSessionClaims = auth.sessionClaims as Request["clerkSessionClaims"];
  next();
}

// GET /users/me
router.get("/users/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.clerkUserId!;
    const c = req.clerkSessionClaims;

    const firstName = c?.given_name || c?.first_name || "";
    const lastName = c?.family_name || c?.last_name || "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    const name = fullName || c?.email || c?.preferred_username || "Anonymous";
    const imageUrl = c?.picture || c?.image_url || null;

    const postCountResult = await db
      .select({ count: count() })
      .from(postsTable)
      .where(eq(postsTable.authorId, userId));

    const postCount = postCountResult[0]?.count ?? 0;

    return res.json({ id: userId, name, imageUrl, postCount });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
