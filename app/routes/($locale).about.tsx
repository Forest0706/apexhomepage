import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';

export async function loader({context}: LoaderFunctionArgs) {
  return json({});
}

export default function About() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-5xl font-serif font-bold mb-8 tracking-wide text-center uppercase">
        APEX TOYSについて
      </h1>
      <div className="prose prose-lg mx-auto text-center space-y-6">
        <p className="text-xl leading-relaxed">
          APEX-TOYSは、2018年に上海で設立されて以来、わずか数年でトップクラスのフィギュア企業へと成長しました。
        </p>
        <p className="text-xl leading-relaxed">
          2019年には、世界初の1:1スケールの完全浮遊構造レジンフィギュアの制作に成功し、
          業界における技術的な優位性を確立しました。
        </p>
        <p className="text-xl leading-relaxed">
          2020年までに、APEX-TOYSは完全所有のフィギュア工場を設立しました。
          これにより、「設計-製造-流通」の完全なチェーンを持つ業界でも数少ない企業の一つとなり、
          優位性をさらに確実なものにしました。
        </p>
      </div>
    </div>
  );
}
