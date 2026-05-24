import {
  Await,
  Form,
  Link,
  Outlet,
  useLoaderData,
  useMatches,
  useOutlet,
} from '@remix-run/react';
import {Suspense} from 'react';
import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {flattenConnection} from '@shopify/hydrogen';

import type {
  CustomerDetailsFragment,
  OrderCardFragment,
} from 'customer-accountapi.generated';
import {BLOY_CONFIG} from '~/lib/bloy.utils';
import {CACHE_NONE, routeHeaders} from '~/data/cache';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {createBloyClient} from '~/lib/bloy.server';

import {doLogout} from './($locale).account_.logout';
import {
  getFeaturedData,
  type FeaturedData,
} from './($locale).featured-products';

export const headers = routeHeaders;

export async function loader({request, context, params}: LoaderFunctionArgs) {
  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_DETAILS_QUERY,
  );

  if (errors?.length || !data?.customer) {
    throw await doLogout(context);
  }

  const customer = data?.customer;
  const email = customer?.emailAddress?.emailAddress;

  let bloyCustomer = null;
  if (email) {
    const bloy = createBloyClient(context.env.BLOY_API_KEY);
    if (bloy) {
      bloyCustomer = await bloy.getCustomerByEmail(email).catch(() => null);
    }
  }

  return defer(
    {
      customer,
      bloyCustomer,
      featuredDataPromise: getFeaturedData(context.storefront),
    },
    {
      headers: {
        'Cache-Control': CACHE_NONE,
      },
    },
  );
}

export default function Authenticated() {
  const data = useLoaderData<typeof loader>();
  const outlet = useOutlet();
  const matches = useMatches();

  const renderOutletInModal = matches.some((match) => {
    const handle = match?.handle as {renderInModal?: boolean};
    return handle?.renderInModal;
  });

  if (outlet) {
    if (renderOutletInModal) {
      return (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center">
            <div className="bg-[#fafaf9] w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <Outlet context={{customer: data.customer}} />
            </div>
          </div>
          <Account {...data} />
        </>
      );
    } else {
      return <Outlet context={{customer: data.customer}} />;
    }
  }

  return <Account {...data} />;
}

interface AccountType {
  customer: CustomerDetailsFragment;
  bloyCustomer: any;
  featuredDataPromise: Promise<FeaturedData>;
}

function Account({customer, bloyCustomer, featuredDataPromise}: AccountType) {
  const orders = flattenConnection(customer.orders);
  const addresses = flattenConnection(customer.addresses);
  const firstName = customer.firstName;
  const points = bloyCustomer?.points;

  return (
    <div className="bg-[#fafaf9] min-h-screen pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[#78716c] tracking-[0.3em] text-sm uppercase mb-3">
            アカウント
          </p>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold">
            {firstName ? `${firstName}さん、ようこそ` : 'マイアカウント'}
          </h1>
        </div>

        <div className="space-y-12">
          {/* Quick Info Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Points Card */}
            <Link
              to="/account/membership"
              className="bg-white border border-[#e7e5e4] p-8 block hover:border-[#78716c] transition-colors group"
            >
              <p className="text-[#78716c] text-xs tracking-wider uppercase mb-2">
                ポイント残高
              </p>
              <div className="flex items-end gap-3">
                <p className="text-5xl font-serif font-bold">
                  {points != null ? points.toLocaleString() : '—'}
                </p>
                <p className="text-[#a8a29e] text-sm pb-2">pt</p>
              </div>
              <p className="text-[#78716c] text-xs mt-3 tracking-wider group-hover:text-[rgb(var(--apex-accent-warm))] transition-colors">
                メンバーシップを見る →
              </p>
            </Link>

            {/* Profile Card */}
            <div className="bg-white border border-[#e7e5e4] p-8">
              <p className="text-[#78716c] text-xs tracking-wider uppercase mb-4">
                プロフィール
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#a8a29e]">お名前</span>
                  <span>
                    {customer.firstName || customer.lastName
                      ? `${customer.firstName || ''} ${customer.lastName || ''}`
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a8a29e]">メール</span>
                  <span className="text-right max-w-[200px] truncate">
                    {customer.emailAddress?.emailAddress || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#a8a29e]">電話番号</span>
                  <span>
                    {customer.phoneNumber?.phoneNumber || '—'}
                  </span>
                </div>
              </div>
              <Link
                to="/account/edit"
                className="text-[#78716c] text-xs mt-4 inline-block tracking-wider hover:text-[rgb(var(--apex-accent-warm))] transition-colors"
              >
                編集する →
              </Link>
            </div>
          </div>

          {/* Order History */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold">注文履歴</h2>
              {orders?.length > 0 && (
                <span className="text-[#a8a29e] text-sm">
                  {orders.length}件
                </span>
              )}
            </div>
            {orders?.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map((order) => (
                  <OrderItem key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#e7e5e4] p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 border border-[#9ca3af]/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#78716c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-[#a8a29e] text-sm mb-4">
                  まだ注文はありません
                </p>
                <Link
                  to="/products"
                  className="inline-block px-6 py-2 bg-[rgb(var(--apex-text))] text-white text-sm tracking-wider uppercase hover:bg-[#78716c] transition-colors"
                >
                  ショッピングを始める
                </Link>
              </div>
            )}
          </section>

          {/* Address Book */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold">住所録</h2>
              <Link
                to="address/add"
                className="text-[#78716c] text-xs tracking-wider hover:text-[rgb(var(--apex-accent-warm))] transition-colors"
              >
                追加する →
              </Link>
            </div>
            {addresses?.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customer.defaultAddress && (
                  <AddressCard
                    address={customer.defaultAddress}
                    isDefault
                  />
                )}
                {addresses
                  .filter((addr: any) => addr.id !== customer.defaultAddress?.id)
                  .map((address: any) => (
                    <AddressCard key={address.id} address={address} />
                  ))}
              </div>
            ) : (
              <div className="bg-white border border-[#e7e5e4] p-8 text-center">
                <p className="text-[#a8a29e] text-sm">
                  登録された住所はありません
                </p>
              </div>
            )}
          </section>

          {/* Logout */}
          <div className="pt-6 border-t border-[#e7e5e4] flex items-center justify-between">
            <Link
              to="/account/membership"
              className="text-[#78716c] hover:text-[rgb(var(--apex-accent-warm))] transition-colors text-sm tracking-wider uppercase inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              メンバーシップ
            </Link>
            <Form method="post" action="/account/logout">
              <button
                type="submit"
                className="text-[#a8a29e] hover:text-[#991b1b] transition-colors text-sm tracking-wider uppercase"
              >
                ログアウト
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderItem({order}: {order: OrderCardFragment}) {
  if (!order?.id) return null;

  const [legacyOrderId, key] = order.id.split('/').pop()!.split('?');
  const url = key
    ? `/account/orders/${legacyOrderId}?${key}`
    : `/account/orders/${legacyOrderId}`;

  const lineItems = flattenConnection(order?.lineItems);
  const fulfillmentStatus = flattenConnection(order?.fulfillments)[0]?.status;

  return (
    <Link
      to={url}
      className="bg-white border border-[#e7e5e4] p-6 block hover:border-[#78716c] transition-colors group"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-[#a8a29e]">
          注文番号 {order.number}
        </p>
        {fulfillmentStatus && (
          <span
            className={`text-xs px-2 py-0.5 ${
              fulfillmentStatus === 'SUCCESS'
                ? 'bg-[#f0fdf4] text-[#166534]'
                : 'bg-[#f5f5f4] text-[#78716c]'
            }`}
          >
            {fulfillmentStatus === 'SUCCESS' ? '配送済み' : '準備中'}
          </span>
        )}
      </div>
      <p className="font-medium text-sm mb-1 line-clamp-1">
        {lineItems.length > 1
          ? `${lineItems[0].title} +${lineItems.length - 1}`
          : lineItems[0]?.title || '—'}
      </p>
      <p className="text-[#a8a29e] text-xs">
        {new Date(order.processedAt).toLocaleDateString('ja-JP')}
      </p>
      <p className="text-[#78716c] text-xs mt-3 tracking-wider group-hover:text-[rgb(var(--apex-accent-warm))] transition-colors">
        詳細を見る →
      </p>
    </Link>
  );
}

function AddressCard({
  address,
  isDefault,
}: {
  address: any;
  isDefault?: boolean;
}) {
  return (
    <div className="bg-white border border-[#e7e5e4] p-6 flex flex-col">
      {isDefault && (
        <span className="text-xs text-[#78716c] tracking-wider uppercase mb-3">
          デフォルト
        </span>
      )}
      <ul className="flex-1 text-sm space-y-1">
        {(address.firstName || address.lastName) && (
          <li>
            {address.firstName || ''} {address.lastName || ''}
          </li>
        )}
        {address.formatted &&
          address.formatted.map((line: string) => (
            <li key={line} className="text-[#78716c]">
              {line}
            </li>
          ))}
      </ul>
      <div className="flex gap-4 mt-4 pt-3 border-t border-[#e7e5e4]">
        <Link
          to={`/account/address/${encodeURIComponent(address.id)}`}
          className="text-[#78716c] text-xs tracking-wider hover:text-[rgb(var(--apex-accent-warm))] transition-colors"
          prefetch="intent"
        >
          編集
        </Link>
        <Form action="address/delete" method="delete">
          <input type="hidden" name="addressId" value={address.id} />
          <button
            type="submit"
            className="text-[#a8a29e] text-xs tracking-wider hover:text-[#991b1b] transition-colors"
          >
            削除
          </button>
        </Form>
      </div>
    </div>
  );
}
