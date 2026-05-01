export const FEATURED_PRODUCTS_QUERY = `#graphql
  query GetFeaturedProducts(
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        id
        title
        handle
        vendor
        tags
        featuredImage {
          url
          altText
          width
          height
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
            availableForSale
            image {
              url
              altText
              width
              height
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
            product {
              handle
              title
            }
          }
        }
      }
    }
  }
` as const;
