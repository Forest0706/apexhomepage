export const PRODUCT_QUERY = `#graphql
  query Product(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      handle
      vendor
      description
      descriptionHtml
      tags
      availableForSale
      requiresSellingPlan
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      featuredImage {
        url
        altText
        width
        height
      }
      images(first: 10) {
        nodes {
          url
          altText
        }
      }
      variants(first: 10) {
        nodes {
          id
          title
          availableForSale
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
          # ✅ 新增：变体级别的 selling plan 关联
          sellingPlanAllocations(first: 5) {
            nodes {
              sellingPlan {
                id
                name
                description
              }
              priceAdjustments {
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
      releaseDate: metafield(namespace: "specs", key: "releaseDate") {
        value
        type
      }
      scale: metafield(namespace: "specs", key: "scale") {
        value
        type
      }
      height: metafield(namespace: "specs", key: "height") {
        value
        type
      }
      collections(first: 5) {
        nodes {
          id
          title
          handle
        }
      }
    }
  }
` as const;

export const PRODUCT_FRAGMENT = `#graphql
  fragment ProductDetails on Product {
    id
    title
    handle
    vendor
    description
    descriptionHtml
    tags
    availableForSale
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 10) {
      nodes {
        url
        altText
      }
    }
    variants(first: 10) {
      nodes {
        id
        title
        availableForSale
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
      }
    }
  }
` as const;
