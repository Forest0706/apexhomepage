import {
  useParams,
  Form,
  Await,
  useRouteLoaderData,
  useLocation,
} from '@remix-run/react';
import useWindowScroll from 'react-use/esm/useWindowScroll';
import {Disclosure} from '@headlessui/react';
import {Suspense, useEffect, useMemo} from 'react';
import {CartForm} from '@shopify/hydrogen';

import {type LayoutQuery} from 'storefrontapi.generated';
import {Text, Heading, Section} from '~/components/Text';
import {Link} from '~/components/Link';
import {Cart} from '~/components/Cart';
import {CartLoading} from '~/components/CartLoading';
import {Input} from '~/components/Input';
import {Drawer, useDrawer} from '~/components/Drawer';
import {CountrySelector} from '~/components/CountrySelector';
import {
  IconMenu,
  IconCaret,
  IconLogin,
  IconAccount,
  IconBag,
  IconSearch,
} from '~/components/Icon';
import {
  type EnhancedMenu,
  type ChildEnhancedMenuItem,
  useIsHomePath,
} from '~/lib/utils';
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
  const isProductsPage =
    location.pathname === '/products' || location.pathname === '/products/';

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className="">
          <a href="#mainContent" className="sr-only">
            Skip to content
          </a>
        </div>
        {headerMenu && layout?.shop.name && !isProductsPage && (
          <Header title={layout.shop.name} menu={headerMenu} />
        )}
        <main role="main" id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      {!isProductsPage && <Footer />}
    </>
  );
}

function Logo({isHome}: {isHome: boolean}) {
  return (
    <div className="flex items-center gap-2 font-bold font-serif text-2xl tracking-widest uppercase leading-none">
      <img
        src="/Apex Innovation White.png"
        alt="APEX TOYS"
        className="h-8 w-auto object-contain"
      />
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

  // toggle cart drawer when adding to cart
  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);

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
  // useHeaderStyleFix(containerStyle, setContainerStyle, isHome);

  const params = useParams();

  return (
    <header
      role="banner"
      className={`${
        isHome
          ? 'bg-contrast/80 text-primary shadow-darkHeader'
          : 'bg-contrast/80 text-primary'
      } flex lg:hidden items-center h-nav sticky backdrop-blur-lg z-40 top-0 justify-between w-full leading-none gap-4 px-4 md:px-8`}
    >
      <div className="flex items-center justify-start w-full gap-4">
        <button
          onClick={openMenu}
          className="relative flex items-center justify-center w-8 h-8"
        >
          <IconMenu />
        </button>
        <Form
          method="get"
          action={params.locale ? `/${params.locale}/search` : '/search'}
          className="items-center gap-2 sm:flex"
        >
          <button
            type="submit"
            className="relative flex items-center justify-center w-8 h-8"
          >
            <IconSearch />
          </button>
          <Input
            className="focus:border-primary/20"
            type="search"
            variant="minisearch"
            placeholder="検索"
            name="q"
          />
        </Form>
      </div>

      <Link
        className="flex items-center self-stretch leading-[3rem] md:leading-[4rem] justify-center flex-grow w-full h-full"
        to="/"
        prefetch="intent"
      >
        <Logo isHome={isHome} />
      </Link>

      <div className="flex items-center justify-end w-full gap-4">
        <AccountLink className="relative flex items-center justify-center w-8 h-8" />
        <CartCount isHome={isHome} openCart={openCart} />
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
  const {y} = useWindowScroll();
  return (
    <header
      role="banner"
      className={`${
        isHome
          ? 'bg-contrast/80 text-primary shadow-darkHeader'
          : 'bg-contrast/80 text-primary'
      } ${
        !isHome && y > 50 && ' shadow-lightHeader'
      } hidden h-nav lg:flex items-center sticky transition duration-300 backdrop-blur-lg z-40 top-0 justify-between w-full leading-none gap-8 px-12 py-8`}
    >
      <div className="flex gap-12 items-center">
        <Link to="/" prefetch="intent">
          <Logo isHome={isHome} />
        </Link>
        <nav className="flex gap-8 items-center">
          <Link
            to="/"
            prefetch="intent"
            className="pb-1 hover:text-primary/70 transition-colors"
          >
            ホーム
          </Link>
          <Link
            to="/collections/all"
            prefetch="intent"
            className="pb-1 hover:text-primary/70 transition-colors"
          >
            商品一覧
          </Link>
          <Link
            to="/about"
            prefetch="intent"
            className="pb-1 hover:text-primary/70 transition-colors"
          >
            APEXについて
          </Link>

        </nav>
      </div>
      <div className="flex items-center gap-1">
        <Form
          method="get"
          action={params.locale ? `/${params.locale}/search` : '/search'}
          className="flex items-center gap-2"
        >
          <Input
            className="focus:border-primary/20"
            type="search"
            variant="minisearch"
            placeholder="検索"
            name="q"
          />
          <button
            type="submit"
            className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
          >
            <IconSearch />
          </button>
        </Form>
        <AccountLink className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5" />
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
    </header>
  );
}

function AccountLink({className}: {className?: string}) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  const isLoggedIn = rootData?.isLoggedIn;

  return (
    <Link to="/account" className={className}>
      <Suspense fallback={<IconLogin />}>
        <Await resolve={isLoggedIn} errorElement={<IconLogin />}>
          {(isLoggedIn) => (isLoggedIn ? <IconAccount /> : <IconLogin />)}
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
        <IconBag />
        <div
          className={`${
            dark
              ? 'text-primary bg-contrast dark:text-contrast dark:bg-primary'
              : 'text-contrast bg-primary'
          } absolute bottom-1 right-1 text-[0.625rem] font-medium subpixel-antialiased h-3 min-w-[0.75rem] flex items-center justify-center leading-none text-center rounded-full w-auto px-[0.125rem] pb-px`}
        >
          <span>{count || 0}</span>
        </div>
      </>
    ),
    [count, dark],
  );

  return isHydrated ? (
    <button
      onClick={openCart}
      className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
    >
      {BadgeCounter}
    </button>
  ) : (
    <Link
      to="/cart"
      className="relative flex items-center justify-center w-8 h-8 focus:ring-primary/5"
    >
      {BadgeCounter}
    </Link>
  );
}

function Footer() {
  const isHome = useIsHomePath();
  const currentYear = new Date().getFullYear();

  return (
    <Section
      divider={isHome ? 'none' : 'top'}
      as="footer"
      role="contentinfo"
      className={`w-full py-12 px-6 md:px-8 lg:px-12 bg-black text-white border-t border-white/10`}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="inline-block mb-6" prefetch="intent">
            <Logo isHome={isHome} />
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed max-w-md">
            APEX TOYSは、ハイクオリティなフィギュアとコレクターズアイテムを提供する専門ブランドです。
            情熱と技術を注ぎ込み、キャラクターの魅力を最大限に引き出した製品をお届けします。
          </p>
        </div>

        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
            ナビゲーション
          </h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <Link to="/" className="hover:text-white transition-colors">
                ホーム
              </Link>
            </li>
            <li>
              <Link
                to="/collections/all"
                className="hover:text-white transition-colors"
              >
                商品一覧
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-white transition-colors">
                APEXについて
              </Link>
            </li>

          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
            インフォメーション
          </h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <Link
                to="/policies/privacy-policy"
                className="hover:text-white transition-colors"
              >
                プライバシーポリシー
              </Link>
            </li>
            <li>
              <Link
                to="/policies/terms-of-service"
                className="hover:text-white transition-colors"
              >
                利用規約
              </Link>
            </li>
            <li>
              <Link
                to="/policies/shipping-policy"
                className="hover:text-white transition-colors"
              >
                配送ポリシー
              </Link>
            </li>
            <li>
              <Link
                to="/policies/refund-policy"
                className="hover:text-white transition-colors"
              >
                返金ポリシー
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
        <p>&copy; {currentYear} APEX TOYS. All rights reserved.</p>
        <div className="flex gap-4">
          <Link
            to="/policies/legal-notice"
            className="hover:text-white transition-colors"
          >
            特定商取引法に基づく表記
          </Link>
        </div>
      </div>
    </Section>
  );
}

