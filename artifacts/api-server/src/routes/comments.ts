import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db, commentsTable, postsTable, eq } from "@workspace/db";
import { CreateCommentBody, CreateCommentParams, DeleteCommentParams } from "@workspace/api-zod";

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

function getAuthorName(sessionClaims: any): string {
  const firstName = sessionClaims?.given_name || sessionClaims?.first_name || "";
  const lastName = sessionClaims?.family_name || sessionClaims?.last_name || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  return fullName || sessionClaims?.email || sessionClaims?.preferred_username || "Anonymous";
}

function getAuthorImageUrl(sessionClaims: any): string | null {
  return sessionClaims?.picture || sessionClaims?.image_url || null;
}

// POST /posts/:postId/comments
router.post("/posts/:postId/comments", requireAuth, async (req, res) => {
  try {
    const { postId } = CreateCommentParams.parse(req.params);
    const body = CreateCommentBody.parse(req.body);
    const userId = (req as any).userId;
    const sessionClaims = (req as any).sessionClaims;

    const post = await db.select().from(postsTable).where(eq(postsTable.id, postId)).limit(1);
    if (!post[0]) {
      return res.status(404).json({ error: "Post not found" });
    }

    const authorName = getAuthorName(sessionClaims);
    const authorImageUrl = getAuthorImageUrl(sessionClaims);

    const [comment] = await db
      .insert(commentsTable)
      .values({
        postId,
        authorId: userId,
        authorName,
        authorImageUrl,
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
router.delete("/comments/:id", requireAuth, async (req, res) => {
  try {
    const { id } = DeleteCommentParams.parse(req.params);
    const userId = (req as any).userId;

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
