"use client";

import { useSession } from "@/lib/auth-client";
import { sessionCache } from "@/lib/session-cache";
import { useMemo, useEffect, useState } from "react";

export function useAuth() {
  const [cachedUser, setCachedUser] = useState(() => sessionCache.get());
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (session?.user) {
      sessionCache.set(session.user);
      setCachedUser(session.user);
    }
  }, [session?.user]);

  return useMemo(() => {
    const user = session?.user || cachedUser;
    return {
      user,
      isAuthenticated: !!user,
      isLoading: !cachedUser && isPending,
    };
  }, [session?.user, cachedUser, isPending]);
}
