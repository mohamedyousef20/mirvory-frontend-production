// ─────────────────────────────────────────────────────────────────────────────
// MIRVORY v5 — color-based product helpers
//
// A product has colors[]. Each color owns its image and its sizes[{size, quantity}].
// Stock belongs to Product + Color + Size. There is NO global images[] or sizes[] anymore.
// Every screen should use these helpers instead of reading product fields directly,
// so a color's image / sizes / stock can never be mixed with another color's.
// ─────────────────────────────────────────────────────────────────────────────

export const PLACEHOLDER_IMAGE = '/placeholder.svg'

export interface VariantSize {
  size: string
  quantity: number
}

export interface VariantColor {
  _id?: string
  name: string
  value: string
  image?: string | null
  available?: boolean
  sizes?: VariantSize[]
}

export interface VariantProduct {
  image?: string | null
  colors?: VariantColor[] | null
  quantity?: number
  totalStock?: number
}

const same = (a?: string | null, b?: string | null) =>
  String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase()

/** Stock of one color = sum of its sizes. */
export const getColorStock = (color?: VariantColor | null): number =>
  (color?.sizes ?? []).reduce((sum, s) => sum + (Number(s.quantity) || 0), 0)

/** Stock of one exact color + size. */
export const getSizeStock = (color?: VariantColor | null, size?: string | null): number => {
  if (!color || !size) return 0
  const hit = (color.sizes ?? []).find((s) => same(s.size, size))
  return hit ? Number(hit.quantity) || 0 : 0
}

/** Colors a customer may pick (active ones). Sold-out colors stay visible so they can be shown as sold out. */
export const getActiveColors = (product?: VariantProduct | null): VariantColor[] =>
  (product?.colors ?? []).filter((c) => c && c.available !== false)

/** Total sellable stock across all active colors and sizes. */
export const getTotalStock = (product?: VariantProduct | null): number => {
  if (!product) return 0
  if (Array.isArray(product.colors) && product.colors.length > 0) {
    return getActiveColors(product).reduce((sum, c) => sum + getColorStock(c), 0)
  }
  return Number(product.totalStock ?? product.quantity ?? 0) || 0
}

/** The color shown first: the first active color that still has stock, else the first active color. */
export const getDefaultColor = (product?: VariantProduct | null): VariantColor | null => {
  const active = getActiveColors(product)
  return active.find((c) => getColorStock(c) > 0) ?? active[0] ?? null
}

export const findColor = (product: VariantProduct | null | undefined, colorValue?: string | null): VariantColor | null =>
  (product?.colors ?? []).find((c) => same(c.value, colorValue)) ?? null

/** Image of one specific color. Never falls back to another color's image. */
export const getColorImage = (product: VariantProduct | null | undefined, colorValue?: string | null): string | null =>
  findColor(product, colorValue)?.image || null

/**
 * Main image of a product (cards, lists, search): the image of the default color.
 * Accepts the API's `image` field too (the backend fills it from the first active color).
 */
export const getProductImage = (product?: VariantProduct | null): string => {
  if (!product) return PLACEHOLDER_IMAGE
  return getDefaultColor(product)?.image || product.image || (product.colors ?? []).find((c) => c?.image)?.image || PLACEHOLDER_IMAGE
}
