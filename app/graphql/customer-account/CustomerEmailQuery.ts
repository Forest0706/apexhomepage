export const CUSTOMER_EMAIL_QUERY = `#graphql
  query CustomerEmail {
    customer {
      emailAddress {
        emailAddress
      }
    }
  }
` as const;
