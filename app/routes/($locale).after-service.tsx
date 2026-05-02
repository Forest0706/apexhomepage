import {
  json,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {getSeoMeta} from '@shopify/hydrogen';

import {routeHeaders} from '~/data/cache';

export const headers = routeHeaders;

export async function loader({context}: LoaderFunctionArgs) {
  return json({});
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta({
    title: 'アフターサービス | APEX TOYS',
    description:
      'APEX TOYSのアフターサービスについて。保証期間、修理・メンテナンスサービスのご案内.',
  });
};

export default function AfterService() {
  return (
    <div className="container mx-auto px-4 pt-32 pb-16 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8 tracking-wide text-center uppercase">
        アフターサービス
      </h1>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-serif font-bold mb-4 text-[rgb(var(--apex-text))]">
            保証について
          </h2>
          <div className="prose prose-lg max-w-none text-[rgb(var(--apex-muted))] space-y-4">
            <p>
              APEX TOYS全商品には、
              구매之日起1年間のメーカー保証が適用されます。
              保証期間内に正常使用环境下起きた故障・欠损は、無料で修理または交換いたします。
            </p>
            <p>※ただし、以下の場合は保証の対象外となります：</p>
            <ul className="list-disc list-inside space-y-2">
              <li>掉落・撞击等による物理的损坏</li>
              <li>不当な改造・分解</li>
              <li>天災・事变による损坏</li>
              <li>取り扱い说明に従わない使用</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold mb-4 text-[rgb(var(--apex-text))]">
            修理・メンテナンスサービス
          </h2>
          <div className="prose prose-lg max-w-none text-[rgb(var(--apex-muted))] space-y-4">
            <p>
              保証期間が過ぎた商品 такжеは、保証対象外の损坏についても、
              有料での修理・メンテナンスサービスを提供しております。
            </p>
            <p>修理依頼 방법은以下联系我们ください：</p>
            <ul className="list-disc list-inside space-y-2">
              <li>メール: support@apex-toys.com</li>
              <li>お問い合わせフォームより、修理品の写真を添付</li>
            </ul>
            <p>
              ※修理內容・費用については、個別にご案内いたします。
              修理期間は通常2〜4週間程度かかります。
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold mb-4 text-[rgb(var(--apex-text))]">
            初期不良・到着時の损坏について
          </h2>
          <div className="prose prose-lg max-w-none text-[rgb(var(--apex-muted))] space-y-4">
            <p>
              商品到着時に故障・损坏が 발견された場合は、
              商品到着後7日以内に联系我们ください。 速やかに代替品との
              교환または返金対応をいたします。
            </p>
            <p>
              その際、损坏情况的写真をご用意いただけますと、
              スムーズに対応させていただきます。
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold mb-4 text-[rgb(var(--apex-text))]">
            联系我们
          </h2>
          <div className="prose prose-lg max-w-none text-[rgb(var(--apex-muted))] space-y-4">
            <p>
              アフターサービスに関するお問い合わせは、以下の방법으로
              ご連絡ください。
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>メール: support@apex-toys.com</li>
              <li>営業時間: 平日 10:00〜18:00 (祝日は除く)</li>
            </ul>
            <p>
              ※土・日・祝日ののお問い合わせは、、翌営業日以降に対応させていただきます。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
