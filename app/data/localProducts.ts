export type ProductSpec = {
  scale?: string;
  height?: string;
  material?: string;
  releaseDate?: string;
  sculptor?: string;
  painter?: string;
};

export type LocalProduct = {
  id: string;
  title: string;
  subTitle?: string;
  publishedAt: string;
  handle: string;
  vendor: string;
  specs: ProductSpec;
  description: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  images: string[];
  isNew?: boolean;
  isPreorder?: boolean;
};

export const LOCAL_PRODUCTS: LocalProduct[] = [
  {
    id: 'prod-1',
    title: '特典-色紙',
    subTitle: '限定イラスト色紙',
    publishedAt: '2023-01-01',
    handle: 'shikishi',
    vendor: 'APEX TOYS',
    specs: {
      scale: '非スケール',
      height: '150mm x 150mm',
      material: '高級紙',
      releaseDate: '2023年6月',
    },
    description:
      'APEX TOYS 限定特典色紙。高精細印刷でイラストの魅力を最大限に引き出し、コレクションとしての価値を高めます。数量限定生産。',
    price: {
      amount: '500.0',
      currencyCode: 'JPY',
    },
    images: [
      '/特典-色紙/1.jpg',
      '/特典-色紙/2.jpg',
      '/特典-色紙/3.jpg',
      '/特典-色紙/4.jpg',
      '/特典-色紙/5.jpg',
      '/特典-色紙/6.jpg',
      '/特典-色紙/7.jpg',
      '/特典-色紙/8.jpg',
      '/特典-色紙/9.jpg',
      '/特典-色紙/10.jpg',
      '/特典-色紙/11.jpg',
      '/特典-色紙/12.jpg',
      '/特典-色紙/13.jpg',
      '/特典-色紙/14.jpg',
      '/特典-色紙/15.jpg',
      '/特典-色紙/16.jpg',
      '/特典-色紙/17.jpg',
      '/特典-色紙/18.jpg',
      '/特典-色紙/19.jpg',
      '/特典-色紙/20.jpg',
      '/特典-色紙/21.jpg',
      '/特典-色紙/22.jpg',
      '/特典-色紙/23.jpg',
      '/特典-色紙/特典-色紙.jpg',
    ],
    isNew: true,
  },
  {
    id: 'prod-2',
    title: '特典-星見雅の髪飾り',
    subTitle: '星見雅 公式髪飾りレプリカ',
    publishedAt: '2023-02-01',
    handle: 'hoshimi-miyabi',
    vendor: 'APEX TOYS',
    specs: {
      scale: '1/1',
      height: '80mm',
      material: 'PVC, ABS, メタルパーツ',
      releaseDate: '2023年8月',
    },
    description:
      '星見雅の特典髪飾りを完全再現。コスプレやディスプレイに最適な高品質レプリカ。細部までこだわった塗装と造形が魅力です。',
    price: {
      amount: '1500.0',
      currencyCode: 'JPY',
    },
    images: [
      '/特典-星見雅の髪飾り/1.jpg',
      '/特典-星見雅の髪飾り/2.jpg',
      '/特典-星見雅の髪飾り/3.jpg',
      '/特典-星見雅の髪飾り/4.jpg',
      '/特典-星見雅の髪飾り/5.jpg',
      '/特典-星見雅の髪飾り/6.jpg',
      '/特典-星見雅の髪飾り/7.jpg',
      '/特典-星見雅の髪飾り/8.jpg',
      '/特典-星見雅の髪飾り/9.jpg',
      '/特典-星見雅の髪飾り/10.jpg',
      '/特典-星見雅の髪飾り/11.jpg',
      '/特典-星見雅の髪飾り/特典-星見雅の髪飾り.jpg',
    ],
    isPreorder: true,
  },
];
