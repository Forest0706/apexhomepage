import {useFetcher} from '@remix-run/react';
import {useState, useEffect, useCallback} from 'react';
import {localWishlist} from '~/utils/localWishlist';

interface WishlistButtonProps {
  productId: string;
  productHandle: string;
  isWishlisted?: boolean;
  isLoggedIn?: boolean;
  className?: string;
  formClassName?: string;
}

export function WishlistButton({
  productId,
  productHandle,
  isWishlisted: initialWishlisted = false,
  isLoggedIn = false,
  className,
  formClassName,
}: WishlistButtonProps) {
  const fetcher = useFetcher();
  const [localWishlisted, setLocalWishlisted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn) {
      setLocalWishlisted(localWishlist.get().includes(productId));
    }
  }, [productId, isLoggedIn]);

  const isSubmitting = fetcher.state !== 'idle';

  const wishlisted = isLoggedIn
    ? fetcher.formData?.get('action') === 'add'
      ? true
      : fetcher.formData?.get('action') === 'remove'
      ? false
      : initialWishlisted
    : localWishlisted;

  const handleClick = useCallback(() => {
    if (isLoggedIn) {
      return;
    }

    if (wishlisted) {
      localWishlist.remove(productId);
      setLocalWishlisted(false);
    } else {
      localWishlist.add(productId);
      setLocalWishlisted(true);
    }
  }, [isLoggedIn, wishlisted, productId]);

  if (!isLoggedIn) {
    return (
      <button
        type="button"
        disabled={isSubmitting}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={handleClick}
        className={`w-12 h-12 flex items-center justify-center border border-apex-border text-gray-400 hover:text-red-500 hover:border-red-400 transition-all duration-300 rounded-sm hover:bg-red-50 ${
          wishlisted ? 'text-red-500 border-red-400' : ''
        } ${className || ''}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={wishlisted ? 'currentColor' : 'none'}
          className={`w-6 h-6 transition-transform duration-300 ${
            wishlisted ? 'scale-110' : 'hover:scale-110'
          }`}
        >
          <path
            d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }

  return (
    <fetcher.Form
      method="post"
      action="/api/wishlist"
      className={formClassName}
    >
      <input type="hidden" name="productId" value={productId} />
      <input
        type="hidden"
        name="action"
        value={wishlisted ? 'remove' : 'add'}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        className={`w-12 h-12 flex items-center justify-center border border-apex-border text-gray-400 hover:text-red-500 hover:border-red-400 transition-all duration-300 rounded-sm hover:bg-red-50 ${
          wishlisted ? 'text-red-500 border-red-400' : ''
        } ${className || ''}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={wishlisted ? 'currentColor' : 'none'}
          className={`w-6 h-6 transition-transform duration-300 ${
            wishlisted ? 'scale-110' : 'hover:scale-110'
          }`}
        >
          <path
            d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </fetcher.Form>
  );
}
