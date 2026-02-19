import {useState} from 'react';
import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {getSeoMeta} from '@shopify/hydrogen';
import invariant from 'tiny-invariant';
import clsx from 'clsx';

import {routeHeaders} from '~/data/cache';
import {LOCAL_PRODUCTS} from '~/data/localProducts';
import {Text, Heading} from '~/components/Text';
import {Button} from '~/components/Button';

export const headers = routeHeaders;

export async function loader(args: LoaderFunctionArgs) {
  const {productHandle} = args.params;
  invariant(productHandle, 'Missing productHandle param');

  const product = LOCAL_PRODUCTS.find((p) => p.handle === productHandle);

  if (!product) {
    throw new Response('Product not found', {status: 404});
  }

  return defer({
    product,
    seo: {
      title: `${product.title} | APEX TOYS`,
      description: product.description,
    },
  });
}

export const meta = ({data}: {data: any}) => {
  return getSeoMeta(data.seo);
};

export default function Product() {
  const {product} = useLoaderData<typeof loader>();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const formatMoney = (amount: string, currency: string) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency,
    }).format(parseFloat(amount));
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* メインビジュアル & ギャラリー (縦スクロール) */}
      <div className="w-full max-w-7xl mx-auto px-0 md:px-6 lg:px-8 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* 左側: 画像ギャラリー (スクロール追従なし、メインコンテンツ) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {product.images.map((image, index) => (
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

          {/* 右側: 商品情報 (スクロール追従) */}
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

              {/* スペック表 (コンパクト) */}
              <div className="py-4 border-t border-white/10">
                <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">SPECIFICATIONS</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs">
                  <div>
                    <div className="text-gray-500 mb-1">Scale</div>
                    <div>{product.specs.scale || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Height</div>
                    <div>{product.specs.height || 'N/A'}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-gray-500 mb-1">Release Date</div>
                    <div>{product.specs.releaseDate || 'TBD'}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* フローティング購入バー (スマホ・PC共通) */}
      <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-md border-t border-white/10 z-50 py-4 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden md:flex flex-col">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Total Price</span>
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
              <Button
                variant="primary"
                className="flex-1 md:flex-none px-8 py-3 bg-accent hover:bg-white hover:text-black text-white font-bold tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(var(--color-accent),0.5)]"
                onClick={() => alert('カートに追加しました (デモ)')}
              >
                カートに入れる
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
