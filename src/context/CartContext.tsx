"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useToast } from "@/src/context/ToastContext";
import { trackAddToCart } from "@/src/lib/analytics";

export type CartItem = {
  id: string;        // product _id from MongoDB
  name: string;
  price: number;
  image: string | null;
  size: string;
  color?: string;    // chosen colour (empty when the product has no colours)
  quantity: number;
  category: string;
  maxStock?: number; // available units; caps how many can be added
};

type CartContextType = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string, size: string, color?: string) => void;
  updateQty: (id: string, size: string, delta: number, color?: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "fanmid_cart";

// A cart line is unique per product + size + colour, so the same product in two
// colours (or sizes) sits on its own line.
const sameLine = (
  i: CartItem,
  id: string,
  size: string,
  color?: string,
) => i.id === id && i.size === size && (i.color ?? "") === (color ?? "");

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Keep a ref of the latest items so addItem can read current state
  // synchronously (to decide "added" vs "already at max").
  const itemsRef = useRef<CartItem[]>(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  // Clamp a quantity to the available stock (when we know it).
  const capToStock = (qty: number, maxStock?: number) =>
    typeof maxStock === "number" && maxStock > 0 ? Math.min(qty, maxStock) : qty;

  const addItem = useCallback(
    (incoming: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      // Decide the feedback message from the CURRENT cart state.
      const existing = itemsRef.current.find((i) =>
        sameLine(i, incoming.id, incoming.size, incoming.color),
      );
      const cap = incoming.maxStock ?? existing?.maxStock;
      const atMax =
        !!existing &&
        typeof cap === "number" &&
        cap > 0 &&
        existing.quantity >= cap;

      setItems((prev) => {
        const exists = prev.find((i) =>
          sameLine(i, incoming.id, incoming.size, incoming.color),
        );
        if (exists) {
          const c = incoming.maxStock ?? exists.maxStock;
          return prev.map((i) =>
            sameLine(i, incoming.id, incoming.size, incoming.color)
              ? {
                  ...i,
                  maxStock: c,
                  quantity: capToStock(i.quantity + (incoming.quantity ?? 1), c),
                }
              : i,
          );
        }
        return [
          ...prev,
          {
            ...incoming,
            quantity: capToStock(incoming.quantity ?? 1, incoming.maxStock),
          },
        ];
      });

      if (atMax) {
        toast(`Max available quantity of "${incoming.name}" already in cart`, "info");
      } else {
        toast(`${incoming.name} added to cart`, "success");
        trackAddToCart({
          id: incoming.id,
          name: incoming.name,
          price: incoming.price,
          size: incoming.size,
          color: incoming.color,
          quantity: incoming.quantity ?? 1,
        });
      }
    },
    [toast],
  );

  const removeItem = useCallback((id: string, size: string, color?: string) => {
    setItems((prev) => prev.filter((i) => !sameLine(i, id, size, color)));
  }, []);

  const updateQty = useCallback(
    (id: string, size: string, delta: number, color?: string) => {
    setItems((prev) =>
      prev.map((i) => {
        if (!sameLine(i, id, size, color)) return i;
        let next = Math.max(1, i.quantity + delta);
        if (typeof i.maxStock === "number" && i.maxStock > 0) {
          next = Math.min(next, i.maxStock);
        }
        return { ...i, quantity: next };
      }),
    );
    },
    [],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, totalItems, subtotal, addItem, removeItem, updateQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}