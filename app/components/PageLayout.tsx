import {
  useParams,
  Await,
  useRouteLoaderData,
  useLocation,
  Link,
} from '@remix-run/react';
import {Suspense, useMemo} from 'react';
import {CartForm} from '@shopify/hydrogen';

import {type LayoutQuery} from 'storefrontapi.generated';
import {Section, Text, Heading} from '~/components/Text';
import {Cart} from '~/components/Cart';
import {CartLoading} from '~/components/CartLoading';
import {Drawer, useDrawer} from '~/components/Drawer';
import {IconLogin, IconAccount} from '~/components/Icon';
import {type EnhancedMenu, useIsHomePath} from '~/lib/utils';
import {useIsHydrated} from '~/hooks/useIsHydrated';
import {useCartFetchers} from '~/hooks/useCartFetchers';
import type {RootLoader} from '~/root';

type LayoutProps = {
  children: React.ReactNode;
  layout?: LayoutQuery & {
    headerMenu?: EnhancedMenu | null;
    footerMenu?: EnhancedMenu | null;
  };
};

export function PageLayout({children, layout}: LayoutProps) {
  const {headerMenu, footerMenu} = layout || {};
  const location = useLocation();
  const hideLayout = false;

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className="">
          <a href="#mainContent" className="sr-only">
            Skip to content
          </a>
        </div>
        {layout?.shop.name && (
          <Header title={layout.shop.name} menu={headerMenu ?? undefined} />
        )}
        <main role="main" id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      {!hideLayout && <Footer shop={layout?.shop} legalNotice={layout?.legalNotice} />}
    </>
  );
}

function Logo({isHome}: {isHome: boolean}) {
  return (
    <div className="flex items-center space-x-3">
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
    </div>
  );
}

function Header({title, menu}: {title: string; menu?: EnhancedMenu}) {
  const isHome = useIsHomePath();

  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();

  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();

  const addToCartFetchers = useCartFetchers(CartForm.ACTIONS.LinesAdd);

  return (
    <>
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      {menu && (
        <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />
      )}
      <DesktopHeader
        isHome={isHome}
        title={title}
        menu={menu}
        openCart={openCart}
      />
      <MobileHeader
        isHome={isHome}
        title={title}
        openCart={openCart}
        openMenu={openMenu}
      />
    </>
  );
}

function CartDrawer({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  if (!rootData) return null;

  return (
    <Drawer open={isOpen} onClose={onClose} heading="カート" openFrom="right">
      <div className="grid">
        <Suspense fallback={<CartLoading />}>
          <Await resolve={rootData?.cart}>
            {(cart) => <Cart layout="drawer" onClose={onClose} cart={cart} />}
          </Await>
        </Suspense>
      </div>
    </Drawer>
  );
}

export function MenuDrawer({
  isOpen,
  onClose,
  menu,
}: {
  isOpen: boolean;
  onClose: () => void;
  menu: EnhancedMenu;
}) {
  return (
    <Drawer open={isOpen} onClose={onClose} openFrom="left" heading="メニュー">
      <div className="grid">
        <MenuMobileNav menu={menu} onClose={onClose} />
      </div>
    </Drawer>
  );
}

function MenuMobileNav({
  menu,
  onClose,
}: {
  menu: EnhancedMenu;
  onClose: () => void;
}) {
  return (
    <nav className="grid gap-4 p-6 sm:gap-6 sm:px-12 sm:py-8">
      {/* Top level menu items */}
      <span className="block">
        <Link to="/" onClick={onClose} className="pb-1">
          <Text as="span" size="copy">
            ホーム
          </Text>
        </Link>
      </span>
      <span className="block">
        <Link to="/collections/all" onClick={onClose} className="pb-1">
          <Text as="span" size="copy">
            商品一覧
          </Text>
        </Link>
      </span>
      <span className="block">
        <Link to="/about" onClick={onClose} className="pb-1">
          <Text as="span" size="copy">
            APEXについて
          </Text>
        </Link>
      </span>
    </nav>
  );
}

function MobileHeader({
  title,
  isHome,
  openCart,
  openMenu,
}: {
  title: string;
  isHome: boolean;
  openCart: () => void;
  openMenu: () => void;
}) {
  const params = useParams();

  return (
    <header
      role="banner"
      className="flex lg:hidden fixed top-0 left-0 right-0 z-50 h-20 bg-white/80 backdrop-blur-md border-b border-[#e7e5e4]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full w-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={openMenu} className="flex flex-col space-y-1.5 p-2">
            <span className="hamburger-line w-6 h-[1.5px] bg-[#292524] block" />
            <span className="hamburger-line w-6 h-[1.5px] bg-[#292524] block" />
            <span className="hamburger-line w-6 h-[1.5px] bg-[#292524] block" />
          </button>
        </div>

        <Link
          className="flex items-center justify-center"
          to="/"
          prefetch="intent"
        >
          <Logo isHome={isHome} />
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/search"
            className="text-[#a8a29e] hover:text-[#78716c] transition-colors"
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </Link>
          <AccountLink className="text-[#a8a29e] hover:text-[#78716c] transition-colors" />
          <CartCount isHome={isHome} openCart={openCart} />
        </div>
      </div>
    </header>
  );
}

function DesktopHeader({
  isHome,
  menu,
  openCart,
  title,
}: {
  isHome: boolean;
  openCart: () => void;
  menu?: EnhancedMenu;
  title: string;
}) {
  const params = useParams();
  return (
    <header
      role="banner"
      className="hidden lg:block fixed top-0 left-0 right-0 z-50 h-20 bg-white/80 backdrop-blur-md border-b border-[#e7e5e4]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full gap-8">
          <Link to="/" prefetch="intent">
            <Logo isHome={isHome} />
          </Link>
          <nav className="flex gap-10 items-center">
            <Link
              to="/"
              prefetch="intent"
              className="nav-link text-sm tracking-widest uppercase text-[#a8a29e] hover:text-[#292524] transition-colors"
            >
              ホーム
            </Link>
            {/*<Link*/}
            {/*  to="/collections/all"*/}
            {/*  prefetch="intent"*/}
            {/*  className="nav-link text-sm tracking-widest uppercase text-[#a8a29e] hover:text-[#292524] transition-colors"*/}
            {/*>*/}
            {/*  作品*/}
            {/*</Link>*/}
            <Link
              to="/#series"
              prefetch="intent"
              className="nav-link text-sm tracking-widest uppercase text-[#a8a29e] hover:text-[#292524] transition-colors"
            >
              シリーズ
            </Link>
            <Link
              to="/#about"
              prefetch="intent"
              className="nav-link text-sm tracking-widest uppercase text-[#a8a29e] hover:text-[#292524] transition-colors"
            >
              会社概要
            </Link>
            <Link
              to="/#contact"
              prefetch="intent"
              className="nav-link text-sm tracking-widest uppercase text-[#a8a29e] hover:text-[#292524] transition-colors"
            >
              お問い合わせ
            </Link>
          </nav>
          <div className="flex items-center gap-6">
            <Link
              to="/search"
              className="text-[#a8a29e] hover:text-[#78716c] transition-colors"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </Link>
            <AccountLink className="text-[#a8a29e] hover:text-[#78716c] transition-colors" />
            <CartCount isHome={isHome} openCart={openCart} />
          </div>
        </div>
      </div>
    </header>
  );
}

function AccountLink({className}: {className?: string}) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  const isLoggedIn = rootData?.isLoggedIn;

  return (
    <Link to="/account" className={`relative ${className || ''}`}>
      <Suspense fallback={<IconLogin />}>
        <Await resolve={isLoggedIn} errorElement={<IconLogin />}>
          {(isLoggedIn) => (isLoggedIn ? <IconAccount /> : <IconLogin />)}
        </Await>
      </Suspense>
      <Suspense fallback={null}>
        <Await resolve={rootData?.bloyCustomer} errorElement={null}>
          {(bloyCustomer) =>
            bloyCustomer?.points > 0 ? (
              <div className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] bg-[#5a31f4] text-white text-[8px] font-bold rounded-full flex items-center justify-center px-1">
                {bloyCustomer.points > 999
                  ? '999+'
                  : bloyCustomer.points}
              </div>
            ) : null
          }
        </Await>
      </Suspense>
    </Link>
  );
}

function CartCount({
  isHome,
  openCart,
}: {
  isHome: boolean;
  openCart: () => void;
}) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  if (!rootData) return null;

  return (
    <Suspense fallback={<Badge count={0} dark={isHome} openCart={openCart} />}>
      <Await resolve={rootData?.cart}>
        {(cart) => (
          <Badge
            dark={isHome}
            openCart={openCart}
            count={cart?.totalQuantity || 0}
          />
        )}
      </Await>
    </Suspense>
  );
}

function Badge({
  openCart,
  dark,
  count,
}: {
  count: number;
  dark: boolean;
  openCart: () => void;
}) {
  const isHydrated = useIsHydrated();

  const BadgeCounter = useMemo(
    () => (
      <>
        <svg
          className="w-5 h-5 text-[#a8a29e]"
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
        {count > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#b91c1c] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </div>
        )}
      </>
    ),
    [count, dark],
  );

  return isHydrated ? (
    <button
      onClick={openCart}
      className="relative flex items-center justify-center w-8 h-8"
    >
      {BadgeCounter}
    </button>
  ) : (
    <Link
      to="/cart"
      className="relative flex items-center justify-center w-8 h-8"
    >
      {BadgeCounter}
    </Link>
  );
}

function Footer({shop, legalNotice}: {shop?: LayoutQuery['shop']; legalNotice?: {handle: string} | null}) {
  const isHome = useIsHomePath();
  const currentYear = new Date().getFullYear();

  const policyLinks = [
    shop?.privacyPolicy && {
      to: `/policies/${shop.privacyPolicy.handle}`,
      label: shop.privacyPolicy.title,
    },
    shop?.termsOfService && {
      to: `/policies/${shop.termsOfService.handle}`,
      label: shop.termsOfService.title,
    },
    shop?.refundPolicy && {
      to: `/policies/${shop.refundPolicy.handle}`,
      label: shop.refundPolicy.title,
    },
    shop?.shippingPolicy && {
      to: `/policies/${shop.shippingPolicy.handle}`,
      label: shop.shippingPolicy.title,
    },
    shop?.subscriptionPolicy && {
      to: `/policies/${shop.subscriptionPolicy.handle}`,
      label: shop.subscriptionPolicy.title,
    },
  ].filter(Boolean) as {to: string; label: string}[];

  return (
    <footer className="bg-[#f5f5f4] pt-16 pb-10 border-t border-[#e7e5e4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <Link
              to="/"
              className="flex items-center space-x-3 mb-6"
              prefetch="intent"
            >
              <div className="w-8 h-8 border border-[#78716c]/40 rounded-sm flex items-center justify-center bg-[#292524]">
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
            <p className="text-[#a8a29e] text-sm leading-relaxed font-light">
              人気ゲームキャラクターの高品質フィギュアを制作。
            </p>
          </div>

          <div>
            <h4 className="text-[#292524] font-medium mb-4 tracking-wider uppercase text-xs">
              シリーズ
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/collections/all"
                  className="text-[#a8a29e] hover:text-[#78716c] transition-colors text-sm"
                >
                  すべての作品
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#a8a29e] hover:text-[#78716c] transition-colors text-sm"
                >
                  新商品予告
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#a8a29e] hover:text-[#78716c] transition-colors text-sm"
                >
                  限定商品
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#292524] font-medium mb-4 tracking-wider uppercase text-xs">
              サポート
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/purchase-guide"
                  className="text-[#a8a29e] hover:text-[#78716c] transition-colors text-sm"
                >
                  購入ガイド
                </Link>
              </li>
              <li>
                <Link
                  to="/after-service"
                  className="text-[#a8a29e] hover:text-[#78716c] transition-colors text-sm"
                >
                  アフターサービス
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-[#a8a29e] hover:text-[#78716c] transition-colors text-sm"
                >
                  よくある質問
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#292524] font-medium mb-4 tracking-wider uppercase text-xs">
              お問い合わせ
            </h4>
            <p className="text-[#a8a29e] text-sm">contact@apex-toys.com</p>
          </div>
        </div>

        <div className="border-t border-[#e7e5e4] pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-[#a8a29e] text-xs tracking-wider">
            &copy; {currentYear} Apex-Toys. All rights reserved.
          </p>
          {policyLinks.length > 0 && (
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 md:mt-0">
              {policyLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-[#a8a29e] hover:text-[#292524] text-xs transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {legalNotice && (
                <Link
                  to="/pages/legal-notice"
                  className="text-[#a8a29e] hover:text-[#292524] text-xs transition-colors"
                >
                  特定商取引法に基づく表記
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
