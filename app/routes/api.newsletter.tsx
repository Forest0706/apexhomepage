import {json, type ActionFunctionArgs} from '@shopify/remix-oxygen';

export async function action({request, context}: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;

    console.log('📧 收到订阅请求，邮箱：', email);

    if (!email || !email.includes('@')) {
      return json(
        {error: '有効なメールアドレスを入力してください'},
        {status: 400},
      );
    }

    const {env} = context;

    const response = await fetch(
      `https://${env.PUBLIC_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': env.PUBLIC_STOREFRONT_API_TOKEN,
        },
        body: JSON.stringify({
          query: SUBSCRIBE_MUTATION,
          variables: {
            input: {
              email,
              acceptsMarketing: true,
            },
          },
        }),
      },
    );

    const result = await response.json();
    console.log('📬 API 返回：', JSON.stringify(result, null, 2));

    const userErrors = result?.data?.customerCreate?.userErrors ?? [];

    if (userErrors.length > 0) {
      const error = userErrors[0];
      if (error.message?.includes('taken') || error.field?.includes('email')) {
        return json({success: true, message: 'ご購読ありがとうございます！'});
      }
      return json({error: error.message}, {status: 400});
    }

    if (!result?.data?.customerCreate?.customer) {
      return json(
        {error: 'エラーが発生しました。もう一度お試しください'},
        {status: 500},
      );
    }

    return json({success: true, message: 'ご購読ありがとうございます！'});
  } catch (error) {
    console.error('💥 action 异常：', error);
    return json({error: String(error)}, {status: 500});
  }
}

const SUBSCRIBE_MUTATION = `
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        acceptsMarketing
      }
      userErrors {
        field
        message
      }
    }
  }
`;
