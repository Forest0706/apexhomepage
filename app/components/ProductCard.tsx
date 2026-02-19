import clsx from 'clsx';

import {Text} from '~/components/Text';
import {Link} from '~/components/Link';

// Local product type definition
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
};

export function ProductCard({
  product,
  label,
  className,
  loading,
  onClick,
}: {
  product: LocalProduct;
  label?: string;
  className?: string;
  loading?: HTMLImageElement['loading'];
  onClick?: () => void;
}) {
  const {images, price} = product;
  const image = images?.[0];

  // Simple formatting helper
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
          <div className="card-image aspect-[4/5] bg-primary/5 relative group overflow-hidden">
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
              {product.title}
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