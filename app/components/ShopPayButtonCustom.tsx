import {ShopPayIcon} from './ShopPayIcon';
import {buildShopPayUrlMultiple} from '~/lib/utils';

interface ShopPayButtonCustomProps {
  variantId: string;
  quantity?: number;
  storeDomain: string;
  className?: string;
}

export function ShopPayButtonCustom({
  variantId,
  quantity = 1,
  storeDomain,
  className = '',
}: ShopPayButtonCustomProps) {
  const handleClick = () => {
    const url = buildShopPayUrlMultiple({
      storeDomain,
      lines: [{variantId, quantity}],
    });
    window.location.href = url;
  };

  return (
    <button
      type="button"
      className={`h-12 px-4 bg-[#5a31f4] text-white rounded-sm flex items-center justify-center gap-2 hover:bg-[#4a28d4] transition-colors ${className}`}
      onClick={handleClick}
    >
      <ShopPayIcon className="w-5 h-5" />
      <span className="text-sm font-medium">Shop Pay</span>
    </button>
  );
}
