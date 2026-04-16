import {useState} from 'react';
import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {getSeoMeta} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';


import {routeHeaders} from '~/data/cache';
import {PRODUCT_QUERY} from '~/graphql/ProductQueries';
import {Button} from '~/components/Button';
import {AddToCartButton} from '~/components/AddToCartButton';

export const headers = routeHeaders;

type ShopifyProduct = {
  releaseDate: {
    value: string;
    type: string;
  };
  scale: {
    value: string;
    type: string;
  };
  height: {
    value: string;
    type: string;
  };
  id: string;
  title: string;
  handle: string;
  vendor?: string;
  description: string;
  descriptionHtml?: string;
  tags?: string[];
  availableForSale?: boolean;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  featuredImage?: {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  };
  images?: {
    nodes: Array<{
      url: string;
      altText?: string;
    }>;
  };
  variants?: {
    nodes: Array<{
      id: string;
      title: string;
      availableForSale?: boolean;
      price: {
        amount: string;
        currencyCode: string;
      };
    }>;
  };
};

function adaptShopifyProduct(product: ShopifyProduct) {
  const images =
    product.images?.nodes?.map((img) => img.url) ||
    (product.featuredImage?.url ? [product.featuredImage.url] : []);

  const variants =
    product.variants?.nodes?.map((v) => ({
      id: v.id,
      title: v.title,
      availableForSale: v.availableForSale,
      price: v.price,
    })) || [];

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    vendor: product.vendor || 'APEX TOYS',
    description: product.description || '',
    subTitle: '',
    price: product.priceRange?.minVariantPrice || {
      amount: '0',
      currencyCode: 'JPY',
    },
    images,
    specs: {
      scale: product.scale?.value,
      height: product.height?.value,
      releaseDate: product.releaseDate?.value,
    },
    tags: product.tags || [],
    variants,
  };
}

export async function loader({
  params,
  context: {storefront},
}: LoaderFunctionArgs) {
  const {productHandle} = params;
  invariant(productHandle, 'Missing productHandle param');

  try {
    const {product} = await storefront.query(PRODUCT_QUERY, {
      variables: {
        handle: productHandle,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    });

    const adaptedProduct = adaptShopifyProduct(product);

    return defer({
      product: adaptedProduct,
      isLocal: false,
      variants: product.variants?.nodes || [],
      seo: {
        title: `${product.title} | APEX TOYS`,
        description: product.description,
      },
    });
  } catch (error) {
    console.error('Product loader error:', error);
  }
}

export const meta = ({data}: {data: any}) => {
  return getSeoMeta(data.seo);
};

export default function Product() {
  const {product, isLocal, variants} = useLoaderData<typeof loader>();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // 兼容本地和 Shopify 数据格式
  const productImages = product.images || [];
  const formatMoney = (amount: string | number, currency: string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency,
    }).format(numAmount);
  };

  // 获取第一个可用的 variant
  const firstAvailableVariant = variants.find(
    (v: {availableForSale?: boolean}) => v.availableForSale,
  );

  return (
    <div className="bg-black text-white min-h-screen relative">
      {/* Fixed Background (Always visible) */}
      <div
        className="fixed inset-0 w-full h-full z-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: 'url("/curtain-bg.svg")',
          backgroundColor: '#000',
        }}
      />

      {/* Opening Curtain (Black overlay that lifts up) */}
      <div className="fixed top-0 left-0 w-full h-full bg-black z-50 curtain-lift pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-0 md:px-6 lg:px-8 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* 左側: 画像ギャラリー */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {productImages.map((image: string, index: number) => (
              <div
                key={index}
                className="w-full bg-[#0a0a0a] rounded-sm overflow-hidden group relative"
              >
                <img
                  src={image}
                  alt={`${product.title} ${index + 1}`}
                  className="w-full h-auto object-contain transition-transform duration-700 hover:scale-[1.02]"
                  loading={index < 2 ? 'eager' : 'lazy'}
                />
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-3 py-1 text-xs font-mono text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  IMG_0{index + 1}
                </div>
              </div>
            ))}
          </div>

          {/* 右側: 商品情報 */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-24 space-y-8 p-6 bg-[#0a0a0a]/50 backdrop-blur-sm border border-white/5 rounded-lg">
              <div className="space-y-2 border-l-2 border-accent pl-4">
                <h2 className="text-accent font-mono text-xs tracking-[0.3em] uppercase">
                  {product.vendor}
                </h2>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight uppercase tracking-wide">
                  {product.title}
                </h1>
                {product.subTitle && (
                  <p className="text-sm text-gray-400 italic">
                    {product.subTitle}
                  </p>
                )}
              </div>

              <div className="prose prose-invert prose-sm text-gray-300 leading-relaxed">
                <p>{product.description}</p>
              </div>

              {/* スペック表 */}
              <div className="py-4 border-t border-white/10">
                <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">
                  SPECIFICATIONS
                </h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
                  <div>
                    <div className="text-gray-500 mb-1">Scale</div>
                    <div>{product.specs?.scale || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Height</div>
                    <div>{product.specs?.height || 'N/A'}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-gray-500 mb-1">Release Date</div>
                    <div>{product.specs?.releaseDate || 'TBD'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* フローティング購入バー */}
      <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-md border-t border-white/10 z-50 py-4 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden md:flex flex-col">
            <span className="text-xs text-gray-400 uppercase tracking-wider">
              Total Price
            </span>
            <span className="text-xl font-bold font-mono">
              {formatMoney(product.price.amount, product.price.currencyCode)}
            </span>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="md:hidden flex flex-col mr-auto">
              <span className="text-lg font-bold font-mono">
                {formatMoney(product.price.amount, product.price.currencyCode)}
              </span>
            </div>
            {isLocal ? (
              <Button
                variant="primary"
                className="flex-1 md:flex-none px-8 py-3 bg-accent hover:bg-white hover:text-black text-white font-bold tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(var(--color-accent),0.5)]"
                onClick={() => alert('カートに追加しました (デモ)')}
              >
                カートに入れる
              </Button>
            ) : (
              <AddToCartButton
                lines={[
                  {merchandiseId: firstAvailableVariant?.id, quantity: 1},
                ]}
                variant="primary"
                className="flex-1 md:flex-none px-8 py-3 bg-accent hover:bg-white hover:text-black text-white font-bold tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(var(--color-accent),0.5)]"
              >
                カートに入れる
              </AddToCartButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
