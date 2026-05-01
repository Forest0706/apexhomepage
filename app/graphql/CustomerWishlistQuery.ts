export const CUSTOMER_WISHLIST_QUERY = `#graphql
  query GetCustomerWishlist {
    customer {
      id
      metafield(namespace: "wishlist", key: "items") {
        value
      }
    }
  }
` as const;