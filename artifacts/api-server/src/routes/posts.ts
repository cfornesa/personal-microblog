import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, postsTable, commentsTable, eq, desc, count } from "@workspace/db";
import {
  CreatePostBody,
  ListPostsQueryParams,
  GetPostParams,
  DeletePostParams,
  GetPostsByUserParams,
  GetPostsByUserQueryParams,
} from "@workspace/api-zod";

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

// GET /feed/stats — must be registered before parameterized routes
router.get("/feed/stats", async (_req: Request, res: Response) => {
  try {
    const totalPostsResult = await db.select({ count: count() }).from(postsTable);
    const totalCommentsResult = await db.select({ count: count() }).from(commentsTable);

    return res.json({
      totalPosts: totalPostsResult[0]?.count ?? 0,
      totalComments: totalCommentsResult[0]?.count ?? 0,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /posts/user/:clerkId — must be registered before /posts/:id
router.get("/posts/user/:clerkId", async (req: Request, res: Response) => {
  try {
    const { clerkId } = GetPostsByUserParams.parse(req.params);
    const query = GetPostsByUserQueryParams.parse(req.query);
    const { page, limit } = query;
    const offset = (page - 1) * limit;

    const posts = await db
      .select({
        id: postsTable.id,
        authorId: postsTable.authorId,
        authorName: postsTable.authorName,
        authorImageUrl: postsTable.authorImageUrl,
        content: postsTable.content,
        createdAt: postsTable.createdAt,
        commentCount: count(commentsTable.id),
      })
      .from(postsTable)
      .leftJoin(commentsTable, eq(commentsTable.postId, postsTable.id))
      .where(eq(postsTable.authorId, clerkId))
      .groupBy(postsTable.id)
      .orderBy(desc(postsTable.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: count() })
      .from(postsTable)
      .where(eq(postsTable.authorId, clerkId));
    const total = totalResult[0]?.count ?? 0;

    return res.json({ posts, total, page, limit });
  } catch (err) {
    return res.status(400).json({ error: "Invalid request" });
  }
});

// GET /posts — list paginated posts
router.get("/posts", async (req: Request, res: Response) => {
  try {
    const query = ListPostsQueryParams.parse(req.query);
    const { page, limit } = query;
    const offset = (page - 1) * limit;

    const posts = await db
      .select({
        id: postsTable.id,
        authorId: postsTable.authorId,
        authorName: postsTable.authorName,
        authorImageUrl: postsTable.authorImageUrl,
        content: postsTable.content,
        createdAt: postsTable.createdAt,
        commentCount: count(commentsTable.id),
      })
      .from(postsTable)
      .leftJoin(commentsTable, eq(commentsTable.postId, postsTable.id))
      .groupBy(postsTable.id)
      .orderBy(desc(postsTable.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db.select({ count: count() }).from(postsTable);
    const total = totalResult[0]?.count ?? 0;

    return res.json({ posts, total, page, limit });
  } catch (err) {
    return res.status(400).json({ error: "Invalid request" });
  }
});

// POST /posts — create a post
router.post("/posts", requireAuth, async (req: Request, res: Response) => {
  try {
    const body = CreatePostBody.parse(req.body);
    const userId = req.clerkUserId!;

    const [post] = await db
      .insert(postsTable)
      .values({
        authorId: userId,
        authorName: getAuthorName(req),
        authorImageUrl: getAuthorImageUrl(req),
        content: body.content,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return res.status(201).json({ ...post, commentCount: 0 });
  } catch (err) {
    return res.status(400).json({ error: "Invalid request" });
  }
});

// GET /posts/:id — get post with comments
router.get("/posts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = GetPostParams.parse(req.params);

    const postRows = await db
      .select({
        id: postsTable.id,
        authorId: postsTable.authorId,
        authorName: postsTable.authorName,
        authorImageUrl: postsTable.authorImageUrl,
        content: postsTable.content,
        createdAt: postsTable.createdAt,
        commentCount: count(commentsTable.id),
      })
      .from(postsTable)
      .leftJoin(commentsTable, eq(commentsTable.postId, postsTable.id))
      .where(eq(postsTable.id, id))
      .groupBy(postsTable.id);

    const post = postRows[0];
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comments = await db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.postId, id))
      .orderBy(desc(commentsTable.createdAt));

    return res.json({ post, comments });
  } catch (err) {
    return res.status(400).json({ error: "Invalid request" });
  }
});

// DELETE /posts/:id — delete own post
router.delete("/posts/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = DeletePostParams.parse(req.params);
    const userId = req.clerkUserId!;

    const post = await db.select().from(postsTable).where(eq(postsTable.id, id)).limit(1);
    if (!post[0]) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post[0].authorId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await db.delete(postsTable).where(eq(postsTable.id, id));
    return res.status(204).send();
  } catch (err) {
    return res.status(400).json({ error: "Invalid request" });
  }
});

export default router;
