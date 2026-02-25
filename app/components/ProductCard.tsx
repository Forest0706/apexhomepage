import clsx from 'clsx';

import {Text} from '~/components/Text';
import {Link} from '~/components/Link';

type LocalProduct = {
  id: string;
  title: string;
  handle: string;
  publishedAt?: string;
  vendor?: string;
  price?: {
    amount: string;
    currencyCode: string;
  };
  images?: string[];
  isNew?: boolean;
  isPreorder?: boolean;
  variants?: {
    nodes: Array<{
      id: string;
      image?: {url: string; altText?: string | null} | null;
      price: {amount: string; currencyCode: string};
    }>;
  };
};

function getProductImage(product: LocalProduct): string | undefined {
  if (product.images?.length) return product.images[0];
  return product.variants?.nodes?.[0]?.image?.url;
}

function getProductPrice(product: LocalProduct) {
  if (product.price) return product.price;
  const variant = product.variants?.nodes?.[0];
  if (variant) return variant.price;
  return {amount: '0', currencyCode: 'JPY'};
}

export function ProductCard({
  product,
  label,
  className,
  loading,
  onClick,
  quickAdd,
}: {
  product: LocalProduct;
  label?: string;
  className?: string;
  loading?: HTMLImageElement['loading'];
  onClick?: () => void;
  quickAdd?: boolean;
}) {
  const image = getProductImage(product);
  const price = getProductPrice(product);

  const formatMoney = (amount: string, currency: string) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency,
    }).format(parseFloat(amount));
  };

  return (
    <div className="flex flex-col gap-2">
      <Link
        onClick={onClick}
        to={`/products/${product.handle}`}
        prefetch="viewport"
      >
        <div className={clsx('grid gap-4', className)}>
          <div className="card-image aspect-[4/5] bg-gray-100 relative group overflow-hidden rounded-lg">
            {image && (
              <img
                src={image}
                alt={product.title}
                className="object-cover w-full h-full fadeIn transition-transform duration-500 group-hover:scale-105"
                loading={loading}
              />
            )}
            {label && (
              <Text
                as="label"
                size="fine"
                className="absolute top-0 right-0 m-4 text-right text-white font-bold bg-accent/90 px-2 py-1 backdrop-blur-sm rounded"
              >
                {label}
              </Text>
            )}
          </div>
          <div className="grid gap-1">
            <Text
              className="w-full overflow-hidden whitespace-nowrap text-ellipsis font-bold text-gray-900"
              as="h3"
            >
              {product.title}
            </Text>
            <div className="flex gap-4">
              <Text className="flex gap-4 text-gray-500">
                {formatMoney(price.amount, price.currencyCode)}
              </Text>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
