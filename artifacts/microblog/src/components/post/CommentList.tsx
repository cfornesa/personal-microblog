import { useUser } from "@clerk/react";
import { formatPostDate } from "@/lib/format-date";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Comment } from "@workspace/api-client-react/src/generated/api.schemas";
import { useDeleteComment, getGetPostQueryKey, getGetFeedStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
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

interface CommentItemProps {
  comment: Comment;
  postId: number;
}

export function CommentItem({ comment, postId }: CommentItemProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteComment = useDeleteComment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) });
        queryClient.invalidateQueries({ queryKey: getGetFeedStatsQueryKey() });
        toast({ title: "Comment deleted" });
      },
      onError: () => {
        setIsDeleting(false);
        toast({ title: "Failed to delete comment", variant: "destructive" });
      }
    }
  });

  const handleDelete = () => {
    setIsDeleting(true);
    deleteComment.mutate({ id: comment.id });
  };

  const isOwner = user?.id === comment.authorId;

  return (
    <div className={`group flex gap-4 p-4 sm:p-5 transition-all duration-300 ${isDeleting ? "opacity-50 scale-95" : ""}`}>
      <Avatar className="h-8 w-8 shrink-0 border border-border">
        <AvatarImage src={comment.authorImageUrl || undefined} alt={comment.authorName} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
          {comment.authorName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-foreground">
              {comment.authorName}
            </span>
            <span className="text-muted-foreground text-xs font-medium">·</span>
            <span className="text-muted-foreground text-xs" title={new Date(comment.createdAt).toLocaleString()}>
              {formatPostDate(comment.createdAt)}
            </span>
          </div>

          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-opacity"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete comment</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
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

        <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

interface CommentListProps {
  comments: Comment[];
  postId: number;
}

export function CommentList({ comments, postId }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No comments yet. Be the first to share your thoughts.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/50">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} postId={postId} />
      ))}
    </div>
  );
}
