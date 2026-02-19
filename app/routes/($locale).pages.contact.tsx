import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {getSeoMeta} from '@shopify/hydrogen';

import {routeHeaders} from '~/data/cache';
import {Button} from '~/components/Button';

export const headers = routeHeaders;

export async function loader(args: LoaderFunctionArgs) {
  return json({
    seo: {
      title: 'お問い合わせ | APEX TOYS',
      description: '製品に関するお問い合わせはこちらから',
    },
  });
}

export const meta = ({data}: {data: any}) => {
  return getSeoMeta(data.seo);
};

export default function Contact() {
  return (
    <div className="bg-black text-white min-h-screen py-32 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-12 uppercase tracking-widest text-center">
          お問い合わせ
        </h1>

        <div className="bg-[#0a0a0a] border border-white/10 p-8 md:p-12 rounded-sm">
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
            製品に関するご質問、お取引に関するお問い合わせは、以下のフォームよりご連絡ください。
            <br />
            通常、3営業日以内に担当者より返信いたします。
          </p>

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              alert('お問い合わせを受け付けました。（デモ）');
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-xs text-gray-500 uppercase tracking-wider block"
                >
                  お名前
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full bg-black border border-white/20 text-white px-4 py-3 focus:border-accent focus:outline-none transition-colors"
                  placeholder="山田 太郎"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs text-gray-500 uppercase tracking-wider block"
                >
                  メールアドレス
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full bg-black border border-white/20 text-white px-4 py-3 focus:border-accent focus:outline-none transition-colors"
                  placeholder="example@apex-toy.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="subject"
                className="text-xs text-gray-500 uppercase tracking-wider block"
              >
                件名
              </label>
              <div className="relative">
                <select
                  id="subject"
                  name="subject"
                  className="w-full bg-black border border-white/20 text-white px-4 py-3 appearance-none focus:border-accent focus:outline-none transition-colors"
                >
                  <option value="product">製品について</option>
                  <option value="order">注文について</option>
                  <option value="business">法人のお取引について</option>
                  <option value="other">その他</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  ▼
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="message"
                className="text-xs text-gray-500 uppercase tracking-wider block"
              >
                お問い合わせ内容
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                className="w-full bg-black border border-white/20 text-white px-4 py-3 focus:border-accent focus:outline-none transition-colors resize-none"
                placeholder="お問い合わせ内容をご記入ください"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full md:w-auto px-12 py-4 bg-accent hover:bg-white hover:text-black text-white font-bold tracking-widest transition-all duration-300"
              >
                送信する
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
