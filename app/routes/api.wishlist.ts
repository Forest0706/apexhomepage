import {json, type ActionFunctionArgs} from '@shopify/remix-oxygen';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export async function action({request, context}: ActionFunctionArgs) {
  const {customerAccount, admin} = context;

  const isLoggedIn = await customerAccount.isLoggedIn();
  if (!isLoggedIn) {
    return json({error: 'Unauthorized'}, {status: 401});
  }

  const formData = await request.formData();
  const productId = formData.get('productId') as string;
  const actionType = (formData.get('action') as 'add' | 'remove') || 'add';

  if (!productId) {
    return json({error: 'Missing productId'}, {status: 400});
  }

  try {
    const {data} = await customerAccount.query(CUSTOMER_DETAILS_QUERY);
    const customer = data?.customer;

    if (!customer) {
      return json({error: 'Customer not found'}, {status: 404});
    }

    const customerId = customer.id;
    const existingMetafield = customer.metafield;
    let existingItems: string[] = [];

    if (existingMetafield?.value) {
      try {
        existingItems = JSON.parse(existingMetafield.value);
      } catch {
        existingItems = [];
      }
    }

    let updatedItems: string[];
    if (actionType === 'add') {
      updatedItems = [...new Set([...existingItems, productId])];
    } else {
      updatedItems = existingItems.filter((id: string) => id !== productId);
    }

    const metafieldInput = {
      namespace: 'wishlist',
      key: 'product_ids',
      value: JSON.stringify(updatedItems),
      type: 'json',
    };

    const mutation = `#graphql
      mutation CustomerUpdateWishlist($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
        customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
          customer {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const result = await admin.graphql(mutation, {
      variables: {
        customerAccessToken: context.session.get('customerAccessToken'),
        customer: {
          id: customerId,
          metafields: [metafieldInput],
        },
      },
    });

    const errors = result?.data?.customerUpdate?.userErrors;
    if (errors?.length > 0) {
      console.error('Wishlist update error:', errors);
      return json({error: errors[0].message}, {status: 500});
    }

    return json({success: true, items: updatedItems});
  } catch (error) {
    console.error('Wishlist action error:', error);
    return json({error: 'Internal error'}, {status: 500});
  }
}

export async function loader({context}: ActionFunctionArgs) {
  const {customerAccount} = context;

  const isLoggedIn = await customerAccount.isLoggedIn();
  if (!isLoggedIn) {
    return json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const {data} = await customerAccount.query(CUSTOMER_DETAILS_QUERY);
    const customer = data?.customer;

    if (!customer?.metafield?.value) {
      return json({productIds: []});
    }

    const productIds = JSON.parse(customer.metafield.value);
    return json({productIds});
  } catch (error) {
    console.error('Wishlist loader error:', error);
    return json({items: []});
  }
}
