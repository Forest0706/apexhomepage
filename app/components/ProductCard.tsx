import clsx from 'clsx';
import type {Product} from '@shopify/hydrogen/storefront-api-types';

import {Text} from '~/components/Text';
import {Link} from '~/components/Link';

type LocalProduct = {
  id: string;
  title: string;
  handle: string;
  publishedAt: string;
  vendor?: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  images: string[];
  isNew?: boolean;
  isPreorder?: boolean;
  subTitle?: string;
};

type ProductType = LocalProduct | Product;

interface ProductCardProps {
  product: ProductType;
  label?: string;
  className?: string;
  loading?: HTMLImageElement['loading'];
  onClick?: () => void;
}

function getShopifyProductData(product: Product) {
  const variant = product.variants.nodes[0];
  return {
    image: product.featuredImage?.url || variant?.image?.url,
    title: product.title,
    price: product.priceRange.minVariantPrice,
    handle: product.handle,
  };
}

function getLocalProductData(product: LocalProduct) {
  return {
    image: product.images?.[0],
    title: product.title,
    price: product.price,
    handle: product.handle,
  };
}

function formatMoney(amount: string | number, currency: string) {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
  }).format(numAmount);
}

export function ProductCard({
  product,
  label,
  className,
  loading,
  onClick,
}: ProductCardProps) {
  const isShopify = 'priceRange' in product;
  const productData = isShopify
    ? getShopifyProductData(product as Product)
    : getLocalProductData(product as LocalProduct);

  const {image, title, price, handle} = productData;

  return (
    <div className="flex flex-col gap-2">
      <Link onClick={onClick} to={`/products/${handle}`} prefetch="viewport">
        <div className={clsx('grid gap-4', className)}>
          <div className="card-image aspect-[4/5] bg-primary/5 relative group overflow-hidden">
            {image && (
              <img
                src={image}
                alt={title}
                className="object-cover w-full h-full fadeIn transition-transform duration-500 group-hover:scale-105"
                loading={loading}
              />
            )}
            {label && (
              <Text
                as="label"
                size="fine"
                className="absolute top-0 right-0 m-4 text-right text-notice font-bold bg-black/50 px-2 py-1 backdrop-blur-sm"
              >
                {label}
              </Text>
            )}
          </div>
          <div className="grid gap-1">
            <Text
              className="w-full overflow-hidden whitespace-nowrap text-ellipsis font-bold text-white"
              as="h3"
            >
              {title}
            </Text>
            <div className="flex gap-4">
              <Text className="flex gap-4 opacity-80 text-gray-400">
                {formatMoney(price.amount, price.currencyCode)}
              </Text>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
