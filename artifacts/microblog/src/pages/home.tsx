import { useListPosts, getListPostsQueryKey, useHealthCheck, getHealthCheckQueryKey } from "@workspace/api-client-react";
import { Show } from "@clerk/react";
import { PostCard } from "@/components/post/PostCard";
import { ComposePost } from "@/components/post/ComposePost";
import { FeedStatsWidget } from "@/components/layout/FeedStatsWidget";
import { MiniProfile } from "@/components/layout/MiniProfile";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: postsPage, isLoading } = useListPosts(
    { page: 1, limit: 50 },
    { query: { queryKey: getListPostsQueryKey({ page: 1, limit: 50 }) } }
  );
  
  const { data: health } = useHealthCheck({
    query: {
      queryKey: getHealthCheckQueryKey()
    }
  });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <main className="space-y-6">
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <Show when="signed-in">
              <ComposePost />
            </Show>

            <Show when="signed-out">
              <div className="border-b border-border bg-primary/5 p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    <line x1="9" y1="10" x2="15" y2="10"/>
                    <line x1="9" y1="14" x2="15" y2="14"/>
                  </svg>
                </div>
                <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground mb-2">Join the conversation</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">Sign in to share your thoughts with the community. A cozy place for big ideas.</p>
                <Button asChild className="rounded-full px-8 font-semibold shadow-sm">
                  <Link href="/sign-in">Sign In to Post</Link>
                </Button>
              </div>
            </Show>

            {isLoading ? (
              <div className="divide-y divide-border/50">
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
                <p>No posts yet. It's quiet here...</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {postsPage?.posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </main>

        <aside className="hidden lg:block space-y-6">
          <Show when="signed-in">
            <MiniProfile />
          </Show>
          
          <FeedStatsWidget />
          
          <div className="rounded-2xl bg-muted/50 p-6 text-sm text-muted-foreground">
            <h3 className="font-semibold text-foreground mb-2">About Microblog</h3>
            <p>A focused, no-noise community space where people share quick thoughts with people who care.</p>
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs">
              <span>Built with React</span>
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${health?.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>{health?.status === 'ok' ? 'API Online' : 'API Offline'}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
