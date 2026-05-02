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
query HomepageProducts(
  $first: Int
  $country: CountryCode
  $language: LanguageCode
) @inContext(country: $country, language: $language) {
  collection(handle: "homepage-products") {
    id
    title
    products(first: $first, sortKey: MANUAL) {
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
            image { url altText width height }
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            selectedOptions { name value }
            product { handle title }
          }
        }
      }
    }
  }
}
` as const;

export const BRAND_CONCEPT_QUERY = `#graphql
  query BrandConcept @apiVersion: 2024-10 {
    metaobjectByHandle(handle: "brand-concept", type: "section_brand_concept") {
      subtitle: field(key: "subtitle") { value }
      titleLine1: field(key: "title_line1") { value }
      titleLine2: field(key: "title_line2") { value }
      description: field(key: "description") { value }
      feature1Title: field(key: "feature_1_title") { value }
      feature1Desc: field(key: "feature_1_desc") { value }
      feature2Title: field(key: "feature_2_title") { value }
      feature2Desc: field(key: "feature_2_desc") { value }
      feature3Title: field(key: "feature_3_title") { value }
      feature3Desc: field(key: "feature_3_desc") { value }
      image: field(key: "image") {
        ... on MediaImage {
          image {
            url
            altText
          }
        }
      }
    }
  }
` as const;
