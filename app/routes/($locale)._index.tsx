import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {getSeoMeta} from '@shopify/hydrogen';
import {routeHeaders} from '~/data/cache';
import {LOCAL_PRODUCTS} from '~/data/localProducts';
import {HOMEPAGE_PRODUCTS_QUERY} from '~/graphql/HomepageQueries';
import {ProductCard} from '~/components/ProductCard';
import {Link} from '~/components/Link';

export const headers = routeHeaders;

export async function loader({context: {storefront}}: LoaderFunctionArgs) {
  const productsResult = await storefront
    .query(HOMEPAGE_PRODUCTS_QUERY, {
      variables: {
        first: 8,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    })
    .catch((err) => {
      console.error('Products query failed:', err);
      return {products: {nodes: LOCAL_PRODUCTS}};
    });

  return defer({
    products: productsResult.products?.nodes || LOCAL_PRODUCTS,
    seo: {
      title: 'APEX TOYS | 高級フィギュア専門店',
      description: '限定特典グッズと高品質フィギュアのコレクション',
    },
  });
}

export const meta = ({data}: {data: any}) => {
  return getSeoMeta(data.seo);
};

function getProductLabel(product: any): string | undefined {
  const tags = product.tags || [];
  if (tags.includes('isNew')) return '新作';
  if (tags.includes('isPreorder')) return '予約受付中';
  return undefined;
}
// 测试下
export default function Homepage() {
  const {products} = useLoaderData<typeof loader>();

  return (
    <div className="bg-black text-white min-h-screen font-sans">
      {/* ヒーローセクション */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center z-0 opacity-60"
          style={{
            backgroundImage: 'url("/hero-arctech.jpg")',
            filter: 'brightness(0.7) contrast(1.2)',
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10" />

        <div className="relative z-20 container mx-auto px-6 md:px-12 flex flex-col items-start justify-center h-full">
          <div className="space-y-6 w-full">
            <h2 className="text-accent tracking-[0.5em] text-sm md:text-base font-mono uppercase animate-pulse">
              システム起動 // Ver. 2.0
            </h2>

            <div className="w-full">
              <h1
                className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase glitch-text leading-none"
                data-text="APEX TOYS"
                style={{fontFamily: '"Orbitron", sans-serif'}}
              >
                APEX TOYS
              </h1>
            </div>

            <p className="max-w-xl text-gray-300 text-lg md:text-xl leading-relaxed mt-6 border-l-2 border-accent pl-6">
              限定特典グッズと高品質フィギュアの世界へ
              <br />
              あなただけのコレクションを始めよう
            </p>
          </div>

          <div className="mt-12">
            <Link
              to="/products"
              className="group relative px-8 py-4 bg-transparent overflow-hidden border border-white/20 text-white font-mono tracking-widest hover:border-accent transition-colors duration-300"
            >
              <span className="relative z-10 group-hover:text-black transition-colors duration-300">
                商品一覧を見る
              </span>
              <div className="absolute inset-0 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-0" />
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white to-transparent" />
        </div>
      </section>

      {/* 商品ギャラリー */}
      <section className="py-24 px-6 md:px-12 bg-black relative">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wider flex items-center gap-4">
              <span className="w-8 h-1 bg-accent block" />
              新作アイテム
            </h2>
            <Link
              to="/products"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              すべて見る →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                className="group"
                label={getProductLabel(product)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ブランドコンセプト (本地内容) */}
      <section className="py-32 relative bg-[#0a0a0a] overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#1a1a1a] to-transparent opacity-50 skew-x-12" />

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h3 className="text-accent font-mono text-sm tracking-widest">
                コンセプト
              </h3>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                あなたのコレクションに
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600">
                  特別な価値を
                </span>
              </h2>
              <p className="text-gray-400 leading-relaxed text-lg">
                APEX
                TOYSは、限定特典グッズと高品質フィギュアを提供する専門店です。
                コレクターの皆様に満足していただけるよう、厳選された商品のみを取り扱っています。
                数量限定のレアアイテムから、注目の新作まで、特別な一品をお探しください。
              </p>
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
                <div>
                  <div className="text-3xl font-bold text-white mb-2">限定</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    数量限定商品
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-2">
                    高品質
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    厳選された品質
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-2">特典</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    限定特典付き
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] bg-gray-900 rounded-lg overflow-hidden border border-white/10">
                <img
                  src="/特典-星見雅の髪飾り/1.jpg"
                  alt="星見雅の髪飾り"
                  className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black to-transparent">
                  <p className="font-mono text-xs text-accent">
                    限定商品 // 高品質保証
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
