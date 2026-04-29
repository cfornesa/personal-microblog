import { useRoute, Link } from "wouter";
import { useGetPostsByUser, getGetPostsByUserQueryKey } from "@workspace/api-client-react";
import { PostCard } from "@/components/post/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UserProfile() {
  const [, params] = useRoute("/users/:userId");
  const userId = params?.userId;

  const { data: postsPage, isLoading, error } = useGetPostsByUser(userId as string, { page: 1, limit: 50 }, {
    query: { 
      queryKey: getGetPostsByUserQueryKey(userId as string, { page: 1, limit: 50 }),
      enabled: !!userId 
    }
  });

  if (!userId || error) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <Button asChild variant="outline">
          <Link href="/">Back to feed</Link>
        </Button>
      </div>
    );
  }

  // Assuming all posts have the author's details, grab it from the first post
  const authorName = postsPage?.posts[0]?.authorName || "User";
  const authorImageUrl = postsPage?.posts[0]?.authorImageUrl || undefined;
  const postCount = postsPage?.total || 0;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="gap-2 -ml-4 hover:bg-transparent hover:text-primary">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
            <AvatarImage src={authorImageUrl} alt={authorName} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {authorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h1 className="text-3xl font-bold font-serif tracking-tight text-foreground">{authorName}</h1>
            <div className="mt-2 flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="font-medium">{postCount} {postCount === 1 ? 'post' : 'posts'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border bg-muted/30 px-6 py-4">
          <h2 className="font-serif text-xl font-bold tracking-tight">Recent Posts</h2>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded"></div>
                    <div className="h-3 w-16 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded"></div>
                  <div className="h-4 w-2/3 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : postsPage?.posts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p>This user hasn't posted anything yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {postsPage?.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
