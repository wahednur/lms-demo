"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { SystemUser } from "@/types";
import { sessionService } from "@/services";

interface SessionContextValue {
  user: SystemUser | null;
  loading: boolean;
  /** True once the initial localStorage check has resolved — lets guarded
   * layouts tell "still checking" apart from "confirmed signed out". */
  ready: boolean;
  loginAs: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SystemUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const current = await sessionService.getCurrentUser();
      setUser(current);
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    // Fetch the demo session on mount — an async service call, not state
    // derivable during render (it reads localStorage via sessionService,
    // which is also unavailable during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const loginAs = useCallback(
    async (userId: string) => {
      await sessionService.loginAs(userId);
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    await sessionService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, ready, loginAs, logout, refresh }),
    [user, loading, ready, loginAs, logout, refresh],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
