export interface ProductImage {
  sourceUrl: string;
  altText?: string;
}

export interface ProductAttribute {
  name: string;
  label: string;
  options: string[];
  variation: boolean;
}

export interface VariationAttribute {
  name: string;
  label: string;
  value: string;
}

export interface ProductCategory {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  count?: number | null;
  description?: string | null;
  image?: { sourceUrl: string } | null;
  parent?: { node: { name: string; slug: string } } | null;
  children?: {
    nodes: ProductCategory[];
  };
}

export interface ProductVariation {
  id: string;
  databaseId: number;
  name: string;
  price: string;
  regularPrice: string;
  salePrice: string | null;
  stockStatus: string;
  image?: ProductImage;
  attributes: {
    nodes: VariationAttribute[];
  };
}

export interface Product {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  stockStatus?: string;
  image: ProductImage;
  galleryImages?: {
    nodes: ProductImage[];
  };
  productCategories: {
    nodes: ProductCategory[];
  };
  price: string | null;
  regularPrice: string | null;
  salePrice: string | null;
  attributes?: {
    nodes: ProductAttribute[];
  };
  defaultAttributes?: {
    nodes: { name: string; value: string }[];
  };
  variations?: {
    nodes: ProductVariation[];
  };
  related?: {
    nodes: Product[];
  };
}

export interface WooCartItem {
  key: string;
  quantity: number;
  total: string;
  subtotal: string;
  product: {
    node: {
      databaseId: number;
      name: string;
      slug: string;
      image: ProductImage;
      price?: string;
      regularPrice?: string;
    };
  };
  variation?: {
    node: {
      databaseId: number;
      name: string;
      image?: ProductImage;
      attributes: {
        nodes: VariationAttribute[];
      };
    };
  } | null;
}

export interface WooCart {
  contents: {
    itemCount: number;
    nodes: WooCartItem[];
  };
  total: string;
  subtotal: string;
  shippingTotal: string;
  totalTax: string;
}

export interface WooOrder {
  id: string;
  databaseId: number;
  orderNumber: string;
  status: string;
  total: string;
  subtotal: string;
  shippingTotal: string;
  totalTax: string;
  paymentMethodTitle: string;
  date: string;
  billing: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  lineItems: {
    nodes: {
      quantity: number;
      total: string;
      product: {
        node: {
          name: string;
          slug: string;
          image: ProductImage;
        };
      };
    }[];
  };
}

export interface BillingInput {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}
