import { Router, type IRouter, type Request, type Response } from "express";
import { db, postsTable, eq, count } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// GET /users/me
router.get("/users/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const currentUser = req.currentUser!;
    const name = currentUser.name || currentUser.email || "Anonymous";
    const imageUrl = currentUser.image || null;

    const postCountResult = await db
      .select({ count: count() })
      .from(postsTable)
      .where(eq(postsTable.authorId, currentUser.id));

    const postCount = postCountResult[0]?.count ?? 0;

    return res.json({
      id: currentUser.id,
      name,
      email: currentUser.email,
      imageUrl,
      role: currentUser.role,
      status: currentUser.status,
      postCount,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
