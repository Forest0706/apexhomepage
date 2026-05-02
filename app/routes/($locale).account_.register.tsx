import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {Form, useActionData, useNavigation} from '@remix-run/react';
import {localWishlist} from '~/utils/localWishlist';

export async function loader({context, params}: LoaderFunctionArgs) {
  const {customerAccount} = context;
  const isLoggedIn = await customerAccount.isLoggedIn();
  if (isLoggedIn) {
    return redirect(params.locale ? `/${params.locale}/account` : '/account');
  }
  return json({});
}

export async function action({request, context}: ActionFunctionArgs) {
  const {customerAccount, session, admin} = context;
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = (formData.get('firstName') as string) || '';
  const lastName = (formData.get('lastName') as string) || '';
  const guestWishlist = formData.get('guestWishlist') as string;

  if (!email || !password) {
    return json(
      {error: 'メールアドレスとパスワードを入力してください'},
      {status: 400},
    );
  }

  if (password.length < 5) {
    return json({error: 'パスワードは5文字以上必要です'}, {status: 400});
  }

  try {
    const {customer, session: custSession} =
      await customerAccount.authenticate.storefront.register({
        email,
        password,
        firstName,
        lastName,
      });

    const customerAccessToken = custSession.get('customerAccessToken');
    if (customerAccessToken) {
      await session.set('customerAccessToken', customerAccessToken);
    }

    let mergedWishlist: string[] = [];
    if (guestWishlist) {
      try {
        const guestItems = JSON.parse(guestWishlist) as string[];
        if (guestItems.length > 0) {
          mergedWishlist = [...new Set(guestItems)];

          await admin(
            `#graphql
              mutation UpdateWishlist($input: CustomerInput!) {
                customerUpdate(input: $input) {
                  customer { id }
                  userErrors { field message }
                }
              }
            `,
            {
              input: {
                id: customer.id,
                metafields: [
                  {
                    namespace: 'wishlist',
                    key: 'product_ids',
                    type: 'json',
                    value: JSON.stringify(mergedWishlist),
                  },
                ],
              },
            },
          );
        }
      } catch (e) {
        console.error('Wishlist merge error:', e);
      }
    }

    return json(
      {success: true, merged: mergedWishlist.length > 0},
      {headers: {'Set-Cookie': await session.commit()}},
    );
  } catch (error: any) {
    const errorMessage = error.message || '登録に失敗しました';
    if (errorMessage.includes('already exists')) {
      return json(
        {error: 'このメールアドレスは既に登録されています'},
        {status: 400},
      );
    }
    return json({error: errorMessage}, {status: 400});
  }
}

export default function RegisterPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf9] py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#292524]">新規登録</h2>
          <p className="mt-2 text-sm text-[#78716c]">
            すでにアカウントをお持ちの方は
            <a
              href="/ja/account/login"
              className="text-[#5a31f4] hover:underline"
            >
              {' '}
              ログイン
            </a>
          </p>
        </div>

        <Form method="POST" className="mt-8 space-y-6">
          <input
            type="hidden"
            name="guestWishlist"
            value={
              localWishlist.get().length > 0
                ? JSON.stringify(localWishlist.get())
                : '[]'
            }
          />

          {actionData?.error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-sm">
              {actionData.error}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-[#292524]"
                >
                  姓
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className="mt-1 block w-full px-4 py-3 border border-[#e7e5e4] rounded-sm focus:ring-[#5a31f4] focus:border-[#5a31f4]"
                  placeholder="山田"
                />
              </div>
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-[#292524]"
                >
                  名
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className="mt-1 block w-full px-4 py-3 border border-[#e7e5e4] rounded-sm focus:ring-[#5a31f4] focus:border-[#5a31f4]"
                  placeholder="太郎"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#292524]"
              >
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-4 py-3 border border-[#e7e5e4] rounded-sm focus:ring-[#5a31f4] focus:border-[#5a31f4]"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#292524]"
              >
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={5}
                className="mt-1 block w-full px-4 py-3 border border-[#e7e5e4] rounded-sm focus:ring-[#5a31f4] focus:border-[#5a31f4]"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-[#78716c]">5文字以上必要です</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-[#5a31f4] hover:bg-[#4a28d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5a31f4] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '登録中...' : '新規登録'}
          </button>
        </Form>
      </div>
    </div>
  );
}
