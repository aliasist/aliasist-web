/**
 * useAIImage — React hook for aliasist-image-worker
 *
 * Fetches an AI-generated image from the worker and returns a blob URL.
 * Each call with no seed gets a unique image. Pass a stable seed to
 * get the same image every time (good for project cards that should
 * look consistent within a session).
 *
 * Image types:
 *   "loading" | "hero" | "blog" | "ambient"
 *   "project-tikasist" | "project-spacesist" | "project-pulsesist"
 *   "project-datasist" | "project-generic"
 */

import { useState, useEffect, useRef } from "react";

export type AIImageType =
  | "loading"
  | "hero"
  | "blog"
  | "ambient"
  | "project-tikasist"
  | "project-spacesist"
  | "project-pulsesist"
  | "project-datasist"
  | "project-generic";

interface UseAIImageOptions {
  seed?: number;
  width?: number;
  height?: number;
  /** Skip generation entirely (e.g. if a real image is preferred) */
  disabled?: boolean;
}

interface UseAIImageResult {
  src: string | null;
  loading: boolean;
  error: boolean;
}

const WORKER_URL = "https://aliasist-image-worker.bchooper0730.workers.dev";

// Module-level session cache: cacheKey → objectURL
// Avoids re-fetching the same image within a single page session.
const sessionCache = new Map<string, string>();

export function useAIImage(
  type: AIImageType,
  options: UseAIImageOptions = {}
): UseAIImageResult {
  const { seed, width, height, disabled = false } = options;
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(!disabled);
  const [error, setError] = useState(false);

  // Keep track of whether the component is still mounted
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (disabled) {
      setLoading(false);
      return;
    }

    const cacheKey = `${type}-${seed ?? "rnd"}-${width ?? "dw"}-${height ?? "dh"}`;

    // Hit session cache first
    if (sessionCache.has(cacheKey)) {
      setSrc(sessionCache.get(cacheKey)!);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    const params = new URLSearchParams();
    if (seed !== undefined) params.set("seed", String(seed));
    if (width)  params.set("w", String(width));
    if (height) params.set("h", String(height));

    const url = `${WORKER_URL}/themed/${type}${params.toString() ? "?" + params.toString() : ""}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Worker ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled || !mountedRef.current) return;
        const objectUrl = URL.createObjectURL(blob);
        sessionCache.set(cacheKey, objectUrl);
        setSrc(objectUrl);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled || !mountedRef.current) return;
        setError(true);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [type, seed, width, height, disabled]);

  return { src, loading, error };
}

/**
 * Prefetch an AI image in the background without rendering it.
 * Useful for preloading the loading screen art before it's needed.
 */
export function prefetchAIImage(type: AIImageType, seed?: number): void {
  const cacheKey = `${type}-${seed ?? "rnd"}-dw-dh`;
  if (sessionCache.has(cacheKey)) return;

  const params = new URLSearchParams();
  if (seed !== undefined) params.set("seed", String(seed));
  const url = `${WORKER_URL}/themed/${type}${params.toString() ? "?" + params.toString() : ""}`;

  fetch(url)
    .then((r) => r.blob())
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      sessionCache.set(cacheKey, objectUrl);
    })
    .catch(() => {/* silent */});
}
