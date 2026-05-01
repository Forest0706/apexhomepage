export const RELATED_PRODUCTS_QUERY = `#graphql
  query GetRelatedProducts(
    $collectionHandle: String!
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $collectionHandle) {
      products(first: $first) {
        nodes {
          id
          title
          handle
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            nodes {
              id
            }
          }
        }
      }
    }
  }
` as const;
