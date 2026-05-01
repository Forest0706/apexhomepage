import {useFetcher} from '@remix-run/react';

interface WishlistButtonProps {
  productId: string;
  productHandle: string;
  isWishlisted?: boolean;
}

export function WishlistButton({
  productId,
  productHandle,
  isWishlisted: initialWishlisted = false,
}: WishlistButtonProps) {
  const fetcher = useFetcher();

  const isSubmitting = fetcher.state !== 'idle';
  const optimisticWishlisted =
    fetcher.formData?.get('action') === 'add'
      ? true
      : fetcher.formData?.get('action') === 'remove'
        ? false
        : initialWishlisted;

  return (
    <fetcher.Form method="post" action="/api/wishlist">
      <input type="hidden" name="productId" value={productId} />
      <input
        type="hidden"
        name="action"
        value={optimisticWishlisted ? 'remove' : 'add'}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        aria-label={optimisticWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        className="w-12 h-12 border border-apex-border flex items-center justify-center text-apex-muted hover:border-apex-red hover:text-apex-red transition-colors rounded-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill={optimisticWishlisted ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-5 h-5 ${
            optimisticWishlisted ? 'text-red-500' : ''
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5l-5.457.9c-1.653.27-3.003 1.557-3.003 3.15v.8l-.002.006a.75.75 0 00.002.013l.006-.006H4.5l.75.75-.75-.75h-1.5l-.006.038a.75.75 0 00.012.039l.038-.006h1.694l.75-.75H3.75l-.006.013a.75.75 0 00.013.012l.013-.013H4.5l.75.75-.75-.75h-.75a2.25 2.25 0 00-2.25 2.25v.8c0 .98.63 1.838 1.557 1.993l5.457.9c2.59 0 4.688-2.015 4.688-4.5v-.8c0-.98-.63-1.838-1.557-1.993l-5.457-.9C6.63 8.867 6 8.02 6 7.04v-.8c0-.245.015-.485.044-.718l.037.01z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12.75 7.56v.888c0 .245.015.485.044.718l-.037-.01v-.01l.006.006a2.25 2.25 0 01-.65 1.556l-.013.163-.163.013a2.25 2.25 0 01-1.556.65l-.163.013V12.75l-.75-.75a2.25 2.25 0 01-.65-1.556l-.013-.163a2.25 2.25 0 01.65-1.556l.163-.013.888-.037h-3.58l.75.75-.75-.75h4.33a2.25 2.25 0 011.556-.65l.163-.013a2.25 2.25 0 011.556.65l.013.163.013-.163a2.25 2.25 0 00.65-1.556V6.31l-.003-.007a.75.75 0 00-.012-.038l-.025.006z"
          />
        </svg>
      </button>
    </fetcher.Form>
  );
}