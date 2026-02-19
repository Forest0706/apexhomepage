# Apex Toys Storefront

This is a Headless Shopify Storefront built with Hydrogen (Remix + React) for Apex Toys.

## Project Structure

- **`app/root.tsx`**: Main entry point and layout wrapper.
- **`app/components/PageLayout.tsx`**: Defines the global Header and Footer.
- **`app/routes/($locale)._index.tsx`**: The Homepage logic and layout.
- **`app/routes/($locale).about.tsx`**: The "About Us" page.
- **`app/styles/app.css`**: Global styles and Tailwind imports.
- **`tailwind.config.js`**: Tailwind configuration (colors, fonts).

## Key Customizations

- **Header**: Updated to "APEX TOYS" with custom navigation.
- **Homepage**: Simplified layout with a large Hero banner and Featured Products.
- **About Page**: Added a dedicated page with company history.

## Development

1.  **Start Server**: `npm run dev`
2.  **Open Browser**: `http://localhost:3000`

## Connecting to Real Shopify Store

Currently, this project uses `mock.shop` for demonstration. To connect your real store:

1.  Rename `.env` to `.env.local` (or edit existing `.env`).
2.  Update the following variables:
    ```env
    PUBLIC_STORE_DOMAIN="your-shop-name.myshopify.com"
    PUBLIC_STOREFRONT_API_TOKEN="your-storefront-api-token"
    ```
3.  Restart the server.

## Deployment

This project is ready to be deployed to Oxygen (Shopify's hosting platform) or Vercel/Netlify.
See `tasks.md` for more details.
