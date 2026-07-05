/**
 * guestCart.ts
 * Client-side guest cart management using localStorage.
 * Works alongside the existing authenticated cart system.
 * When a guest checks out, items are submitted to /api/guest-orders.
 */

const GUEST_CART_KEY = 'guest_cart';

export interface GuestCartItem {
  productId: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
  // Enriched fields (filled by validateGuestCart API call)
  title?: string;
  titleEn?: string;
  image?: string | null;
  price?: number;
  maxQuantity?: number;
  available?: boolean;
}

/**
 * Read the current guest cart from localStorage.
 */
export function getGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as GuestCartItem[]) : [];
  } catch {
    return [];
  }
}

/**
 * Persist the guest cart to localStorage and notify other components.
 * Pass silent=true to skip firing the event (used for internal enrichment).
 */
export function saveGuestCart(items: GuestCartItem[], silent = false): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    if (!silent) {
      window.dispatchEvent(new Event('guest-cart-updated'));
    }
  } catch {
    // Ignore storage errors (e.g. private browsing quota)
  }
}

/**
 * Add (or increment) an item in the guest cart.
 * If the same productId + size + color already exists, quantity is incremented.
 */
export function addToGuestCart(item: GuestCartItem): GuestCartItem[] {
  const items = getGuestCart();

  const existingIndex = items.findIndex(
    (i) =>
      i.productId === item.productId &&
      (i.size || null) === (item.size || null) &&
      (i.color || null) === (item.color || null)
  );

  if (existingIndex >= 0) {
    const existing = items[existingIndex];
    const newQty = existing.quantity + item.quantity;
    // Respect maxQuantity if known
    items[existingIndex] = {
      ...existing,
      // Always refresh enriched fields when adding
      ...(item.title ? { title: item.title } : {}),
      ...(item.titleEn ? { titleEn: item.titleEn } : {}),
      ...(item.image ? { image: item.image } : {}),
      ...(item.price !== undefined ? { price: item.price } : {}),
      ...(item.maxQuantity !== undefined ? { maxQuantity: item.maxQuantity } : {}),
      quantity:
        existing.maxQuantity != null
          ? Math.min(newQty, existing.maxQuantity)
          : newQty,
    };
  } else {
    items.push({ ...item });
  }

  saveGuestCart(items);
  return items;
}

/**
 * Update the quantity of a specific item.
 * Identified by productId + size + color.
 */
export function updateGuestCartItem(
  productId: string,
  quantity: number,
  size?: string | null,
  color?: string | null
): GuestCartItem[] {
  const items = getGuestCart();
  const index = items.findIndex(
    (i) =>
      i.productId === productId &&
      (i.size || null) === (size || null) &&
      (i.color || null) === (color || null)
  );

  if (index >= 0) {
    if (quantity <= 0) {
      items.splice(index, 1);
    } else {
      items[index] = { ...items[index], quantity };
    }
  }

  saveGuestCart(items);
  return items;
}

/**
 * Remove an item from the guest cart by index.
 */
export function removeGuestCartItem(index: number): GuestCartItem[] {
  const items = getGuestCart();
  items.splice(index, 1);
  saveGuestCart(items);
  return items;
}

/**
 * Remove an item by productId + size + color.
 */
export function removeGuestCartItemByKey(
  productId: string,
  size?: string | null,
  color?: string | null
): GuestCartItem[] {
  const items = getGuestCart().filter(
    (i) =>
      !(
        i.productId === productId &&
        (i.size || null) === (size || null) &&
        (i.color || null) === (color || null)
      )
  );
  saveGuestCart(items);
  return items;
}

/**
 * Clear the entire guest cart.
 */
export function clearGuestCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_CART_KEY);
  window.dispatchEvent(new Event('guest-cart-updated'));
}

/**
 * Return the total number of items (sum of quantities) in the guest cart.
 */
export function getGuestCartCount(): number {
  return getGuestCart().reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Merge validated enriched items back into localStorage SILENTLY.
 * This does NOT fire 'guest-cart-updated' to avoid re-render loops.
 * The caller is responsible for updating component state directly.
 */
export function mergeValidatedItems(validated: GuestCartItem[]): void {
  saveGuestCart(validated, true); // silent = no event
}
