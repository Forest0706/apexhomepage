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
  quickAdd?: boolean;
}

function getLocalProductData(product: LocalProduct) {
  return {
    image: product.images?.[0],
    title: product.title,
    price: product.price,
    handle: product.handle,
    isNew: product.isNew,
    isPreorder: product.isPreorder,
  };
}

function getShopifyProductData(product: Product) {
  const variant = product.variants?.nodes?.[0];
  const price = product.priceRange?.minVariantPrice || variant?.price;
  const tags = product.tags || [];

  const isPreorder = product.requiresSellingPlan === true;
  const isNew = tags.includes('isNew');

  return {
    image: product.featuredImage?.url || variant?.image?.url,
    title: product.title,
    price: price || {amount: '0', currencyCode: 'JPY'},
    handle: product.handle,
    isNew,
    isPreorder,
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
  const {image, title, price, handle, isNew, isPreorder} = productData;

  const tagLabel = isPreorder ? '予約' : isNew ? '新着' : null;

  return (
    <div className="flex flex-col gap-2">
      <Link onClick={onClick} to={`/products/${handle}`} prefetch="viewport">
        <div className={clsx('grid gap-4', className)}>
          <div className="card-image aspect-[3/4] bg-[rgb(var(--apex-card))] relative group overflow-hidden rounded-sm">
            {image && (
              <img
                src={image}
                alt={title}
                className="object-cover w-full h-full fadeIn transition-transform duration-700 group-hover:scale-108"
                loading={loading}
              />
            )}
            <div className="card-overlay absolute inset-0 bg-white/70 opacity-0 transition-opacity duration-500 flex items-center justify-center backdrop-blur-sm">
              <span className="px-8 py-3 border border-[rgb(var(--apex-accent-dark))] text-[rgb(var(--apex-accent-dark))] text-sm tracking-widest uppercase">
                View Details
              </span>
            </div>
            {(tagLabel || label) && (
              <Text
                as="label"
                size="fine"
                className={clsx(
                  'absolute top-4 left-4 text-white text-xs font-bold tracking-wider uppercase px-3 py-1',
                  isPreorder
                    ? 'bg-[rgb(var(--apex-accent-warm))]'
                    : 'bg-[rgb(var(--apex-red))]',
                )}
              >
                {tagLabel || label}
              </Text>
            )}
          </div>
          <div className="grid gap-1">
            <Text
              className="w-full overflow-hidden whitespace-nowrap text-[rgb(var(--apex-text))] font-medium"
              as="h3"
            >
              {title}
            </Text>
            <Text className="flex gap-4 text-[rgb(var(--apex-accent-dark))] font-serif text-xl">
              {price ? formatMoney(price.amount, price.currencyCode) : '¥0'}
            </Text>
          </div>
        </div>
      </Link>
    </div>
  );
}
