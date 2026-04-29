import { useRoute } from "wouter";
import { useGetPost, getGetPostQueryKey } from "@workspace/api-client-react";
import { PostCard } from "@/components/post/PostCard";
import { CommentList } from "@/components/post/CommentList";
import { ComposeComment } from "@/components/post/ComposeComment";
import { Show } from "@clerk/react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PostDetail() {
  const [, params] = useRoute("/posts/:id");
  const postId = Number(params?.id);

  const { data: postData, isLoading, error } = useGetPost(postId, {
    query: { 
      queryKey: getGetPostQueryKey(postId),
      enabled: !isNaN(postId) && postId > 0 
    }
  });

  if (isNaN(postId) || postId <= 0 || error) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Button asChild variant="outline">
          <Link href="/">Back to feed</Link>
        </Button>
      </div>
    );
  }

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

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-4 animate-pulse">
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
        ) : postData ? (
          <>
            <PostCard post={postData.post} isDetail />
            
            <Show when="signed-in">
              <div className="border-b border-border">
                <ComposeComment postId={postData.post.id} />
              </div>
            </Show>
            
            <CommentList comments={postData.comments} postId={postData.post.id} />
          </>
        ) : null}
      </div>
    </div>
  );
}
