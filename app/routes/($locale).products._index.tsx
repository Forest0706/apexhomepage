import {useEffect, useRef} from 'react';
import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';
import {getSeoMeta, getPaginationVariables} from '@shopify/hydrogen';

import {Link} from '~/components/Link';
import {routeHeaders} from '~/data/cache';
import {LOCAL_PRODUCTS} from '~/data/localProducts';
import {ALL_PRODUCTS_QUERY} from '~/graphql/HomepageQueries';

export const headers = routeHeaders;

export async function loader({
  request,
  context: {storefront},
}: LoaderFunctionArgs) {
  const paginationVariables = getPaginationVariables(request, {pageBy: 4});

  try {
    const {products} = await storefront.query(ALL_PRODUCTS_QUERY, {
      variables: {
        ...paginationVariables,
        sortKey: 'CREATED_AT',
        reverse: true,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
    });

    return defer({
      products: products.nodes,
      pageInfo: products.pageInfo,
      seo: {
        title: '商品一覧 | APEX TOYS',
        description: 'ハイQualitéなフィギュアコレクション',
      },
    });
  } catch (error) {
    return defer({
      products: LOCAL_PRODUCTS,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: '',
        endCursor: '',
      },
      seo: {
        title: '商品一覧 | APEX TOYS',
        description: 'ハイQualitéなフィギュアコレクション',
      },
    });
  }
}

export const meta = ({data}: {data: any}) => {
  return getSeoMeta(data.seo);
};

function getProductImage(product: any): string {
  if (product.images) {
    return product.images[0];
  }
  return (
    product.featuredImage?.url || product.variants?.nodes?.[0]?.image?.url || ''
  );
}

function getProductTitle(product: any): string {
  return product.title;
}

function getProductSubtitle(product: any): string {
  if (product.subTitle) {
    return product.subTitle;
  }
  return product.vendor || '';
}

export default function AllProducts() {
  const {products} = useLoaderData<typeof loader>();
  const observerRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const img = entry.target.querySelector('img');
          const text = entry.target.querySelector('.product-content');

          if (entry.isIntersecting) {
            if (img) {
              img.classList.remove('opacity-0', 'translate-y-[100px]');
              img.classList.add('slide-in-bottom');
            }
            if (text) {
              text.classList.remove('opacity-0', 'translate-y-[50px]');
              text.classList.add('slide-in-text');
            }
          } else {
            if (img) {
              img.classList.remove('slide-in-bottom');
              img.classList.add('opacity-0', 'translate-y-[100px]');
            }
            if (text) {
              text.classList.remove('slide-in-text');
              text.classList.add('opacity-0', 'translate-y-[50px]');
            }
          }
        });
      },
      {threshold: 0.1},
    );

    observerRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory hiddenScroll relative">
      {/* Fixed Background (Always visible) */}
      <div
        className="fixed inset-0 w-full h-full z-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: 'url("/curtain-bg.svg")',
          backgroundColor: '#000',
        }}
      />

      {/* Opening Curtain (Black overlay that lifts up) */}
      <div className="fixed top-0 left-0 w-full h-full bg-black z-50 curtain-lift pointer-events-none" />

      {/* Navigation Overlay */}
      <div className="fixed top-0 left-0 w-full h-20 bg-gradient-to-b from-black/80 to-transparent z-40 pointer-events-none" />

      {products.map((product: any, index: number) => (
        <section
          key={product.id}
          ref={(el) => (observerRefs.current[index] = el)}
          className="h-screen w-full snap-start relative flex flex-col items-center justify-end overflow-hidden z-10"
        >
          {/* Static Full Screen Image (No Zoom, No Parallax) */}
          <div className="absolute inset-0 z-0 flex items-center justify-center pb-32">
            <img
              src={getProductImage(product)}
              alt={getProductTitle(product)}
              className="w-full h-full md:h-[80vh] object-contain opacity-0 translate-y-[100px] transition-none"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>

          {/* Content at Bottom */}
          <div className="relative z-10 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-32 pb-16 px-6 flex flex-col items-center text-center space-y-4 product-content opacity-0 translate-y-[50px] transition-none">
            <h2 className="text-accent font-mono text-sm tracking-[0.5em] uppercase">
              COLLECTION 0{index + 1}
            </h2>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight uppercase drop-shadow-lg">
              {getProductTitle(product)}
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl font-light">
              {getProductSubtitle(product)}
            </p>

            <Link
              to={`/products/${product.handle}`}
              className="mt-6 px-10 py-3 border border-white/30 bg-black/50 backdrop-blur-md text-white font-mono tracking-widest hover:bg-white hover:text-black transition-all duration-300"
            >
              詳細を見る
            </Link>
          </div>
        </section>
      ))}
    </div>
  );
}
