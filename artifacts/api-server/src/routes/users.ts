import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db, postsTable, eq, count } from "@workspace/db";

const router: IRouter = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  (req as any).userId = userId;
  (req as any).sessionClaims = auth.sessionClaims;
  next();
}

// GET /users/me
router.get("/users/me", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const sessionClaims = (req as any).sessionClaims;

    const firstName = sessionClaims?.given_name || sessionClaims?.first_name || "";
    const lastName = sessionClaims?.family_name || sessionClaims?.last_name || "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    const name = fullName || sessionClaims?.email || sessionClaims?.preferred_username || "Anonymous";
    const imageUrl = sessionClaims?.picture || sessionClaims?.image_url || null;

    const postCountResult = await db
      .select({ count: count() })
      .from(postsTable)
      .where(eq(postsTable.authorId, userId));

    const postCount = postCountResult[0]?.count ?? 0;

    res.json({ id: userId, name, imageUrl, postCount });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
