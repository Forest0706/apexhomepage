import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';

export const COLLECTIONS_QUERY = `#graphql
  query GetCollections(
    $first: Int
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collections(first: $first, sortKey: TITLE) {
      nodes {
        id
        title
        handle
        image {
          url
          altText
        }
      }
    }
  }
` as const;

export const COLLECTION_PRODUCTS_QUERY = `#graphql
  query CollectionProducts(
    $collectionHandle: String!
    $first: Int
    $after: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $collectionHandle) {
      id
      title
      products(
        first: $first
        after: $after
        sortKey: $sortKey
        reverse: $reverse
      ) {
        nodes {
          id
          title
          handle
          vendor
          tags
          # ✅ 新增：判断是否为预购商品
          requiresSellingPlan
          sellingPlanGroups(first: 5) {
            nodes {
              name
              sellingPlans(first: 5) {
                nodes {
                  id
                  name
                  # ✅ 通过 checkoutCharge 判断付款方式
                  checkoutCharge {
                    type    # PERCENTAGE 或 PRICE
                    value {
                      ... on MoneyV2 {
                        amount
                        currencyCode
                      }
                      ... on SellingPlanCheckoutChargePercentageValue {
                        percentage
                      }
                    }
                  }
                }
              }
            }
          }
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
              image {
                url
                altText
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
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
` as const;

export const ALL_PRODUCTS_QUERY = `#graphql
  query AllProducts(
    $first: Int
    $after: String
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first
      after: $after
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      nodes {
        id
        title
        handle
        vendor
        tags
        # ✅ 新增：判断是否为预购商品
        requiresSellingPlan
        sellingPlanGroups(first: 5) {
          nodes {
            name
            sellingPlans(first: 5) {
              nodes {
                id
                name
                # ✅ 通过 checkoutCharge 判断付款方式
                checkoutCharge {
                  type    # PERCENTAGE 或 PRICE
                  value {
                    ... on MoneyV2 {
                      amount
                      currencyCode
                    }
                    ... on SellingPlanCheckoutChargePercentageValue {
                      percentage
                    }
                  }
                }
              }
            }
          }
        }
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
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;

export const HOMEPAGE_PRODUCTS_QUERY = `#graphql
query GetFeaturedProducts(
  $first: Int
  $country: CountryCode
  $language: LanguageCode
)@inContext(country: $country, language: $language){
  shop {
    metafield(namespace: "homepage", key: "featured_products") {
      references(first: $first) {
        edges {
          node {
            ... on Product {
              id
              title
              handle
              tags
              # ✅ 新增：判断是否为预购商品
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
              }
              variants(first: 5) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
` as const;
