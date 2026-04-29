import { Link } from "wouter";
import { MessageCircle, Trash2 } from "lucide-react";
import { useUser } from "@clerk/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatPostDate } from "@/lib/format-date";
import type { Post } from "@workspace/api-client-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeletePost, getListPostsQueryKey, getGetPostsByUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface PostCardProps {
  post: Post;
  isDetail?: boolean;
}

export function PostCard({ post, isDetail = false }: PostCardProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const deletePost = useDeletePost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        if (user) {
          queryClient.invalidateQueries({ queryKey: getGetPostsByUserQueryKey(user.id) });
        }
        toast({ title: "Post deleted" });
      },
      onError: () => {
        setIsDeleting(false);
        toast({ title: "Failed to delete post", variant: "destructive" });
      }
    }
  });

  const handleDelete = () => {
    setIsDeleting(true);
    deletePost.mutate({ id: post.id });
  };

  const isOwner = user?.id === post.authorId;

  const content = (
    <div className={`group relative flex gap-4 p-5 sm:p-6 transition-colors ${!isDetail && !isDeleting ? "hover:bg-accent/30" : ""} ${isDeleting ? "opacity-50 scale-95 transition-all duration-300" : "transition-all duration-300"}`}>
      <Link href={`/users/${post.authorId}`} className="shrink-0 z-10" onClick={(e) => e.stopPropagation()}>
        <Avatar className="h-10 w-10 border border-border ring-2 ring-transparent transition-all group-hover:ring-primary/20">
          <AvatarImage src={post.authorImageUrl || undefined} alt={post.authorName} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {post.authorName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link 
              href={`/users/${post.authorId}`} 
              className="font-semibold text-foreground hover:underline z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {post.authorName}
            </Link>
            <span className="text-muted-foreground text-xs font-medium">·</span>
            <span className="text-muted-foreground text-xs" title={new Date(post.createdAt).toLocaleString()}>
              {formatPostDate(post.createdAt)}
            </span>
          </div>

          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 z-10 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete post</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()} className="z-[100]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your post and all its comments.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <p className="text-base text-foreground whitespace-pre-wrap break-words leading-relaxed">
          {post.content}
        </p>

        <div className="flex items-center gap-4 pt-2">
          {!isDetail ? (
            <div className="flex items-center text-muted-foreground gap-1.5 transition-colors group-hover:text-primary">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs font-medium">{post.commentCount}</span>
            </div>
          ) : (
            <div className="text-sm font-medium text-muted-foreground">
              {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isDetail) {
    return <div className="border-b border-border bg-card">{content}</div>;
  }

  return (
    <div className="border-b border-border bg-card relative cursor-pointer overflow-hidden block">
      <Link href={`/posts/${post.id}`} className="absolute inset-0 z-0">
        <span className="sr-only">View post</span>
      </Link>
      {content}
    </div>
  );
}
