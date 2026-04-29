import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser } from "@/lib/auth";

export function useCurrentUser() {
  const query = useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: fetchCurrentUser,
    staleTime: 30_000,
  });

  const currentUser = query.data ?? null;

  return {
    ...query,
    currentUser,
    isAuthenticated: Boolean(currentUser),
    isOwner: currentUser?.role === "owner",
  };
}
