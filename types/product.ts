// ─────────────────────────────────────────────────────────────────────────────
// MIRVORY — Shared Product Types
// Supports the Color → Size → Quantity inventory model.
// Old orders that lack colorSnapshot are handled safely via optional fields.
// ─────────────────────────────────────────────────────────────────────────────

/** A size entry inside a color swatch */
export interface ColorSize {
  size: string;
  quantity: number;
}

/** A color swatch with its own image and per-size inventory */
export interface ProductColor {
  name: string;
  value: string;         // hex code e.g. "#000000"
  image: string;         // URL of colour-specific product photo
  available: boolean;
  /** Per-size inventory for this colour. Optional for backward compatibility. */
  sizes?: ColorSize[];
}

/** Full product shape as returned by the backend */
export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  discountedPrice: number;
  /** Total quantity (aggregate / legacy fallback). */
  quantity: number;
  sold: number;
  images: string[];
  /** Legacy flat sizes list – used when colors have no per-size inventory. */
  sizes: string[];
  colors: ProductColor[];
  ratings: {
    average: number;
    count: number;
    distribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  category: {
    _id: string;
    name: string;
    nameEn: string;
  };
  isFeatured: boolean;
  status: "available" | "pending" | "sold";
  createdAt: string;
  updatedAt: string;
}

/** Colour snapshot stored inside each order item */
export interface OrderItemColorSnapshot {
  name: string;
  value: string;
  image?: string;
}

/** A single line item in an order */
export interface OrderItem {
  product: string;              // product _id
  productName?: string;
  /** Snapshot of the colour at time of purchase. Optional for backward compat. */
  color?: OrderItemColorSnapshot | null;
  /** Legacy flat string colour (old orders). */
  colorName?: string;
  size?: string;
  quantity: number;
  price: number;
  image?: string;
}

/** Inventory roll-up returned by admin inventory API */
export interface InventoryEntry {
  productId: string;
  productTitle: string;
  productImage?: string;
  colors: Array<{
    name: string;
    value: string;
    image?: string;
    sizes: Array<{
      size: string;
      quantity: number;
      sold?: number;
    }>;
    totalQuantity: number;
  }>;
  totalQuantity: number;
}
