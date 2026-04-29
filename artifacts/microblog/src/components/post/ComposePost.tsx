import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCreatePost, getListPostsQueryKey, getGetPostsByUserQueryKey, getGetFeedStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const MAX_CHARS = 280;

const formSchema = z.object({
  content: z.string().min(1, "Post cannot be empty").max(MAX_CHARS, `Post must be less than ${MAX_CHARS} characters`),
});

export function ComposePost() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isFocused, setIsFocused] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const contentValue = form.watch("content");
  const charsRemaining = MAX_CHARS - (contentValue?.length || 0);
  const isNearLimit = charsRemaining <= 20;
  const isOverLimit = charsRemaining < 0;

  const createPost = useCreatePost({
    mutation: {
      onSuccess: () => {
        form.reset();
        setIsFocused(false);
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetFeedStatsQueryKey() });
        if (user) {
          queryClient.invalidateQueries({ queryKey: getGetPostsByUserQueryKey(user.id) });
        }
        toast({ title: "Post published" });
      },
      onError: () => {
        toast({ title: "Failed to publish post", variant: "destructive" });
      }
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createPost.mutate({ data: values });
  };

  if (!user) return null;

  return (
    <div className="border-b border-border bg-card p-5 sm:p-6 transition-colors duration-200" data-focused={isFocused}>
      <div className="flex gap-4">
        <Avatar className="h-10 w-10 shrink-0 border border-border">
          <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {user.firstName?.charAt(0) || user.username?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="What's on your mind?"
                        className="min-h-[100px] resize-none border-none bg-transparent p-0 text-lg shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className={`flex items-center justify-between pt-2 border-t border-border/50 transition-opacity duration-200 ${isFocused || contentValue.length > 0 ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden pt-0 border-transparent'}`}>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-medium transition-colors ${isOverLimit ? 'text-destructive' : isNearLimit ? 'text-orange-500' : 'text-muted-foreground'}`}>
                    {charsRemaining}
                  </span>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={createPost.isPending || !contentValue.trim() || isOverLimit}
                  className="rounded-full px-6 font-semibold shadow-sm"
                >
                  {createPost.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Post
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
