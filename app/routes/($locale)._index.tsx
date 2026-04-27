import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, useNavigate, useRouteLoaderData} from '@remix-run/react';
import {Suspense} from 'react';
import type {ReactElement} from 'react';
import {getSeoMeta} from '@shopify/hydrogen';

import {routeHeaders} from '~/data/cache';
import {LOCAL_PRODUCTS} from '~/data/localProducts';
import {HOMEPAGE_PRODUCTS_QUERY} from '~/graphql/HomepageQueries';
import {ProductCard} from '~/components/ProductCard';
import {Link} from '~/components/Link';
import {Drawer, useDrawer} from '~/components/Drawer';
import {Cart} from '~/components/Cart';
import {CartLoading} from '~/components/CartLoading';
import {translations} from '~/data/translations';
import type {RootLoader} from '~/root';

export const headers = routeHeaders;

export async function loader({context: {storefront}}: LoaderFunctionArgs) {
  const t = translations.ja;

  const productsResult = await storefront
    .query(HOMEPAGE_PRODUCTS_QUERY, {
      variables: {
        first: 6,
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
    t,
    seo: {
      title: 'APEX TOYS | 高級フィギュア専門店',
      description: '限定特典グッズと高品質フィギュアのコレクション',
    },
  });
}

export const meta = ({data}: {data: any}) => {
  return getSeoMeta(data.seo);
};

export default function Homepage() {
  const {products, t} = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const rootData = useRouteLoaderData<RootLoader>('root');
  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();

  const handleNewsletter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(t.newsletter.success);
  };

  return (
    <div className="bg-[#fafaf9] text-[#292524]">
      {/* Cart Drawer */}
      <Drawer
        open={isCartOpen}
        onClose={closeCart}
        heading="カート"
        openFrom="right"
      >
        <div className="grid">
          <Suspense fallback={<CartLoading />}>
            {rootData?.cart && (
              <Cart layout="drawer" onClose={closeCart} cart={rootData.cart} />
            )}
          </Suspense>
        </div>
      </Drawer>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e7e5e4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link
              to="/"
              className="flex items-center space-x-3"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
            >
              <div className="w-10 h-10 border border-[#78716c]/40 rounded-sm flex items-center justify-center bg-[rgb(var(--apex-text))]">
                <span className="text-white font-serif text-lg font-bold tracking-tight">
                  A
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-serif font-bold tracking-widest leading-none">
                  APEX
                </span>
                <span className="text-[10px] tracking-[0.25em] text-[#a8a29e] uppercase leading-none mt-0.5">
                  TOYS
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-10">
              <Link
                to="/"
                className="nav-link text-sm tracking-widest uppercase"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/#home');
                }}
              >
                {t.nav.home}
              </Link>
              {/*<Link*/}
              {/*  to="/products"*/}
              {/*  className="nav-link text-sm tracking-widest uppercase text-[#a8a29e] hover:text-[rgb(var(--apex-text))]"*/}
              {/*>*/}
              {/*  {t.nav.products}*/}
              {/*</Link>*/}
              <Link
                to="/#series"
                className="nav-link text-sm tracking-widest uppercase text-[#a8a29e] hover:text-[rgb(var(--apex-text))]"
              >
                {t.nav.series}
              </Link>
              <Link
                to="/#about"
                className="nav-link text-sm tracking-widest uppercase text-[#a8a29e] hover:text-[rgb(var(--apex-text))]"
              >
                {t.nav.about}
              </Link>
              <Link
                to="/#contact"
                className="nav-link text-sm tracking-widest uppercase text-[#a8a29e] hover:text-[rgb(var(--apex-text))]"
              >
                {t.nav.contact}
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <button className="text-[#a8a29e] hover:text-[#78716c]">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <button
                onClick={openCart}
                className="text-[#a8a29e] hover:text-[#78716c] relative"
              >
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </button>
            </div>

            <button
              id="menuBtn"
              className="md:hidden flex flex-col space-y-1.5 p-2"
              onClick={() => {
                const menu = document.getElementById('mobileMenu');
                const btn = document.getElementById('menuBtn');
                menu?.classList.toggle('active');
                btn?.classList.toggle('menu-open');
                document.body.style.overflow = menu?.classList.contains(
                  'active',
                )
                  ? 'hidden'
                  : '';
              }}
            >
              <span className="hamburger-line w-6 h-[1.5px] bg-[rgb(var(--apex-text))] block" />
              <span className="hamburger-line w-6 h-[1.5px] bg-[rgb(var(--apex-text))] block" />
              <span className="hamburger-line w-6 h-[1.5px] bg-[rgb(var(--apex-text))] block" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        id="mobileMenu"
        className="mobile-menu fixed inset-0 z-40 bg-white pt-24 px-8 md:hidden"
      >
        <div className="flex flex-col space-y-8">
          <Link
            to="/"
            className="text-2xl font-serif"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
              document.getElementById('mobileMenu')?.classList.remove('active');
              document.getElementById('menuBtn')?.classList.remove('menu-open');
            }}
          >
            {t.nav.home}
          </Link>
          {/*<Link*/}
          {/*  to="/products"*/}
          {/*  className="text-2xl font-serif"*/}
          {/*  onClick={() => {*/}
          {/*    document.getElementById('mobileMenu')?.classList.remove('active');*/}
          {/*    document.getElementById('menuBtn')?.classList.remove('menu-open');*/}
          {/*  }}*/}
          {/*>*/}
          {/*  {t.nav.products}*/}
          {/*</Link>*/}
          <Link
            to="/#series"
            className="text-2xl font-serif"
            onClick={() => {
              document.getElementById('mobileMenu')?.classList.remove('active');
              document.getElementById('menuBtn')?.classList.remove('menu-open');
            }}
          >
            {t.nav.series}
          </Link>
          <Link
            to="/#about"
            className="text-2xl font-serif"
            onClick={() => {
              document.getElementById('mobileMenu')?.classList.remove('active');
              document.getElementById('menuBtn')?.classList.remove('menu-open');
            }}
          >
            {t.nav.about}
          </Link>
          <Link
            to="/#contact"
            className="text-2xl font-serif"
            onClick={() => {
              document.getElementById('mobileMenu')?.classList.remove('active');
              document.getElementById('menuBtn')?.classList.remove('menu-open');
            }}
          >
            {t.nav.contact}
          </Link>
        </div>
        <div className="absolute bottom-12 left-8 right-8">
          <div className="border-t border-[#e7e5e4] pt-8 flex items-center justify-between">
            <span className="text-[#a8a29e] text-sm">Apex-Toys © 2025</span>
            <div className="flex space-x-4">
              <button
                onClick={openCart}
                className="text-[#a8a29e] hover:text-[#78716c]"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

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
                key={product.id}
                product={product}
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
                {t.series.title}
              </h2>
              <p className="text-[#a8a29e] text-lg leading-relaxed mb-10 font-light">
                {t.series.description}
              </p>
              <div className="grid grid-cols-3 gap-8 mb-10">
                <div className="text-center">
                  <p className="text-3xl font-serif font-bold">20+</p>
                  <p className="text-[#a8a29e] text-xs tracking-wider uppercase">
                    {t.series.stats.characters}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-serif font-bold">1/7</p>
                  <p className="text-[#a8a29e] text-xs tracking-wider uppercase">
                    {t.series.stats.scale}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-serif font-bold">PVC</p>
                  <p className="text-[#a8a29e] text-xs tracking-wider uppercase">
                    {t.series.stats.material}
                  </p>
                </div>
              </div>
              <Link
                to="/products"
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
              <div className="aspect-[4/5] bg-gradient-to-br from-stone-200 via-stone-300 to-stone-400 rounded-sm flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%2378716c%22%20fill-opacity%3D%220.05%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M0%2040L40%200H20L0%2020M40%2040V20L20%2040%22/%3E%3C/g%3E%3C/svg%3E')]" />
                <div className="text-center z-10">
                  <div className="w-32 h-32 mx-auto mb-6 border-2 border-[#9ca3af]/15 rounded-full flex items-center justify-center bg-white/40">
                    <span className="text-6xl">🐰</span>
                  </div>
                  <p className="text-[#a8a29e]">Series Key Visual</p>
                </div>
              </div>
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
      <section className="py-20 bg-[#fafaf9] border-y border-[#e7e5e4]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-4">
            {t.newsletter.title}
          </h3>
          <p className="text-[#a8a29e] mb-10 font-light">
            {t.newsletter.description}
          </p>
          <form
            className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
            onSubmit={handleNewsletter}
          >
            <input
              type="email"
              placeholder={t.newsletter.placeholder}
              className="flex-1 px-6 py-4 bg-white border border-[#e7e5e4] placeholder-[#a8a29e] focus:outline-none focus:border-[#78716c] transition-colors text-sm rounded-sm"
              required
            />
            <button
              type="submit"
              className="px-8 py-4 bg-[rgb(var(--apex-text))] text-white font-medium tracking-wider uppercase text-sm hover:bg-[#78716c] transition-colors rounded-sm"
            >
              {t.newsletter.button}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#f5f5f4] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <Link
                to="/"
                className="flex items-center space-x-3 mb-6"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                }}
              >
                <div className="w-8 h-8 border border-[#78716c]/40 rounded-sm flex items-center justify-center bg-[rgb(var(--apex-text))]">
                  <span className="text-white font-serif text-sm font-bold">
                    A
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-serif font-bold tracking-widest leading-none">
                    APEX
                  </span>
                  <span className="text-[9px] tracking-[0.2em] text-[#a8a29e] uppercase leading-none mt-0.5">
                    TOYS
                  </span>
                </div>
              </Link>
              <p className="text-[#a8a29e] text-sm leading-relaxed mb-6 font-light">
                {t.footer.about.description}
              </p>
              <div className="flex space-x-4">
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a
                  href="#"
                  className="w-10 h-10 border border-[#e7e5e4] flex items-center justify-center text-[#a8a29e] hover:border-[#78716c] hover:text-[#78716c] transition-all rounded-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 border border-[#e7e5e4] flex items-center justify-center text-[#a8a29e] hover:border-[#78716c] hover:text-[#78716c] transition-all rounded-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 border border-[#e7e5e4] flex items-center justify-center text-[#a8a29e] hover:border-[#78716c] hover:text-[#78716c] transition-all rounded-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-6 tracking-wider uppercase text-sm">
                {t.footer.products}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/products"
                    className="text-[#a8a29e] hover:text-[#78716c] transition-colors text-sm"
                  >
                    {t.footer.productsLinks.all}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="text-[#a8a29e] hover:text-[#78716c] transition-colors text-sm"
                  >
                    {t.footer.productsLinks.new}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="text-[#a8a29e] hover:text-[#78716c] transition-colors text-sm"
                  >
                    {t.footer.productsLinks.limited}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="text-[#a8a29e] hover:text-[#78716c] transition-colors text-sm"
                  >
                    {t.footer.productsLinks.restock}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-6 tracking-wider uppercase text-sm">
                {t.footer.support}
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-[#a8a29e] hover:text-[#78716c] transition-colors text-sm"
                  >
                    {t.footer.supportLinks.guide}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[#a8a29e] hover:text-[#78716c] transition-colors text-sm"
                  >
                    {t.footer.supportLinks.afterservice}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[#a8a29e] hover:text-[#78716c] transition-colors text-sm"
                  >
                    {t.footer.supportLinks.faq}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[#a8a29e] hover:text-[#78716c] transition-colors text-sm"
                  >
                    {t.footer.supportLinks.contact}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-6 tracking-wider uppercase text-sm">
                {t.footer.contact}
              </h4>
              <ul className="space-y-3">
                <li className="text-[#a8a29e] text-sm flex items-start space-x-3">
                  <svg
                    className="w-4 h-4 mt-0.5 text-[#78716c] flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{t.footer.address}</span>
                </li>
                <li className="text-[#a8a29e] text-sm flex items-center space-x-3">
                  <svg
                    className="w-4 h-4 text-[#78716c] flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{t.footer.email}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#e7e5e4] pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-[#a8a29e] text-xs tracking-wider">
              © 2025 {t.footer.copyright}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-[#a8a29e] hover:text-[rgb(var(--apex-text))] text-xs transition-colors"
              >
                {t.footer.social.privacy}
              </a>
              <a
                href="#"
                className="text-[#a8a29e] hover:text-[rgb(var(--apex-text))] text-xs transition-colors"
              >
                {t.footer.social.terms}
              </a>
              <a
                href="#"
                className="text-[#a8a29e] hover:text-[rgb(var(--apex-text))] text-xs transition-colors"
              >
                {t.footer.social.cookie}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
