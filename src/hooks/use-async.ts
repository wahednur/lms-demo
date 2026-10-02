"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AsyncState } from "@/types";

/**
 * Generic data-fetching hook for mock-service calls: tracks loading/error
 * state consistently so every page gets real (not simulated-then-ignored)
 * loading states and error feedback (brief §12/§13). `reload()` lets a page
 * refetch after a mutation without a full remount.
 *
 * Callers typically pass an inline async closure, so its identity changes
 * every render — `fn` is kept in a ref (synced in its own effect, never
 * during render) and the fetch effect only re-runs on `deps`/`reload()`,
 * not on every render.
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: React.DependencyList,
): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const fnRef = useRef(fn);
  const [reloadTick, setReloadTick] = useState(0);

  const reload = useCallback(() => setReloadTick((t) => t + 1), []);

  // Keep the ref pointing at the latest closure — done in an effect (after
  // commit), never during render, per react-hooks/refs.
  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    let cancelled = false;
    // Fetching on mount / when `deps` change is the standard reason to use
    // an Effect (see react.dev "Fetching data") — the resulting setState
    // calls are the point of this hook, not an anti-pattern to avoid.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((s) => ({ ...s, loading: true, error: null }));
    fnRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : "Something went wrong.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps array is caller-controlled by design
  }, [...deps, reloadTick]);

  return { ...state, reload };
}
