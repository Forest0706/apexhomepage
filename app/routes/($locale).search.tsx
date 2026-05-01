import {
  defer,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {Form, useLoaderData} from '@remix-run/react';
import {getPaginationVariables, getSeoMeta} from '@shopify/hydrogen';

import {seoPayload} from '~/lib/seo.server';

export async function loader({
  request,
  context: {storefront},
}: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const searchTerm = searchParams.get('q')!;
  const variables = getPaginationVariables(request, {pageBy: 8});

  const {products} = await storefront.query(SEARCH_QUERY, {
    variables: {
      searchTerm,
      ...variables,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });

  const seo = seoPayload.collection({
    url: request.url,
    collection: {
      id: 'search',
      title: 'Search',
      handle: 'search',
      descriptionHtml: '検索結果',
      description: '検索結果',
      seo: {
        title: searchTerm ? `「${searchTerm}」の検索結果` : '商品検索',
        description: `検索結果: ${products.nodes.length}件`,
      },
      metafields: [],
      products,
      updatedAt: new Date().toISOString(),
    },
  });

  return defer({
    seo,
    searchTerm,
    products,
  });
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  return getSeoMeta(...matches.map((match) => (match.data as any).seo));
};

export default function Search() {
  const {searchTerm, products, noResultRecommendations} =
    useLoaderData<typeof loader>();
  const noResults = products?.nodes?.length === 0;
  const totalCount = products?.nodes?.length || 0;

  const getProductImage = (product: any) => {
    if (product.featuredImage?.url) return product.featuredImage.url;
    if (product.variants?.nodes?.[0]?.image?.url)
      return product.variants.nodes[0].image.url;
    return '';
  };

  const getProductPrice = (product: any) => {
    if (product.priceRange?.minVariantPrice?.amount) {
      return `¥${parseFloat(
        product.priceRange.minVariantPrice.amount,
      ).toLocaleString()}`;
    }
    return '価格未設定';
  };

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <section className="pt-32 pb-16 bg-[#f5f5f4] border-b border-[#e7e5e4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-[#78716c] tracking-[0.3em] text-sm uppercase mb-3">
                Search
              </p>
              <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#292524]">
                {searchTerm ? `「${searchTerm}」の検索結果` : '商品検索'}
              </h1>
            </div>
            {searchTerm && (
              <p className="text-[#a8a29e] text-sm">
                全{' '}
                <span className="text-[#292524] font-medium">{totalCount}</span>{' '}
                件
              </p>
            )}
          </div>

          <Form method="get" className="max-w-xl">
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={searchTerm}
                placeholder="商品を検索..."
                className="w-full h-12 pl-12 pr-4 bg-white border border-[#e7e5e4] text-[#292524] text-sm rounded-sm focus:outline-none focus:border-[#78716c]"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a8a29e]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 bg-[#292524] text-white text-xs tracking-wider uppercase rounded-sm hover:bg-[#78716c] transition-colors"
              >
                検索
              </button>
            </div>
          </Form>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-[#fafaf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!searchTerm ? (
            <div className="text-center py-20">
              <p className="text-[#a8a29e] text-lg">
                キーワードを入力して商品を検索してください
              </p>
            </div>
          ) : noResults ? (
            <div className="text-center py-20">
              <p className="text-[#a8a29e] text-lg mb-2">
                「{searchTerm}」に該当する商品が見つかりませんでした
              </p>
              <p className="text-[#78716c] text-sm">
                別のキーワード��検索してみてください
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.nodes.map((product: any, index: number) => {
                  const imageUrl = getProductImage(product);
                  return (
                    <a
                      key={product.id}
                      href={`/products/${product.handle}`}
                      className="card-hover group cursor-pointer block"
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
                        <div className="card-overlay absolute inset-0 bg-white/70 opacity-0 transition-opacity duration-500 flex items-center justify-center backdrop-blur-sm">
                          <span className="px-6 py-2 border border-[#78716c] text-[#78716c] text-xs tracking-widest uppercase">
                            詳細を見る
                          </span>
                        </div>
                      </div>
                      <p className="text-[#a8a29e] text-[11px] tracking-wider uppercase mb-1.5">
                        {product.vendor || ''}
                      </p>
                      <h3 className="text-[#292524] text-base font-medium mb-1.5 group-hover:text-[#78716c] transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-[#78716c] font-serif text-lg">
                        {getProductPrice(product)}
                      </p>
                    </a>
                  );
                })}
              </div>

              <div className="mt-16 flex items-center justify-center gap-2">
                <span className="text-[#a8a29e] text-sm">
                  すべての商品が表示されています
                </span>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function NoResults({
  noResults,
  recommendations,
}: {
  noResults: boolean;
  recommendations: Promise<null | FeaturedData>;
}) {
  return (
    <>
      {noResults && (
        <Section padding="x">
          <Text className="opacity-50">
            No results, try a different search.
          </Text>
        </Section>
      )}
      <Suspense>
        <Await
          errorElement="There was a problem loading related products"
          resolve={recommendations}
        >
          {(result) => {
            if (!result) return null;
            const {featuredCollections, featuredProducts} = result;

            return (
              <>
                <FeaturedCollections
                  title="Trending Collections"
                  collections={featuredCollections}
                />
                <ProductSwimlane
                  title="Trending Products"
                  products={featuredProducts}
                />
              </>
            );
          }}
        </Await>
      </Suspense>
    </>
  );
}

const SEARCH_QUERY = `#graphql
  query PaginatedProductsSearch(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $searchTerm: String
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    products(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor,
      sortKey: RELEVANCE,
      query: $searchTerm
    ) {
      nodes {
        id
        title
        handle
        vendor
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 1) {
          nodes {
            id
            image {
              url
              altText
            }
          }
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
` as const;
