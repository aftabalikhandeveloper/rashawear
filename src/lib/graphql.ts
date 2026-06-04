const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://dash.rashawear.com/graphql';

// ─── CORE FETCH ─────────────────────────────────────────────────────

export async function fetchGraphQL(
  query: string,
  variables?: Record<string, unknown>,
  sessionToken?: string | null
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (sessionToken) {
    headers['woocommerce-session'] = `Session ${sessionToken}`;
  }

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });

  // Capture the woocommerce-session token from response
  const newSessionToken = res.headers.get('woocommerce-session');
  const json = await res.json();

  if (json.errors) {
    console.error('GraphQL errors:', json.errors);
    throw new Error(json.errors[0]?.message || 'GraphQL Error');
  }

  return { data: json.data, sessionToken: newSessionToken };
}

// Helper without session
async function gql(query: string, variables?: Record<string, unknown>) {
  const { data } = await fetchGraphQL(query, variables);
  return data;
}

// ─── PRODUCT FRAGMENT ───────────────────────────────────────────────

const PRODUCT_FIELDS = `
  id
  databaseId
  name
  slug
  shortDescription
  image {
    sourceUrl
    altText
  }
  galleryImages {
    nodes {
      sourceUrl
      altText
    }
  }
  productCategories {
    nodes {
      name
      slug
    }
  }
  ... on SimpleProduct {
    price
    regularPrice
    salePrice
    stockStatus
  }
  ... on VariableProduct {
    price
    regularPrice
    salePrice
    stockStatus
    attributes {
      nodes {
        name
        label
        options
        variation
      }
    }
    defaultAttributes {
      nodes {
        name
        value
      }
    }
    variations(first: 30) {
      nodes {
        id
        databaseId
        name
        price
        regularPrice
        salePrice
        stockStatus
        image {
          sourceUrl
          altText
        }
        attributes {
          nodes {
            name
            label
            value
          }
        }
      }
    }
  }
  ... on ExternalProduct {
    price
    regularPrice
    salePrice
  }
`;

// Related products use ProductUnion — needs inline fragments per type
const RELATED_PRODUCT_FIELDS = `
  ... on SimpleProduct {
    id
    databaseId
    name
    slug
    shortDescription
    image { sourceUrl altText }
    galleryImages { nodes { sourceUrl altText } }
    productCategories { nodes { name slug } }
    price
    regularPrice
    salePrice
    stockStatus
  }
  ... on VariableProduct {
    id
    databaseId
    name
    slug
    shortDescription
    image { sourceUrl altText }
    galleryImages { nodes { sourceUrl altText } }
    productCategories { nodes { name slug } }
    price
    regularPrice
    salePrice
    stockStatus
    attributes {
      nodes { name label options variation }
    }
  }
  ... on ExternalProduct {
    id
    databaseId
    name
    slug
    shortDescription
    image { sourceUrl altText }
    galleryImages { nodes { sourceUrl altText } }
    productCategories { nodes { name slug } }
    price
    regularPrice
    salePrice
  }
  ... on GroupProduct {
    id
    databaseId
    name
    slug
    shortDescription
    image { sourceUrl altText }
    galleryImages { nodes { sourceUrl altText } }
    productCategories { nodes { name slug } }
  }
`;

// ─── PRODUCT QUERIES ────────────────────────────────────────────────

export async function getProducts(first = 20, categorySlug?: string) {
  const where = categorySlug ? `, where: { category: "${categorySlug}" }` : '';
  const query = `
    query GetProducts {
      products(first: ${first}${where}) {
        nodes { ${PRODUCT_FIELDS} }
      }
    }
  `;
  const data = await gql(query);
  return data.products.nodes;
}

export async function getProductBySlug(slug: string) {
  const query = `
    query GetProduct($slug: ID!) {
      product(id: $slug, idType: SLUG) {
        ${PRODUCT_FIELDS}
        description
        related(first: 4) {
          nodes { ${RELATED_PRODUCT_FIELDS} }
        }
      }
    }
  `;
  const data = await gql(query, { slug });
  return data.product;
}

export async function getProductsByCategory(slug: string, first = 20) {
  const query = `
    query GetProductsByCategory($first: Int!) {
      products(first: $first, where: { category: "${slug}" }) {
        nodes { ${PRODUCT_FIELDS} }
      }
    }
  `;
  const data = await gql(query, { first });
  return data.products.nodes;
}

// ─── CATEGORY QUERIES ───────────────────────────────────────────────

export async function getProductCategories() {
  const query = `
    query GetCategories {
      productCategories(first: 50, where: { hideEmpty: false }) {
        nodes {
          id
          databaseId
          name
          slug
          count
          description
          image { sourceUrl }
          parent {
            node { name slug }
          }
          children {
            nodes {
              id
              databaseId
              name
              slug
              count
              description
              image { sourceUrl }
            }
          }
        }
      }
    }
  `;
  const data = await gql(query);
  return data.productCategories.nodes;
}

// ─── SEARCH QUERY ───────────────────────────────────────────────────

export async function searchProducts(searchTerm: string) {
  const query = `
    query SearchProducts {
      products(first: 20, where: { search: "${searchTerm}" }) {
        nodes { ${PRODUCT_FIELDS} }
      }
    }
  `;
  const data = await gql(query);
  return data.products.nodes;
}

// ─── WOOCOMMERCE CART MUTATIONS ─────────────────────────────────────

const CART_FIELDS = `
  contents {
    itemCount
    nodes {
      key
      quantity
      total
      subtotal
      product {
        node {
          databaseId
          name
          slug
          image { sourceUrl altText }
          ... on SimpleProduct { price regularPrice }
          ... on VariableProduct { price regularPrice }
        }
      }
      variation {
        node {
          databaseId
          name
          image { sourceUrl altText }
          attributes { nodes { name label value } }
        }
      }
    }
  }
  total
  subtotal
  shippingTotal
  totalTax
`;

export async function addToCartMutation(
  productId: number,
  quantity: number,
  sessionToken?: string | null,
  variationId?: number
) {
  const variationInput = variationId ? `, variationId: ${variationId}` : '';
  const query = `
    mutation AddToCart {
      addToCart(input: { productId: ${productId}, quantity: ${quantity}${variationInput} }) {
        cart { ${CART_FIELDS} }
      }
    }
  `;
  return fetchGraphQL(query, undefined, sessionToken);
}

export async function updateCartItemMutation(
  key: string,
  quantity: number,
  sessionToken: string
) {
  const query = `
    mutation UpdateCart {
      updateItemQuantities(input: { items: [{ key: "${key}", quantity: ${quantity} }] }) {
        cart { ${CART_FIELDS} }
      }
    }
  `;
  return fetchGraphQL(query, undefined, sessionToken);
}

export async function removeCartItemMutation(
  keys: string[],
  sessionToken: string
) {
  const keysStr = keys.map(k => `"${k}"`).join(', ');
  const query = `
    mutation RemoveFromCart {
      removeItemsFromCart(input: { keys: [${keysStr}] }) {
        cart { ${CART_FIELDS} }
      }
    }
  `;
  return fetchGraphQL(query, undefined, sessionToken);
}

export async function getCartQuery(sessionToken: string) {
  const query = `
    query GetCart {
      cart { ${CART_FIELDS} }
    }
  `;
  return fetchGraphQL(query, undefined, sessionToken);
}

export async function emptyCartMutation(sessionToken: string) {
  const query = `
    mutation EmptyCart {
      emptyCart(input: {}) {
        cart { ${CART_FIELDS} }
      }
    }
  `;
  return fetchGraphQL(query, undefined, sessionToken);
}

// ─── CHECKOUT MUTATION ──────────────────────────────────────────────

export async function checkoutMutation(
  sessionToken: string,
  billing: {
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
  },
  shipping?: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  },
  paymentMethod = 'cod',
  customerNote?: string
) {
  // Country must be an unquoted GraphQL enum value (PK not "PK")
  const billingCountryEnum = billing.country || 'PK';
  const billingStr = `
    firstName: "${billing.firstName}"
    lastName: "${billing.lastName}"
    address1: "${billing.address1}"
    address2: "${billing.address2 || ''}"
    city: "${billing.city}"
    state: "${billing.state}"
    postcode: "${billing.postcode}"
    country: ${billingCountryEnum}
    email: "${billing.email}"
    phone: "${billing.phone}"
  `;

  const shippingData = shipping || billing;
  const shippingCountryEnum = shippingData.country || 'PK';
  const shippingStr = `
    firstName: "${shippingData.firstName}"
    lastName: "${shippingData.lastName}"
    address1: "${shippingData.address1}"
    address2: "${shippingData.address2 || ''}"
    city: "${shippingData.city}"
    state: "${shippingData.state}"
    postcode: "${shippingData.postcode}"
    country: ${shippingCountryEnum}
  `;

  const noteStr = customerNote ? `, customerNote: "${customerNote}"` : '';

  const query = `
    mutation Checkout {
      checkout(input: {
        paymentMethod: "${paymentMethod}"
        billing: { ${billingStr} }
        shipping: { ${shippingStr} }
        ${noteStr}
      }) {
        order {
          id
          databaseId
          orderNumber
          status
          total
          subtotal
          shippingTotal
          totalTax
          paymentMethodTitle
          date
          billing {
            firstName
            lastName
            email
            phone
            address1
            city
            state
            postcode
            country
          }
          lineItems {
            nodes {
              quantity
              total
              product {
                node { name slug image { sourceUrl } }
              }
            }
          }
        }
        result
      }
    }
  `;

  return fetchGraphQL(query, undefined, sessionToken);
}
