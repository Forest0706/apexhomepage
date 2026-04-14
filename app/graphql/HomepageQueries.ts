import {PRODUCT_CARD_FRAGMENT} from '~/data/fragments';

export const ALL_PRODUCTS_QUERY = `#graphql
  query AllProducts(
    $first: Int
    $after: String
    $country: CountryCode
    $language: LanguageCode
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
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
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
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
