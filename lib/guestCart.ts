/**
 * lib/guestCart.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Client-side guest cart stored in localStorage.
 * Key: "guest_cart"
 * Fires the custom event "guest-cart-updated" on every mutation so any
 * component (e.g. the navbar badge) can react without polling.
 */

export const GUEST_CART_KEY = 'guest_cart';

export interface GuestCartItem {
  productId: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
  // Enriched fields – filled after backend validation
  title?: string;
  titleEn?: string;
  image?: string | null;
  price?: number;
  maxQuantity?: number;
  available?: boolean;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export function getGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as GuestCartItem[]) : [];
  } catch {
    return [];
  }
}

export function getGuestCartCount(): number {
  return getGuestCart().reduce((sum, item) => sum + item.quantity, 0);
}

// ─── Write ────────────────────────────────────────────────────────────────────

function persist(items: GuestCartItem[]): GuestCartItem[] {
  if (typeof window === 'undefined') return items;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('guest-cart-updated'));
  } catch {
    // ignore quota errors
  }
  return items;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Add an item (or increment quantity if same productId+size+color already exists).
 */
export function addToGuestCart(item: GuestCartItem): GuestCartItem[] {
  const items = getGuestCart();

  const idx = items.findIndex(
    (i) =>
      i.productId === item.productId &&
      (i.size ?? null) === (item.size ?? null) &&
      (i.color ?? null) === (item.color ?? null)
  );

  if (idx >= 0) {
    const existing = items[idx];
    const newQty = existing.quantity + item.quantity;
    items[idx] = {
      ...existing,
      ...item,                                         // keep fresh enriched fields
      quantity:
        existing.maxQuantity != null
          ? Math.min(newQty, existing.maxQuantity)
          : newQty,
    };
  } else {
    items.push({ ...item });
  }

  return persist(items);
}

/**
 * Change quantity of a specific item (by productId + size + color).
 * Passing quantity ≤ 0 removes the item.
 */
export function updateGuestCartItem(
  productId: string,
  quantity: number,
  size?: string | null,
  color?: string | null
): GuestCartItem[] {
  const items = getGuestCart();
  const idx = items.findIndex(
    (i) =>
      i.productId === productId &&
      (i.size ?? null) === (size ?? null) &&
      (i.color ?? null) === (color ?? null)
  );

  if (idx >= 0) {
    if (quantity <= 0) {
      items.splice(idx, 1);
    } else {
      items[idx] = { ...items[idx], quantity };
    }
  }

  return persist(items);
}

/**
 * Remove an item by productId + size + color.
 */
export function removeGuestCartItem(
  productId: string,
  size?: string | null,
  color?: string | null
): GuestCartItem[] {
  const items = getGuestCart().filter(
    (i) =>
      !(
        i.productId === productId &&
        (i.size ?? null) === (size ?? null) &&
        (i.color ?? null) === (color ?? null)
      )
  );
  return persist(items);
}

/**
 * Wipe the whole guest cart.
 */
export function clearGuestCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_CART_KEY);
  window.dispatchEvent(new Event('guest-cart-updated'));
}

/**
 * Overwrite cart with server-validated/enriched items.
 */
export function mergeValidatedItems(validated: GuestCartItem[]): void {
  persist(validated);
}
