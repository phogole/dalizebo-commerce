export type Money = {
  amount: number;
  currency: string;
};

export type ProductVariant = {
  id: string;
  title: string;
  sku: string | null;
  price: Money | null;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  brand: string | null;
  variants: ProductVariant[];
};
