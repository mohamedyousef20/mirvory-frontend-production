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

/** A color with its own image and its own sizes + stock (v5) */
export interface ProductColor {
  _id?: string;
  name: string;
  value: string;         // hex code e.g. "#000000" — identifies the color's stock
  image: string;         // this color's own photo
  available: boolean;
  /** Sizes (and stock) that belong to THIS color only. */
  sizes: ColorSize[];
}

/** Full product shape as returned by the backend */
export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  discountedPrice: number;
  /** Total stock = sum of all sizes of all active colors (derived by the backend). */
  quantity: number;
  sold: number;
  /** Main image = image of the first active color (added by the API). There is no global images[] anymore. */
  image?: string | null;
  totalStock?: number;
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
  id?: string | null;
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
