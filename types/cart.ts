export interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string | null;
  colors?: Array<{ name: string; value: string; image: string; available?: boolean; sizes?: { size: string; quantity: number }[] }>;
}

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
}
