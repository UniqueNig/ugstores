"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { useToast } from "@/src/context/ToastContext";

export type WishlistItem = {
  id: string; // product _id
  slug?: string; // SEO URL (falls back to id)
  name: string;
  price: number;
  image: string | null;
  category: string;
};

type WishlistContextType = {
  items: WishlistItem[];
  count: number;
  has: (id: string) => boolean;
  toggle: (item: WishlistItem) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = "fanmid_wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Mirror of items so toggle can read current state without making the
  // setItems updater impure (calling toast inside it crashes React).
  const itemsRef = useRef<WishlistItem[]>(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const has = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items],
  );

  const toggle = useCallback(
    (item: WishlistItem) => {
      // Decide based on current state, then update + toast — both OUTSIDE
      // the setItems updater so we never call setState during render.
      const exists = itemsRef.current.some((i) => i.id === item.id);
      setItems((prev) =>
        exists
          ? prev.filter((i) => i.id !== item.id)
          : [...prev, item],
      );
      toast(
        exists
          ? `${item.name} removed from wishlist`
          : `${item.name} added to wishlist`,
        exists ? "info" : "success",
      );
    },
    [toast],
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return (
    <WishlistContext.Provider
      value={{ items, count: items.length, has, toggle, remove, clear }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
