import {
  json,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {getSeoMeta} from '@shopify/hydrogen';
import {useState} from 'react';

import {routeHeaders} from '~/data/cache';

export const headers = routeHeaders;

export async function loader({context}: LoaderFunctionArgs) {
  return json({});
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return getSeoMeta({
    title: 'よくある質問 | APEX TOYS',
    description:
      'APEX TOYSによくある質問と答え。商品、注文、配送、支払いについて.',
  });
};

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: '商品の対象年齢はありますか？',
    answer:
      '商品によって対象年齢が異なります。的商品详情ページにて对象年齢をご案内しております。一般的には14歳以上のを対象とした商品居多です。',
  },
  {
    question: '商品の仕様（サイズ、材质）は哪里可以看到？',
    answer:
      '各商品ページの下部にある「详细信息」タブにて、サイズ・材质等の仕様をご案内しております。また、商品紹介ページにも記載がございます。',
  },
  {
    question: '予約商品と在庫商品の区别是什么？',
    answer:
      '在庫切れの商品で、生产予定があるものは「予約商品」として受付けております。予約商品は 발송 开始予定日を商品ページに記載しておりますのでご確認您的ください。',
  },
  {
    question: '配送先を変更できますか？',
    answer:
      'ご注文確定後の配送先変更は原则上できません。已经発送済みの場合などは、佐川急便の営業所止め等服务も为您介绍，请在注文メモ欄にご希望の内容をご記載ください。',
  },
  {
    question: '配送日は指定できますか？',
    answer:
      '恐れ入りますが、配送日のご指定は承っておりません。ご注文確定後、2〜3営業日以内に発送いたします。',
  },
  {
    question: '長期不在で受け取れませんでした。怎么办？',
    answer:
      '長期不在などで商品が返送された場合、再配送所需的送料はお客様負担となります。再送をご希望の場合は联系我们ください。',
  },
  {
    question: 'お支払い後に内容を変更できますか？',
    answer:
      'ご注文確定後の内容変更（サイズ、カラー、数量など）は承ることができません。再度ご注文いただき、以往の注文をキャンセルしてください。',
  },
  {
    question: '領収書を発行できますか？',
    answer:
      '恐れ入りますが、領収書の発行は承っておりません。クレジットカードの場合、ご請求明細が領収書の代わりとしてご利用いただけます。',
  },
  {
    question: '法人の大量に注文，请问有优惠吗？',
    answer:
      '法人・デパートメント向けの大量注文を承っております。詳しい条件・価格はお問い合わせください。Email: b2b@apex-toys.com',
  },
  {
    question: '海外への発送は可能ですか？',
    answer: '恐れ入りますが目前、日本国内への配送のみ为您提供服务。',
  },
];

function FAQAccordion({question, answer}: FAQItem) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[rgb(var(--apex-border))]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex justify-between items-center text-left hover:text-[rgb(var(--apex-accent-dark))] transition-colors"
      >
        <span className="font-medium text-[rgb(var(--apex-text))]">
          {question}
        </span>
        <svg
          className={`w-5 h-5 text-[rgb(var(--apex-muted))] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        }`}
      >
        <p className="text-[rgb(var(--apex-muted))] leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="container mx-auto px-4 pt-32 pb-16 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8 tracking-wide text-center uppercase">
        よくある質問
      </h1>

      <div className="bg-[rgb(var(--apex-card))] rounded-sm p-6 md:p-8">
        <div className="space-y-0">
          {faqData.map((item, index) => (
            <FAQAccordion
              key={index}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[rgb(var(--apex-muted))] mb-4">
          上記之外のご質問は、お気軽にお問い合わせください。
        </p>
        <a
          href="mailto:contact@apex-toys.com"
          className="inline-block px-6 py-3 bg-[rgb(var(--apex-text))] text-white font-medium tracking-wider uppercase text-sm hover:bg-[rgb(var(--apex-accent-dark))] transition-colors rounded-sm"
        >
          お問い合わせ
        </a>
      </div>
    </div>
  );
}
