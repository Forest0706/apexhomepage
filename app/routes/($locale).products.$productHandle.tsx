import {useState, useRef, useCallback, useEffect} from 'react';
import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';
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
  const [activeTab, setActiveTab] = useState('detail');
  const [quantity, setQuantity] = useState(1);

  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  const productImages = product.images || [];

  useEffect(() => {
    const preloadCount = 3;
    for (let i = 1; i <= preloadCount; i++) {
      const nextIndex = activeImageIndex + i;
      const prevIndex = activeImageIndex - i;
      if (nextIndex < productImages.length) {
        const img = new Image();
        img.src = productImages[nextIndex];
      }
      if (prevIndex >= 0) {
        const img = new Image();
        img.src = productImages[prevIndex];
      }
    }
  }, [activeImageIndex, productImages]);

  const checkScrollPosition = useCallback(() => {
    const el = thumbnailContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scrollThumbnails = (direction: 'left' | 'right') => {
    const el = thumbnailContainerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScrollPosition, 300);
  };

  const handleDragStart = useCallback((clientX: number) => {
    setDragStart(clientX);
    setIsDragging(true);
  }, []);

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (dragStart === null || !isDragging) return;
      const offset = clientX - dragStart;
      setDragOffset(offset);
    },
    [dragStart, isDragging],
  );

  const handleDragEnd = useCallback(() => {
    if (dragStart === null) return;

    const threshold = 50;
    if (
      dragOffset < -threshold &&
      activeImageIndex < productImages.length - 1
    ) {
      setActiveImageIndex(activeImageIndex + 1);
    } else if (dragOffset > threshold && activeImageIndex > 0) {
      setActiveImageIndex(activeImageIndex - 1);
    }

    setDragStart(null);
    setDragOffset(0);
    setIsDragging(false);
  }, [dragStart, dragOffset, activeImageIndex, productImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && activeImageIndex > 0) {
        setActiveImageIndex(activeImageIndex - 1);
      } else if (
        e.key === 'ArrowRight' &&
        activeImageIndex < productImages.length - 1
      ) {
        setActiveImageIndex(activeImageIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImageIndex, productImages.length]);

  const formatMoney = (amount: string | number, currency: string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency,
    }).format(numAmount);
  };

  const firstAvailableVariant = variants.find(
    (v: {availableForSale?: boolean}) => v.availableForSale,
  );

  const isNew = product.tags?.includes('new');
  const isLimited = product.tags?.includes('limited');

  return (
    <div className="bg-apex-bg text-apex-text min-h-screen">
      {/* Breadcrumb */}
      <div className="pt-28 pb-6 bg-apex-bg border-b border-apex-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-xs text-apex-muted">
            <Link to="/" className="hover:text-apex-text transition-colors">
              ホーム
            </Link>
            <span>/</span>
            <Link
              to="/collections/all"
              className="hover:text-apex-text transition-colors"
            >
              作品一覧
            </Link>
            <span>/</span>
            <span className="text-apex-text">{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Product Main */}
      <section className="py-12 sm:py-16 bg-apex-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left: Images */}
            <div>
              <div
                ref={containerRef}
                className="w-3/4 mx-auto aspect-[2/3] bg-apex-card rounded-sm relative overflow-hidden select-none"
              >
                <div className="w-full h-full flex items-center justify-center">
                  {productImages.length > 0 ? (
                    <img
                      src={productImages[activeImageIndex]}
                      alt={product.title}
                      className="max-w-full max-h-full object-contain pointer-events-none"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-4 border-2 border-apex-accent/20 rounded-full flex items-center justify-center bg-white/50">
                          <span className="text-6xl">🐰</span>
                        </div>
                        <p className="text-apex-muted text-sm">メイン画像</p>
                      </div>
                    </div>
                  )}
                </div>
                {isNew && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-apex-red text-white text-xs font-bold tracking-wider uppercase">
                      NEW
                    </span>
                  </div>
                )}
                {isLimited && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-apex-accent-dark text-white text-xs tracking-wider uppercase">
                      限定
                    </span>
                  </div>
                )}
                {productImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {productImages.map((_: string, index: number) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === activeImageIndex
                            ? 'bg-apex-text w-4'
                            : 'bg-apex-muted/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {productImages.length > 1 && (
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => scrollThumbnails('left')}
                    className={`w-6 h-20 flex items-center justify-center shadow-md hover:bg-white transition-colors flex-shrink-0 ${
                      canScrollLeft ? 'bg-white/80' : 'invisible'
                    }`}
                  >
                    <svg
                      className="w-3 h-3 text-apex-text"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <div
                    ref={thumbnailContainerRef}
                    className="flex-1 overflow-x-scroll"
                    style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
                    onScroll={checkScrollPosition}
                  >
                    <div className="flex gap-3 p-1 w-full items-start">
                      {productImages.map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          onMouseEnter={() => {
                            const img = new Image();
                            img.src = image;
                            setActiveImageIndex(index);
                          }}
                          className={`w-20 h-20 bg-apex-card rounded-sm border-2 overflow-hidden transition-all flex-shrink-0 ${
                            activeImageIndex === index
                              ? 'border-apex-accent-dark opacity-100'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => scrollThumbnails('right')}
                    className={`w-6 h-20 flex items-center justify-center shadow-md hover:bg-white transition-colors flex-shrink-0 ${
                      canScrollRight ? 'bg-white/80' : 'invisible'
                    }`}
                  >
                    <svg
                        className="w-3 h-3 text-apex-text"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="flex flex-col">
              <div className="mb-2">
                <span className="text-apex-muted text-xs tracking-wider uppercase">
                  {product.vendor}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-apex-text mb-4 leading-tight">
                {product.title}
              </h1>
              <p className="text-apex-muted text-sm leading-relaxed mb-8 font-light">
                {product.description ||
                  '人気ゲームキャラクターの高品質フィギュアを制作。'}
              </p>

              <div className="border-t border-b border-apex-border py-6 mb-8">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-serif font-bold text-apex-text">
                    {formatMoney(
                      product.price.amount,
                      product.price.currencyCode,
                    )}
                  </span>
                  <span className="text-apex-muted text-sm">税込</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div className="text-apex-muted">スケール</div>
                  <div className="text-apex-text">
                    {product.specs?.scale || '1/7'}
                  </div>
                  <div className="text-apex-muted">全高</div>
                  <div className="text-apex-text">
                    {product.specs?.height || '約260mm'}
                  </div>
                  <div className="text-apex-muted">素材</div>
                  <div className="text-apex-text">PVC・ABS</div>
                  <div className="text-apex-muted">発売時期</div>
                  <div className="text-apex-text">
                    {product.specs?.releaseDate || '2025年12月予定'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center border border-apex-border rounded-sm w-fit">
                  <button
                    className="w-12 h-12 flex items-center justify-center text-apex-muted hover:text-apex-text transition-colors"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    −
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="w-12 h-12 text-center text-apex-text text-sm border-x border-apex-border focus:outline-none"
                  />
                  <button
                    className="w-12 h-12 flex items-center justify-center text-apex-muted hover:text-apex-text transition-colors"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
                {isLocal ? (
                  <Button
                    variant="primary"
                    className="flex-auto h-12 bg-apex-text text-white font-medium tracking-wider uppercase text-sm hover:bg-apex-accent-dark transition-colors rounded-sm"
                    onClick={() => alert('カートに追加しました (デモ)')}
                  >
                    カートに追加
                  </Button>
                ) : (
                  <AddToCartButton
                    lines={[
                      {merchandiseId: firstAvailableVariant?.id, quantity},
                    ]}
                    variant="primary"
                    className="flex-auto h-12 bg-apex-text text-white font-medium tracking-wider uppercase text-sm hover:bg-apex-accent-dark transition-colors rounded-sm"
                  >
                    カートに追加
                  </AddToCartButton>
                )}
                <button className="w-12 h-12 border border-apex-border flex items-center justify-center text-apex-muted hover:border-apex-red hover:text-apex-red transition-colors rounded-sm">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              <div className="bg-apex-section border border-apex-border rounded-sm p-5">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-apex-accent-dark mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <div>
                    <p className="text-apex-text text-sm font-medium mb-1">
                      予約商品について
                    </p>
                    <p className="text-apex-muted text-xs leading-relaxed">
                      本商品は予約受付中です。発売時期は予告なく変更となる場合がございます。複数商品を同時にご注文の場合、発売日が最も遅い商品に合わせての発送となります。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-12 bg-apex-bg border-t border-apex-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex border-b border-apex-border mb-8 overflow-x-auto">
            <button
              className={`tab-btn px-6 py-3 text-sm tracking-wider uppercase whitespace-nowrap transition-colors ${
                activeTab === 'detail'
                  ? 'border-b-2 border-apex-text text-apex-text'
                  : 'text-apex-muted hover:text-apex-text'
              }`}
              onClick={() => setActiveTab('detail')}
            >
              商品詳細
            </button>
            <button
              className={`tab-btn px-6 py-3 text-sm tracking-wider uppercase whitespace-nowrap transition-colors ${
                activeTab === 'spec'
                  ? 'border-b-2 border-apex-text text-apex-text'
                  : 'text-apex-muted hover:text-apex-text'
              }`}
              onClick={() => setActiveTab('spec')}
            >
              仕様
            </button>
            <button
              className={`tab-btn px-6 py-3 text-sm tracking-wider uppercase whitespace-nowrap transition-colors ${
                activeTab === 'shipping'
                  ? 'border-b-2 border-apex-text text-apex-text'
                  : 'text-apex-muted hover:text-apex-text'
              }`}
              onClick={() => setActiveTab('shipping')}
            >
              配送・返品
            </button>
          </div>

          {activeTab === 'detail' && (
            <div className="tab-content max-w-3xl">
              <h3 className="text-xl font-medium text-apex-text mb-4">
                商品紹介
              </h3>
              <p className="text-apex-muted leading-relaxed mb-6 font-light">
                {product.vendor}より、{product.title}を1/7スケールで立体化。
                キャラクターの魅力を余すことなく再現した高品質フィギュアです。
              </p>
              <p className="text-apex-muted leading-relaxed mb-6 font-light">
                繊細な色彩表現と丁寧な造形で、指先までこだわった造形となっています。
                收藏価値の高い逸品をどうぞお楽しみください。
              </p>
              <p className="text-apex-muted leading-relaxed font-light">
                塗装は繊細なグラデーションと陰影表現を駆使し、衣装の素材感を見事に表現しています。
              </p>
            </div>
          )}

          {activeTab === 'spec' && (
            <div className="tab-content max-w-3xl">
              <h3 className="text-xl font-medium text-apex-text mb-4">
                商品仕様
              </h3>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-apex-border">
                  <tr className="grid sm:grid-cols-3 py-4">
                    <td className="text-apex-muted sm:col-span-1">作品名</td>
                    <td className="text-apex-text sm:col-span-2">
                      {product.vendor}
                    </td>
                  </tr>
                  <tr className="grid sm:grid-cols-3 py-4">
                    <td className="text-apex-muted sm:col-span-1">
                      キャラクター名
                    </td>
                    <td className="text-apex-text sm:col-span-2">
                      {product.title}
                    </td>
                  </tr>
                  <tr className="grid sm:grid-cols-3 py-4">
                    <td className="text-apex-muted sm:col-span-1">スケール</td>
                    <td className="text-apex-text sm:col-span-2">
                      {product.specs?.scale || '1/7'}
                    </td>
                  </tr>
                  <tr className="grid sm:grid-cols-3 py-4">
                    <td className="text-apex-muted sm:col-span-1">全高</td>
                    <td className="text-apex-text sm:col-span-2">
                      {product.specs?.height || '約260mm（台座含む）'}
                    </td>
                  </tr>
                  <tr className="grid sm:grid-cols-3 py-4">
                    <td className="text-apex-muted sm:col-span-1">素材</td>
                    <td className="text-apex-text sm:col-span-2">PVC・ABS</td>
                  </tr>
                  <tr className="grid sm:grid-cols-3 py-4">
                    <td className="text-apex-muted sm:col-span-1">原型制作</td>
                    <td className="text-apex-text sm:col-span-2">
                      Apex-Toys 原型チーム
                    </td>
                  </tr>
                  <tr className="grid sm:grid-cols-3 py-4">
                    <td className="text-apex-muted sm:col-span-1">彩色</td>
                    <td className="text-apex-text sm:col-span-2">
                      Apex-Toys 彩色チーム
                    </td>
                  </tr>
                  <tr className="grid sm:grid-cols-3 py-4">
                    <td className="text-apex-muted sm:col-span-1">発売元</td>
                    <td className="text-apex-text sm:col-span-2">Apex-Toys</td>
                  </tr>
                  <tr className="grid sm:grid-cols-3 py-4">
                    <td className="text-apex-muted sm:col-span-1">発売時期</td>
                    <td className="text-apex-text sm:col-span-2">
                      {product.specs?.releaseDate || '2025年12月予定'}
                    </td>
                  </tr>
                  <tr className="grid sm:grid-cols-3 py-4">
                    <td className="text-apex-muted sm:col-span-1">価格</td>
                    <td className="text-apex-text sm:col-span-2">
                      {formatMoney(
                        product.price.amount,
                        product.price.currencyCode,
                      )}
                      （税込）
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="tab-content max-w-3xl">
              <h3 className="text-xl font-medium text-apex-text mb-4">
                配送について
              </h3>
              <p className="text-apex-muted leading-relaxed mb-6 font-light">
                ・国内配送は佐川急便またはヤマト運輸にてお届けします。
                <br />
                ・送料は全国一律 ¥1,100（税込み）です。お買い上げ金額 ¥20,000
                以上で送料無料。
                <br />
                ・予約商品の発売後、7営業日以内に発送いたします。
                <br />
                ・海外発送も承っております。詳細はお問い合わせください。
              </p>
              <h3 className="text-xl font-medium text-apex-text mb-4">
                返品・交換について
              </h3>
              <p className="text-apex-muted leading-relaxed font-light">
                ・商品到着後7日以内であれば、未开封・未使用に限り返品・交換を承ります。
                <br />
                ・初期不良がございましたら、到着後14日以内にカスタマーサポートまでご連絡ください。
                <br />
                ・お客様都合による返品の送料はお客様負担となります。
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      <section className="py-16 bg-apex-section border-t border-apex-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-apex-accent-dark tracking-[0.3em] text-sm uppercase mb-2">
                Related
              </p>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-apex-text">
                関連商品
              </h2>
            </div>
            <Link
              to="/collections/all"
              className="text-apex-accent-dark hover:text-apex-accent-warm transition-colors text-sm tracking-wider uppercase flex items-center gap-2"
            >
              <span>すべて見る</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                ></path>
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Link
                key={i}
                to="/products/sample-product"
                className="group cursor-pointer block"
              >
                <div className="relative overflow-hidden bg-apex-card aspect-[3/4] mb-4 rounded-sm">
                  <div className="card-img transition-transform duration-700 w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 mx-auto mb-2 border-2 border-apex-accent/20 rounded-full flex items-center justify-center bg-white/50">
                        <span className="text-2xl">
                          {['🐱', '🌸', '❄️', '⚡'][i - 1]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="card-overlay absolute inset-0 bg-white/70 opacity-0 transition-opacity duration-500 flex items-center justify-center backdrop-blur-sm">
                    <span className="px-5 py-2 border border-apex-accent-dark text-apex-accent-dark text-xs tracking-widest uppercase">
                      詳細
                    </span>
                  </div>
                  {i === 3 && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 bg-apex-accent-dark text-white text-[10px] tracking-wider uppercase">
                        限定
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-apex-muted text-[11px] tracking-wider uppercase mb-1">
                  {['アークナイツ', 'アークナイツ', '原神', '崩壊3rd'][i - 1]}
                </p>
                <h3 className="text-apex-text text-sm font-medium mb-1 group-hover:text-apex-accent-dark transition-colors">
                  {
                    [
                      'シルバーアッシュ',
                      'エイヤフィヤトラ',
                      '甘雨 循々守月',
                      '雷電芽衣 雷の律者',
                    ][i - 1]
                  }
                </h3>
                <p className="text-apex-accent-dark font-serif text-base">
                  ¥{['20,800', '19,800', '21,800', '22,800'][i - 1]}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
