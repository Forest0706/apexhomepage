import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {Form, useLoaderData, useRouteLoaderData} from '@remix-run/react';
import {Link} from '~/components/Link';

export async function loader({context, params}: LoaderFunctionArgs) {
  const {customerAccount} = context;
  const isLoggedIn = await customerAccount.isLoggedIn();
  if (isLoggedIn) {
    return redirect(params.locale ? `/${params.locale}/account` : '/account');
  }
  return json({});
}

export async function action({context}: ActionFunctionArgs) {
  return context.customerAccount.login();
}

export default function LoginPage() {
  const data = useLoaderData<typeof loader>();
  const rootData = useRouteLoaderData<typeof import('~/root').loader>('root');
  const shop = rootData?.layout?.shop;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf9] py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#292524]">ログイン</h2>
          <p className="mt-2 text-sm text-[#78716c]">
            APEX TOYS アカウントをお持ちでない方は、ログインページから新規登録できます
          </p>
        </div>

        <Form method="POST" className="mt-8 space-y-6">
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-[#5a31f4] hover:bg-[#4a28d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5a31f4]"
          >
            ログイン / 新規登録
          </button>
        </Form>

        <p className="text-center text-xs text-[#a8a29e]">
          続行することで、
          {shop?.privacyPolicy ? (
            <Link to={`/policies/${shop.privacyPolicy.handle}`} className="text-[#78716c] hover:text-[#292524] underline">
              {shop.privacyPolicy.title}
            </Link>
          ) : 'プライバシーポリシー'}
          および
          {shop?.termsOfService ? (
            <Link to={`/policies/${shop.termsOfService.handle}`} className="text-[#78716c] hover:text-[#292524] underline">
              {shop.termsOfService.title}
            </Link>
          ) : '利用規約'}
          に同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}
