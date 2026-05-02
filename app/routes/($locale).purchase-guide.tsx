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
    title: '購入ガイド | APEX TOYS',
    description:
      'APEX TOYSのはじめての方へのおすすめガイド。配送、支払い方法、キャンセルポリシーについて.',
  });
};

export default function PurchaseGuide() {
  return (
    <div className="container mx-auto px-4 pt-32 pb-16 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8 tracking-wide text-center uppercase">
        購入ガイド
      </h1>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-serif font-bold mb-4 text-[rgb(var(--apex-text))]">
            配送について
          </h2>
          <div className="prose prose-lg max-w-none text-[rgb(var(--apex-muted))] space-y-4">
            <p>
              当店では佐川急便または日本郵便ゆうパックにて商品をお届けします。
              ご注文確定後、2〜3営業日以内に発送いたします。
            </p>
            <p>
              沖縄県・離島地域は追加送料が発生する可能性があります。
              あらかじめご了承ください。
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold mb-4 text-[rgb(var(--apex-text))]">
            お支払い方法
          </h2>
          <div className="prose prose-lg max-w-none text-[rgb(var(--apex-muted))] space-y-4">
            <ul className="list-disc list-inside space-y-2">
              <li>クレジットカード (Visa, Mastercard, JCB, AMEX)</li>
              <li>Amazon Pay</li>
              <li>PayPay</li>
              <li>代引現金 (代引き手数料: ¥330)</li>
            </ul>
            <p>※全て税抜価格表示されます。结算時に消費税が加算されます。</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold mb-4 text-[rgb(var(--apex-text))]">
            キャンセル・変更について
          </h2>
          <div className="prose prose-lg max-w-none text-[rgb(var(--apex-muted))] space-y-4">
            <p>
              商品の発送前であれば、カート内より自行取消しが可能です。
              発送後のキャンセルは承ることができませんので、あらかじめご了承ください。
            </p>
            <p>
              注文確定後の内容変更（サイズ、カラー、数量など）はできません。
              再度ご注文いただき、以往の注文をキャンセルしてください。
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold mb-4 text-[rgb(var(--apex-text))]">
            送料について
          </h2>
          <div className="prose prose-lg max-w-none text-[rgb(var(--apex-muted))] space-y-4">
            <p>送料: 全国一律 ¥880 (沖縄県・離島を除く)</p>
            <p>¥15,000以上のご注文で送料無料</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold mb-4 text-[rgb(var(--apex-text))]">
            ラッピング・サービス
          </h2>
          <div className="prose prose-lg max-w-none text-[rgb(var(--apex-muted))] space-y-4">
            <p>
              ギフト包装（有料: ¥550）をご用意しております。
              カート画面の「備考欄」にご希望旨をご入力ください。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
