import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, useRouteLoaderData} from '@remix-run/react';
import {getSeoMeta} from '@shopify/hydrogen';

import {LOCAL_PRODUCTS} from '~/data/localProducts';
import {HOMEPAGE_PRODUCTS_QUERY} from '~/graphql/HomepageQueries';
import {ProductCard} from '~/components/ProductCard';
import {Link} from '~/components/Link';
import {translations} from '~/data/translations';
import {NewsletterForm} from '~/components/NewsletterForm';

const HOMEPAGE_FEATURED_COLLECTION_QUERY = `#graphql
  query HomepageFeaturedCollection(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    shop {
      metafield(namespace: "homepage", key: "featured_collection") {
        reference {
          ... on Collection {
            id
            title
            handle
            # ✅ 系列封面图
            image {
              url
              altText
              width
              height
            }
            character: metafield(namespace: "series", key: "character") {
              value
            }
            scale: metafield(namespace: "series", key: "scale") {
              value
            }
            material: metafield(namespace: "series", key: "material") {
              value
            }
            description
          }
        }
      }
    }
  }
`;

export async function loader({context: {storefront, env}}: LoaderFunctionArgs) {
  const t = translations.ja;
  const collectionResult = await storefront
    .query(HOMEPAGE_PRODUCTS_QUERY, {
      variables: {
        first: 6,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    })
    .catch((err) => {
      return {products: {nodes: LOCAL_PRODUCTS}};
    });
  const featuredData = await storefront
    .query(HOMEPAGE_FEATURED_COLLECTION_QUERY, {
      variables: {
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    })
    .catch(() => {
      return {shop: {metafield: null}};
    });

  const collectionRef = featuredData?.shop?.metafield?.reference;
  const seriesMeta = {
    character: collectionRef?.character?.value || '',
    scale: collectionRef?.scale?.value || '',
    material: collectionRef?.material?.value || '',
  };

  return defer({
    products:
      collectionResult.shop?.metafield?.references?.edges || LOCAL_PRODUCTS,
    collectionRef,
    seriesMeta,
    t,
    seo: {
      title: 'APEX TOYS | 高級フィギュア専門店',
      description: '限定特典グッズと高品質フィギュアのコレクション',
    },
    earnPointsEnabled: env.PUBLIC_BLOY_EARN_POINTS_ENABLED !== 'false',
  });
}

export const meta = ({data}: {data: any}) => {
  return getSeoMeta(data.seo);
};

export default function Homepage() {
  const {
    products,
    collectionRef = {},
    seriesMeta = {},
    t,
    earnPointsEnabled = true,
  } = useLoaderData<typeof loader>();
  const {character = '', scale = '', material = ''} = seriesMeta;

  return (
    <div className="bg-[#fafaf9] text-[#292524]">
      {/* Hero Banner */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        <div className="absolute inset-0 hero-bg" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2378716c%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="slide-up" style={{animationDelay: '0.2s'}}>
            <p className="text-[#78716c] tracking-[0.3em] text-sm uppercase mb-6 font-medium">
              {t.hero.subtitle}
            </p>
          </div>
          <div className="slide-up" style={{animationDelay: '0.4s'}}>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif font-bold mb-8 leading-tight">
              {t.hero.title}
              <br />
              <span className="apex-gradient">{t.hero.titleHighlight}</span>
            </h1>
          </div>
          <div className="slide-up" style={{animationDelay: '0.6s'}}>
            <p className="text-[#a8a29e] text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              {t.hero.description}
            </p>
          </div>
          <div className="slide-up" style={{animationDelay: '0.8s'}}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/products"
                className="group relative px-10 py-4 bg-[rgb(var(--apex-text))] text-white font-medium tracking-wider uppercase text-sm overflow-hidden transition-all hover:bg-[#78716c]"
              >
                <span className="relative z-10">{t.hero.ctaProducts}</span>
              </Link>
              <Link
                to="/#about"
                className="px-10 py-4 border border-[#e7e5e4] font-medium tracking-wider uppercase text-sm hover:border-[#78716c] hover:text-[#78716c] transition-all"
              >
                {t.hero.ctaAbout}
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-[#9ca3af]/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Featured Products */}
      <section id="products" className="py-24 sm:py-32 bg-[#f5f5f4] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-[#78716c] tracking-[0.3em] text-sm uppercase mb-4">
              {t.products.sectionTitle}
            </p>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-6">
              {t.products.sectionTitle}
            </h2>
            <div className="w-16 h-[1px] bg-[#78716c]/30 mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {products.slice(0, 6).map((product: any, index: number) => (
              <ProductCard
                key={product.node?.id}
                product={product.node}
                className="card-hover group"
              />
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 text-[#78716c] hover:text-[rgb(var(--apex-accent-warm))] transition-colors tracking-widest uppercase text-sm group"
            >
              <span>{t.products.viewAll}</span>
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Series Banner */}
      <section
        id="series"
        className="py-24 sm:py-32 bg-[#fafaf9] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#9ca3af]/3 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-[#78716c] tracking-[0.3em] text-sm uppercase mb-4">
                {t.series.sectionTitle}
              </p>
              <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8">
                {collectionRef.title}
              </h2>
              <p className="text-[#a8a29e] text-lg leading-relaxed mb-10 font-light">
                {collectionRef.description}
              </p>
              <div className="grid grid-cols-3 gap-8 mb-10">
                <div className="text-center">
                  <p className="text-3xl font-serif font-bold">{character}</p>
                  <p className="text-[#a8a29e] text-xs tracking-wider uppercase">
                    {t.series.stats.characters}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-serif font-bold">{scale}</p>
                  <p className="text-[#a8a29e] text-xs tracking-wider uppercase">
                    {t.series.stats.scale}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-serif font-bold">{material}</p>
                  <p className="text-[#a8a29e] text-xs tracking-wider uppercase">
                    {t.series.stats.material}
                  </p>
                </div>
              </div>
              <Link
                to={
                  collectionRef?.handle
                    ? `/products?category=${collectionRef.handle}`
                    : '/products'
                }
                className="inline-flex items-center space-x-2 border border-[#78716c] text-[#78716c] px-8 py-4 hover:bg-[#78716c] hover:text-white transition-all tracking-widest uppercase text-sm"
              >
                <span>{t.series.cta}</span>
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
                  />
                </svg>
              </Link>
            </div>
            <div className="relative">
              {collectionRef.image ? (
                <img
                  src={collectionRef.image.url}
                  alt={collectionRef.image.altText || collectionRef.title}
                  width={collectionRef.image.width}
                  height={collectionRef.image.height}
                  className="w-full h-full object-cover rounded-sm"
                />
              ) : (
                <div className="aspect-[4/5] bg-gradient-to-br from-stone-200 via-stone-300 to-stone-400 rounded-sm flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%2378716c%22%20fill-opacity%3D%220.05%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M0%2040L40%200H20L0%2020M40%2040V20L20%2040%22/%3E%3C/g%3E%3C/svg%3E')]" />
                  <div className="text-center z-10">
                    <div className="w-32 h-32 mx-auto mb-6 border-2 border-[#9ca3af]/15 rounded-full flex items-center justify-center bg-white/40">
                      <span className="text-6xl">🐰</span>
                    </div>
                    <p className="text-[#a8a29e]">Series Key Visual</p>
                  </div>
                </div>
              )}
              <div className="absolute -bottom-6 -right-6 w-48 h-48 border border-[#9ca3af]/15 rounded-sm hidden lg:block" />
              <div className="absolute -top-6 -left-6 w-32 h-32 border border-[#9ca3af]/10 rounded-sm hidden lg:block" />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 sm:py-32 bg-[#f5f5f4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-[#78716c] tracking-[0.3em] text-sm uppercase mb-4">
              {t.about.sectionTitle}
            </p>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-6">
              {t.about.title}
            </h2>
            <div className="w-16 h-[1px] bg-[#78716c]/30 mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center p-8 border border-[#e7e5e4] hover:border-[#78716c]/30 transition-colors group bg-white rounded-sm">
              <div className="w-16 h-16 mx-auto mb-6 border border-[#9ca3af]/20 rounded-full flex items-center justify-center group-hover:bg-[#9ca3af]/5 transition-colors">
                <svg
                  className="w-7 h-7 text-[#78716c]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-4">
                {t.about.features.gameLove.title}
              </h3>
              <p className="text-[#a8a29e] leading-relaxed font-light">
                {t.about.features.gameLove.description}
              </p>
            </div>

            <div className="text-center p-8 border border-[#e7e5e4] hover:border-[#78716c]/30 transition-colors group bg-white rounded-sm">
              <div className="w-16 h-16 mx-auto mb-6 border border-[#9ca3af]/20 rounded-full flex items-center justify-center group-hover:bg-[#9ca3af]/5 transition-colors">
                <svg
                  className="w-7 h-7 text-[#78716c]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-4">
                {t.about.features.craftsmanship.title}
              </h3>
              <p className="text-[#a8a29e] leading-relaxed font-light">
                {t.about.features.craftsmanship.description}
              </p>
            </div>

            <div className="text-center p-8 border border-[#e7e5e4] hover:border-[#78716c]/30 transition-colors group bg-white rounded-sm">
              <div className="w-16 h-16 mx-auto mb-6 border border-[#9ca3af]/20 rounded-full flex items-center justify-center group-hover:bg-[#9ca3af]/5 transition-colors">
                <svg
                  className="w-7 h-7 text-[#78716c]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-4">
                {t.about.features.collectible.title}
              </h3>
              <p className="text-[#a8a29e] leading-relaxed font-light">
                {t.about.features.collectible.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterForm
        title={t.newsletter.title}
        description={t.newsletter.description}
        placeholder={t.newsletter.placeholder}
        buttonText={t.newsletter.button}
      />

      {/* Legal Notice — 日本の特定商取引法に基づく表記 */}
      <LegalNotice />
    </div>
  );
}

function LegalNotice() {
  const rootData = useRouteLoaderData<typeof import('~/root').loader>('root');
  if (!rootData?.layout?.legalNotice) return null;

  return (
    <section className="py-8 border-t border-[#e7e5e4] bg-[#fafaf9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Link
          to="/pages/legal-notice"
          className="text-[#a8a29e] hover:text-[#292524] text-xs tracking-wider transition-colors"
        >
          特定商取引法に基づく表記
        </Link>
      </div>
    </section>
  );
}
