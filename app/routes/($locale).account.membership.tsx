import {
  Await,
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from '@remix-run/react';
import {defer, type ActionFunctionArgs, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Suspense} from 'react';

import {createBloyClient} from '~/lib/bloy.server';
import {getVipTier, BLOY_CONFIG} from '~/lib/bloy.utils';
import {CACHE_NONE, routeHeaders} from '~/data/cache';
import {translations} from '~/data/translations';
import {CUSTOMER_EMAIL_QUERY} from '~/graphql/customer-account/CustomerEmailQuery';

export const headers = routeHeaders;

export async function loader({context}: LoaderFunctionArgs) {
  const {customerAccount, env} = context;
  const isLoggedIn = await customerAccount.isLoggedIn();

  if (!isLoggedIn) {
    throw new Response(null, {status: 401});
  }

  const {data} = await customerAccount.query(CUSTOMER_EMAIL_QUERY);
  const email = data?.customer?.emailAddress?.emailAddress;

  if (!email) {
    throw new Response(null, {status: 401});
  }

  const bloy = createBloyClient(env.BLOY_API_KEY);
  const t = translations.ja.membership;

  if (!bloy) {
    return defer({
      customer: null,
      rewards: [],
      redemptionOptions: [],
      activities: [],
      t,
    });
  }

  const [customer, rewards, redemptionOptions, activities] = await Promise.all([
    bloy.getCustomerByEmail(email).catch(() => null),
    bloy.getRewards(email).catch(() => []),
    bloy.getRedemptionOptions(email).catch(() => []),
    bloy.getActivities(email).catch(() => []),
  ]);

  return defer({
    customer,
    rewards,
    redemptionOptions,
    activities,
    t,
  });
}

export async function action({request, context}: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'redeem') {
    const customerIdentifier = formData.get('customerIdentifier') as string;
    const pointsAmount = Number(formData.get('pointsAmount'));
    const rewardId = formData.get('rewardId') as string;

    const bloy = createBloyClient(context.env.BLOY_API_KEY);
    if (!bloy) {
      return {error: 'BLOY API not configured'};
    }

    try {
      const result = await bloy.redeemReward({
        customerIdentifier,
        pointsAmount,
        rewardId,
      });
      return {discountCode: result.discountCode};
    } catch (e: any) {
      return {error: e.message || 'Redemption failed'};
    }
  }

  if (intent === 'birthday') {
    const customerIdentifier = formData.get('customerIdentifier') as string;
    const day = Number(formData.get('day'));
    const month = Number(formData.get('month'));
    const year = Number(formData.get('year'));

    const bloy = createBloyClient(context.env.BLOY_API_KEY);
    if (!bloy) {
      return {error: 'BLOY API not configured'};
    }

    try {
      await bloy.updateBirthday({customerIdentifier, day, month, year});
      return {birthdayUpdated: true};
    } catch (e: any) {
      return {error: e.message || 'Birthday update failed'};
    }
  }

  return {};
}

export default function MembershipPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const {t} = data;

  return (
    <div className="bg-[#fafaf9] min-h-screen pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[#78716c] tracking-[0.3em] text-sm uppercase mb-3">
            {t.title}
          </p>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold">
            {t.title}
          </h1>
        </div>

        {data.customer ? (
          <MembershipContent
            customer={data.customer}
            rewards={data.rewards}
            redemptionOptions={data.redemptionOptions}
            activities={data.activities}
            t={t}
            actionData={actionData}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 border border-[#9ca3af]/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[#78716c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <p className="text-[#a8a29e] text-lg mb-4">{t.notEnrolled}</p>
            <p className="text-[#a8a29e] text-sm">{t.enrollHint}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MembershipContent({
  customer,
  rewards,
  redemptionOptions,
  activities,
  t,
  actionData,
  isSubmitting,
}: {
  customer: any;
  rewards: any[];
  redemptionOptions: any[];
  activities: any[];
  t: any;
  actionData: any;
  isSubmitting: boolean;
}) {
  const vipTier = getVipTier(customer.points);

  return (
    <div className="space-y-12">
      {/* Points & VIP Tier */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#e7e5e4] p-8">
          <p className="text-[#78716c] text-xs tracking-wider uppercase mb-2">
            {t.pointsBalance}
          </p>
          <p className="text-5xl font-serif font-bold mb-2">
            {customer.points.toLocaleString()}
          </p>
          <p className="text-[#a8a29e] text-sm">{t.pointsUnit}</p>
        </div>
        <div className="bg-white border border-[#e7e5e4] p-8">
          <p className="text-[#78716c] text-xs tracking-wider uppercase mb-2">
            {t.vipTier}
          </p>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold"
              style={{backgroundColor: vipTier.color}}
            >
              {vipTier.name.charAt(0)}
            </div>
            <div>
              <p className="text-2xl font-serif font-bold">{vipTier.name}</p>
              <p className="text-[#a8a29e] text-sm">
                {vipTier.minPoints.toLocaleString()}pt ~
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Points Rules */}
      <section>
        <h2 className="text-2xl font-serif font-bold mb-6">
          {t.rulesTitle}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white border border-[#e7e5e4] p-6 flex items-start gap-4">
            <div className="w-10 h-10 shrink-0 border border-[#9ca3af]/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-[#78716c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm">
                {t.rulePurchase.replace('{points}', String(BLOY_CONFIG.pointsPerYen))}
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#e7e5e4] p-6 flex items-start gap-4">
            <div className="w-10 h-10 shrink-0 border border-[#9ca3af]/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-[#78716c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm">
                {t.ruleSignup.replace('{points}', String(BLOY_CONFIG.signupBonus))}
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#e7e5e4] p-6 flex items-start gap-4">
            <div className="w-10 h-10 shrink-0 border border-[#9ca3af]/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-[#78716c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A1.5 1.5 0 003 15.546M12 3v1m0 11v1m-7-6h1m11 0h1m-2.636-4.364l-.707.707M6.343 14.657l-.707.707m11.728 0l-.707-.707M6.343 8.343l-.707-.707" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm">
                {t.ruleBirthday.replace('{points}', String(BLOY_CONFIG.birthdayBonus))}
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#e7e5e4] p-6 flex items-start gap-4">
            <div className="w-10 h-10 shrink-0 border border-[#9ca3af]/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-[#78716c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm">
                {t.ruleReferral.replace('{points}', String(BLOY_CONFIG.referralBonus))}
              </p>
              <p className="text-[#a8a29e] text-xs mt-1">{t.ruleReferralNote}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Action Result */}
      {actionData?.discountCode && (
        <div className="bg-[#f0fdf4] border border-[#86efac] p-4">
          <p className="text-[#166534] font-medium">{t.redeemSuccess}</p>
          <p className="text-[#166534] text-sm mt-1">
            {t.discountCode}: <span className="font-mono font-bold">{actionData.discountCode}</span>
          </p>
        </div>
      )}
      {actionData?.error && (
        <div className="bg-[#fef2f2] border border-[#fca5a5] p-4">
          <p className="text-[#991b1b]">{actionData.error}</p>
        </div>
      )}
      {actionData?.birthdayUpdated && (
        <div className="bg-[#f0fdf4] border border-[#86efac] p-4">
          <p className="text-[#166534] font-medium">{t.birthdaySuccess}</p>
        </div>
      )}

      {/* Redeemable Rewards */}
      {redemptionOptions.length > 0 && (
        <section>
          <h2 className="text-2xl font-serif font-bold mb-6">
            {t.redeemRewards}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {redemptionOptions.map((option) => {
              const canRedeem = option.redeemable && customer.points >= (option.pointsCost || option.rewardValue);
              return (
                <div
                  key={option._id}
                  className="bg-white border border-[#e7e5e4] p-6 flex flex-col justify-between"
                >
                  <div>
                    <p className="font-medium mb-1">{option.name}</p>
                    <p className="text-[#a8a29e] text-sm">
                      {option.type === 'percentage'
                        ? `${option.discountValue}% OFF`
                        : option.type === 'fixed_amount'
                          ? `¥${option.discountValue} OFF`
                          : option.type === 'free_shipping'
                            ? t.freeShipping
                            : option.name}
                    </p>
                    <p className="text-[#78716c] text-sm mt-2">
                      {option.rewardValue}pt
                    </p>
                  </div>
                  <Form method="post" className="mt-4">
                    <input type="hidden" name="intent" value="redeem" />
                    <input type="hidden" name="customerIdentifier" value={customer.email} />
                    <input type="hidden" name="pointsAmount" value={option.rewardValue} />
                    <input type="hidden" name="rewardId" value={option._id} />
                    <button
                      type="submit"
                      disabled={!canRedeem || isSubmitting}
                      className={`w-full py-2 text-sm tracking-wider uppercase transition-colors ${
                        canRedeem
                          ? 'bg-[rgb(var(--apex-text))] text-white hover:bg-[#78716c]'
                          : 'bg-[#e7e5e4] text-[#a8a29e] cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? t.processing : canRedeem ? t.redeem : t.insufficientPoints}
                    </button>
                  </Form>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Earned Rewards */}
      {rewards.length > 0 && (
        <section>
          <h2 className="text-2xl font-serif font-bold mb-6">
            {t.earnedRewards}
          </h2>
          <div className="bg-white border border-[#e7e5e4]">
            {rewards.map((reward) => (
              <div
                key={reward._id}
                className="flex items-center justify-between p-4 border-b border-[#e7e5e4] last:border-b-0"
              >
                <div>
                  <p className="font-medium text-sm">{reward.description}</p>
                  <p className="text-[#a8a29e] text-xs mt-0.5">
                    {reward.redeemType} · {reward.status}
                  </p>
                </div>
                {reward.discountCode && (
                  <span className="font-mono text-xs bg-[#f5f5f4] px-3 py-1 border border-[#e7e5e4]">
                    {reward.discountCode}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Activity History */}
      {activities.length > 0 && (
        <section>
          <h2 className="text-2xl font-serif font-bold mb-6">
            {t.activityHistory}
          </h2>
          <div className="bg-white border border-[#e7e5e4]">
            {activities.slice(0, 20).map((activity) => (
              <div
                key={activity._id}
                className="flex items-center justify-between p-4 border-b border-[#e7e5e4] last:border-b-0"
              >
                <div>
                  <p className="text-sm">{activity.description}</p>
                  {activity.note && (
                    <p className="text-[#a8a29e] text-xs mt-0.5">{activity.note}</p>
                  )}
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className={`text-sm font-medium ${
                    activity.newPoints > activity.oldPoints
                      ? 'text-[#166534]'
                      : 'text-[#991b1b]'
                  }`}>
                    {activity.newPoints > activity.oldPoints ? '+' : ''}
                    {activity.newPoints - activity.oldPoints}pt
                  </p>
                  <p className="text-[#a8a29e] text-xs mt-0.5">
                    {new Date(activity.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Birthday Registration */}
      <section>
        <h2 className="text-2xl font-serif font-bold mb-4">
          {t.birthdayTitle}
        </h2>
        <p className="text-[#a8a29e] text-sm mb-6">{t.birthdayHint}</p>
        {customer.birthday ? (
          <p className="text-sm">
            {t.birthdayRegistered}: <span className="font-medium">{customer.birthday}</span>
          </p>
        ) : (
          <Form method="post" className="flex items-end gap-3">
            <input type="hidden" name="intent" value="birthday" />
            <input type="hidden" name="customerIdentifier" value={customer.email} />
            <div>
              <label className="block text-xs text-[#a8a29e] mb-1">{t.birthdayYear}</label>
              <input
                type="number"
                name="year"
                min="1900"
                max={new Date().getFullYear()}
                placeholder="1990"
                required
                className="w-24 px-3 py-2 border border-[#e7e5e4] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-[#a8a29e] mb-1">{t.birthdayMonth}</label>
              <input
                type="number"
                name="month"
                min="1"
                max="12"
                placeholder="1"
                required
                className="w-20 px-3 py-2 border border-[#e7e5e4] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-[#a8a29e] mb-1">{t.birthdayDay}</label>
              <input
                type="number"
                name="day"
                min="1"
                max="31"
                placeholder="1"
                required
                className="w-20 px-3 py-2 border border-[#e7e5e4] text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[rgb(var(--apex-text))] text-white text-sm tracking-wider uppercase hover:bg-[#78716c] transition-colors disabled:opacity-50"
            >
              {t.birthdaySubmit}
            </button>
          </Form>
        )}
      </section>

      {/* Back Link */}
      <div className="pt-4 border-t border-[#e7e5e4]">
        <Link
          to="/account"
          className="text-[#78716c] hover:text-[rgb(var(--apex-accent-warm))] transition-colors text-sm tracking-wider uppercase inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          {t.backToAccount}
        </Link>
      </div>
    </div>
  );
}
