import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, commentsTable, postsTable, eq } from "@workspace/db";
import { CreateCommentBody, CreateCommentParams, DeleteCommentParams } from "@workspace/api-zod";

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

function getAuthorName(req: Request): string {
  const c = req.clerkSessionClaims;
  const firstName = c?.given_name || c?.first_name || "";
  const lastName = c?.family_name || c?.last_name || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  return fullName || c?.email || c?.preferred_username || "Anonymous";
}

function getAuthorImageUrl(req: Request): string | null {
  return req.clerkSessionClaims?.picture || req.clerkSessionClaims?.image_url || null;
}

// POST /posts/:postId/comments
router.post("/posts/:postId/comments", requireAuth, async (req: Request, res: Response) => {
  try {
    const { postId } = CreateCommentParams.parse(req.params);
    const body = CreateCommentBody.parse(req.body);
    const userId = req.clerkUserId!;

    const post = await db.select().from(postsTable).where(eq(postsTable.id, postId)).limit(1);
    if (!post[0]) {
      return res.status(404).json({ error: "Post not found" });
    }

    const [comment] = await db
      .insert(commentsTable)
      .values({
        postId,
        authorId: userId,
        authorName: getAuthorName(req),
        authorImageUrl: getAuthorImageUrl(req),
        content: body.content,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return res.status(201).json(comment);
  } catch (err) {
    return res.status(400).json({ error: "Invalid request" });
  }
});

// DELETE /comments/:id
router.delete("/comments/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = DeleteCommentParams.parse(req.params);
    const userId = req.clerkUserId!;

    const comment = await db.select().from(commentsTable).where(eq(commentsTable.id, id)).limit(1);
    if (!comment[0]) {
      return res.status(404).json({ error: "Comment not found" });
    }
    if (comment[0].authorId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await db.delete(commentsTable).where(eq(commentsTable.id, id));
    return res.status(204).send();
  } catch (err) {
    return res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
