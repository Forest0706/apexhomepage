import {useRef} from 'react';
import clsx from 'clsx';
import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, useFetcher, Link} from '@remix-run/react';
import {getSeoMeta, getPaginationVariables} from '@shopify/hydrogen';

import {routeHeaders} from '~/data/cache';
import {
  COLLECTIONS_QUERY,
  COLLECTION_PRODUCTS_QUERY,
  ALL_PRODUCTS_QUERY,
} from '~/graphql/HomepageQueries';

export const headers = routeHeaders;

export async function loader({
  request,
  context: {storefront},
}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const after = url.searchParams.get('after') || '';
  const before = url.searchParams.get('before') || '';
  const sort = url.searchParams.get('sort') || 'new';
  const category = url.searchParams.get('category') || '';

  const sortKey: Record<string, string> = {
    new: 'CREATED',
    price_sort: 'PRICE',
    price_unsort: 'PRICE',
    popular: 'BEST_SELLING',
  };

  const productSortKey: Record<string, string> = {
    new: 'CREATED_AT',
    price_sort: 'PRICE',
    price_unsort: 'PRICE',
    popular: 'BEST_SELLING',
  };

  const reverse: Record<string, boolean> = {
    new: true,
    price_sort: false,
    price_unsort: true,
    popular: true,
  };

  const paginationVariables = getPaginationVariables(request, {pageBy: 12});

  let collectionsData;
  let productsData;

  try {
    collectionsData = await storefront.query(COLLECTIONS_QUERY, {
      variables: {
        first: 20,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    });
  } catch (error) {
    collectionsData = {nodes: []};
  }

  try {
    if (category) {
      const collectionProductsData = await storefront.query(
        COLLECTION_PRODUCTS_QUERY,
        {
          variables: {
            collectionHandle: category,
            first: 12,
            after: after || undefined,
            sortKey: sortKey[sort] || 'CREATED',
            reverse: reverse[sort] ?? true,
            country: storefront.i18n.country,
            language: storefront.i18n.language,
          },
        },
      );

      productsData = {
        nodes: collectionProductsData.collection?.products?.nodes || [],
        pageInfo: collectionProductsData.collection?.products?.pageInfo || {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: '',
          endCursor: '',
        },
      };
    } else {
      const allProductsData = await storefront.query(ALL_PRODUCTS_QUERY, {
        variables: {
          ...paginationVariables,
          after: after || undefined,
          before: before || undefined,
          sortKey: productSortKey[sort] || 'CREATED_AT',
          reverse: reverse[sort] ?? true,
          country: storefront.i18n.country,
          language: storefront.i18n.language,
        },
      });
      productsData = {
        nodes: allProductsData.products?.nodes || [],
        pageInfo: allProductsData.products?.pageInfo || {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: '',
          endCursor: '',
        },
      };
    }
  } catch (error) {
    productsData = {
      nodes: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: '',
        endCursor: '',
      },
    };
  }

  const collectionList =
    collectionsData?.collections?.nodes || collectionsData?.nodes || [];
  const productList = productsData?.nodes || [];
  const productPageInfo = productsData?.pageInfo || {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: '',
    endCursor: '',
  };

  return defer({
    collections: collectionList,
    products: productList,
    pageInfo: productPageInfo,
    currentAfter: after,
    currentBefore: before,
    currentSort: sort,
    currentCategory: category,
    seo: {
      title: '作品一覧 | APEX TOYS',
      description: '高品質なフィギュアコレクション',
    },
  });
}

export const meta = ({data}: {data: any}) => {
  return getSeoMeta(data.seo);
};

function getProductImage(product: any): string {
  if (product.featuredImage?.url) {
    return product.featuredImage.url;
  }
  if (product.variants?.nodes?.[0]?.image?.url) {
    return product.variants.nodes[0].image.url;
  }
  return '';
}

function getProductTitle(product: any): string {
  return product.title;
}

function getProductSubtitle(product: any): string {
  if (product.subTitle) {
    return product.subTitle;
  }
  return product.vendor || '';
}

function getProductPrice(product: any): string {
  if (product.priceRange?.minVariantPrice?.amount) {
    const price = parseFloat(product.priceRange.minVariantPrice.amount);
    return `¥${price.toLocaleString()}`;
  }
  if (product.variants?.nodes?.[0]?.price?.amount) {
    const price = parseFloat(product.variants.nodes[0].price.amount);
    return `¥${price.toLocaleString()}`;
  }
  return '価格未設定';
}

function getProductTag(product: any): string | null {
  const isPreorder = product.requiresSellingPlan === true;
  const isNew = product.tags?.includes('isNew');

  if (isPreorder) return '予約';
  if (isNew) return '新着';
  return null;
}

function Pagination({
  pageInfo,
  currentAfter,
  currentBefore,
  currentSort,
  currentCategory,
}: {
  pageInfo: any;
  currentAfter: string;
  currentBefore: string;
  currentSort: string;
  currentCategory: string;
}) {
  const fetcher = useFetcher();
  const hasNextPage = pageInfo?.hasNextPage;
  const hasPreviousPage = pageInfo?.hasPreviousPage;
  const endCursor = pageInfo?.endCursor;
  const startCursor = pageInfo?.startCursor;

  const buildParams = (afterParam?: string, beforeParam?: string) => {
    const params = new URLSearchParams();
    if (currentCategory) params.set('category', currentCategory);
    if (currentSort) params.set('sort', currentSort);
    if (afterParam) params.set('after', afterParam);
    if (beforeParam) params.set('before', beforeParam);
    return `/products?${params.toString()}`;
  };

  const handlePageClick = (after: string, before: string) => {
    fetcher.load(buildParams(after, before));
  };

  const isOnPage1 = !currentAfter && !currentBefore;

  return (
    <div className="mt-16 flex items-center justify-center gap-2">
      <button
        onClick={() => handlePageClick('', startCursor)}
        disabled={!hasPreviousPage}
        className={`w-10 h-10 flex items-center justify-center border border-[#e7e5e4] text-[#a8a29e] hover:border-[#78716c] hover:text-[#292524] transition-all rounded-sm ${
          !hasPreviousPage ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={() => handlePageClick('', '')}
        className={`px-4 py-2 border border-[#e7e5e4] text-xs tracking-wider rounded-sm transition-all ${
          isOnPage1
            ? 'bg-[#292524] text-white border-[#292524]'
            : 'text-[#a8a29e] hover:border-[#78716c] hover:text-[#292524]'
        }`}
      >
        1
      </button>

      {hasPreviousPage && (
        <>
          <span className="text-[#a8a29e] px-2">...</span>
          <button
            onClick={() => handlePageClick('', startCursor)}
            className="px-4 py-2 border border-[#e7e5e4] text-[#a8a29e] text-xs hover:border-[#78716c] hover:text-[#292524] rounded-sm transition-all"
          >
            前へ
          </button>
        </>
      )}

      <button
        onClick={() => handlePageClick(endCursor, '')}
        disabled={!hasNextPage}
        className={`px-4 py-2 border border-[#e7e5e4] text-xs tracking-wider rounded-sm transition-all ${
          hasNextPage
            ? 'text-[#a8a29e] hover:border-[#78716c] hover:text-[#292524]'
            : 'pointer-events-none opacity-50'
        }`}
      >
        次へ
      </button>

      <button
        onClick={() => handlePageClick(endCursor, '')}
        disabled={!hasNextPage}
        className={`w-10 h-10 flex items-center justify-center border border-[#e7e5e4] text-[#a8a29e] hover:border-[#78716c] hover:text-[#292524] transition-all rounded-sm ${
          !hasNextPage ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}

export default function AllProducts() {
  const initialData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof loader>();

  const data = fetcher.data || initialData;
  const {
    collections,
    products,
    pageInfo,
    currentAfter,
    currentBefore,
    currentSort,
    currentCategory,
  } = data;
  const observerRefs = useRef<(HTMLElement | null)[]>([]);
  const isFirstPage = !currentAfter && !currentBefore;

  const collectionList = collections?.nodes || collections || [];
  const categories = [
    {handle: '', title: 'すべて'},
    ...collectionList.map((c: any) => ({handle: c.handle, title: c.title})),
  ];

  const sortOptions = [
    {value: 'new', label: '新作順'},
    {value: 'price_sort', label: '作品が安い順'},
    {value: 'price_unsort', label: '価格が高い順'},
    {value: 'popular', label: '人気順'},
  ];

  const buildParams = (after: string, before: string) => {
    const params = new URLSearchParams();
    if (currentCategory) params.set('category', currentCategory);
    params.set('sort', currentSort || 'new');
    if (after) params.set('after', after);
    if (before) params.set('before', before);
    return `?${params.toString()}`;
  };

  const handleCategoryClick = (handle: string) => {
    const params = new URLSearchParams();
    if (handle) params.set('category', handle);
    params.set('sort', currentSort || 'new');
    fetcher.load(`/products?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams();
    if (currentCategory) params.set('category', currentCategory);
    params.set('sort', value);
    fetcher.load(`/products?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* DEBUG: Show category filter status */}
      {currentCategory && (
        <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-sm">
          🔍 Debug: 当前分类 = <strong>{currentCategory}</strong> | 产品数量 ={' '}
          {products.length}
        </div>
      )}
      <section className="pt-32 pb-16 bg-[#f5f5f4] border-b border-[#e7e5e4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[#78716c] tracking-[0.3em] text-sm uppercase mb-3">
                Collection
              </p>
              <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#292524]">
                作品一覧
              </h1>
            </div>
            <p className="text-[#a8a29e] text-sm">
              全{' '}
              <span className="text-[#292524] font-medium">
                {products.length}
              </span>{' '}
              点の商品
            </p>
          </div>
        </div>
      </section>

      <section className="sticky top-20 z-30 bg-white/90 backdrop-blur-md border-b border-[#e7e5e4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
              {categories.map((category) => (
                <button
                  key={category.handle}
                  onClick={() => handleCategoryClick(category.handle)}
                  className={`filter-btn px-4 py-2 border border-[#e7e5e4] text-xs tracking-wider uppercase rounded-sm whitespace-nowrap transition-all ${
                    currentCategory === category.handle
                      ? 'active bg-[#292524] text-white border-[#292524]'
                      : 'text-[#a8a29e] hover:border-[#78716c] hover:text-[#292524]'
                  }`}
                >
                  {category.title}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="sort-select px-4 py-2 bg-white border border-[#e7e5e4] text-[#292524] text-xs tracking-wider rounded-sm focus:outline-none focus:border-[#78716c] cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-[#fafaf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any, index: number) => {
              const imageUrl = getProductImage(product);
              return (
                <Link
                  key={product.id}
                  to={`/products/${product.handle}`}
                  className="card-hover group cursor-pointer block"
                  ref={(el) => (observerRefs.current[index] = el)}
                >
                  <div className="relative overflow-hidden bg-[#f0eeeb] aspect-[3/4] mb-5 rounded-sm">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="card-img transition-transform duration-700 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="card-img transition-transform duration-700 w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                        <div className="text-center p-6">
                          <div className="w-20 h-20 mx-auto mb-3 border-2 border-[#a8a29e]/20 rounded-full flex items-center justify-center bg-white/50">
                            <span className="text-3xl">🎁</span>
                          </div>
                          <p className="text-[#a8a29e] text-xs">商品画像</p>
                        </div>
                      </div>
                    )}
                    {getProductTag(product) && (
                      <span
                        className={clsx(
                          'absolute top-4 left-4 text-white text-xs font-bold tracking-wider uppercase px-3 py-1',
                          product.requiresSellingPlan === true
                            ? 'bg-[#d97706]'
                            : 'bg-[#dc2626]',
                        )}
                      >
                        {getProductTag(product)}
                      </span>
                    )}
                    <div className="card-overlay absolute inset-0 bg-white/70 opacity-0 transition-opacity duration-500 flex items-center justify-center backdrop-blur-sm">
                      <span className="px-6 py-2 border border-[#78716c] text-[#78716c] text-xs tracking-widest uppercase">
                        詳細を見る
                      </span>
                    </div>
                  </div>
                  <p className="text-[#a8a29e] text-[11px] tracking-wider uppercase mb-1.5">
                    {getProductSubtitle(product)}
                  </p>
                  <h3 className="text-[#292524] text-base font-medium mb-1.5 group-hover:text-[#78716c] transition-colors">
                    {getProductTitle(product)}
                  </h3>
                  <p className="text-[#78716c] font-serif text-lg">
                    {getProductPrice(product)}
                  </p>
                </Link>
              );
            })}
          </div>

          {pageInfo && (
            <Pagination
              pageInfo={pageInfo}
              currentAfter={currentAfter}
              currentBefore={currentBefore}
              currentSort={currentSort}
              currentCategory={currentCategory}
            />
          )}
        </div>
      </section>
    </div>
  );
}
