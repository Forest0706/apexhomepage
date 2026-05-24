const BLOY_API_BASE = 'https://api.bloy.io/rest-api/v1';

export {getVipTier, calculateEarnPoints, POINTS_PER_YEN, BLOY_CONFIG, type BloyVipTier} from '~/lib/bloy.utils';

// --- Types ---

export interface BloyCustomer {
  id: string;
  shopifyCustomerId: string;
  email: string;
  points: number;
  status: string;
  birthday?: string;
  createdAt?: string;
}

export interface BloyReward {
  _id: string;
  discountCode: string;
  description: string;
  discountValue: number;
  redeemType: string;
  status: string;
  createdAt?: string;
}

export interface BloyRedemptionOption {
  _id: string;
  name: string;
  type: string;
  rewardValue: number;
  discountValue: number;
  redeemable: boolean;
  pointsCost?: number;
}

export interface BloyActivity {
  _id: string;
  description: string;
  note?: string;
  type: string;
  oldPoints: number;
  newPoints: number;
  createdAt: string;
}

// --- API Client ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function bloyFetch(apiKey: string, path: string, options?: RequestInit): Promise<any> {
  const url = `${BLOY_API_BASE}${path}`;
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`BLOY API ${res.status}: ${text}`);
    }
    return res.json();
  });
}

export function createBloyClient(apiKey: string) {
  if (!apiKey || apiKey === 'your_bloy_api_key_here') {
    return null;
  }

  return {
    async getCustomerByEmail(
      email: string,
    ): Promise<BloyCustomer | null> {
      const data = await bloyFetch(
        apiKey,
        `/customers?filter=${encodeURIComponent(email)}`,
      );
      const customers: BloyCustomer[] = data?.customers || [];
      return customers.find((c) => c.email === email) || null;
    },

    async getCustomerById(id: string): Promise<BloyCustomer | null> {
      const data = await bloyFetch(apiKey, `/customers/${id}`);
      return data?.customer || null;
    },

    async updateBirthday(params: {
      customerIdentifier: string;
      day: number;
      month: number;
      year: number;
    }): Promise<any> {
      return bloyFetch(apiKey, '/customers/updateBirthday', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },

    async addPoints(params: {
      customerIdentifier: string;
      amount: number;
      description: string;
      note?: string;
    }): Promise<any> {
      return bloyFetch(apiKey, '/points/add', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },

    async getRewards(
      customerIdentifier: string,
    ): Promise<BloyReward[]> {
      const data = await bloyFetch(
        apiKey,
        `/rewards?customerIdentifier=${encodeURIComponent(customerIdentifier)}`,
      );
      return data?.rewards || [];
    },

    async getRedemptionOptions(
      customerIdentifier: string,
    ): Promise<BloyRedemptionOption[]> {
      const data = await bloyFetch(
        apiKey,
        `/pointsRedemptions?customerIdentifier=${encodeURIComponent(customerIdentifier)}`,
      );
      return data?.pointsRedemptions || [];
    },

    async redeemReward(params: {
      customerIdentifier: string;
      pointsAmount: number;
      rewardId: string;
    }): Promise<{discountCode: string}> {
      return bloyFetch(apiKey, '/pointsRedemptions', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },

    async getActivities(
      customerIdentifier: string,
    ): Promise<BloyActivity[]> {
      const data = await bloyFetch(
        apiKey,
        `/activities?customerIdentifier=${encodeURIComponent(customerIdentifier)}`,
      );
      return data?.activities || [];
    },
  };
}

export type BloyClient = NonNullable<ReturnType<typeof createBloyClient>>;
