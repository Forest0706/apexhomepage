# Apex Toys Storefront - 残りのタスク

## 1. 実際のShopifyストアに接続する
- [ ] Shopifyパートナーアカウントと開発ストアを作成します。
- [ ] Shopify管理画面で「Headless」販売チャネルをインストールします。
- [ ] Storefront APIトークンを生成します。
- [ ] `.env` ファイルをストアの認証情報で更新します：
  ```env
  PUBLIC_STORE_DOMAIN="your-shop-name.myshopify.com"
  PUBLIC_STOREFRONT_API_TOKEN="your-storefront-api-token"
  ```

## 2. コンテンツのカスタマイズ
- [ ] デモ製品をShopifyの実際のApex Toys製品に置き換えます。
- [ ] 「注目商品 (Featured)」、「新着商品 (New Arrivals)」、「ARCTECH」などのコレクションを作成します。
- [ ] 必要に応じて `app/routes/($locale)._index.tsx` を更新し、特定のコレクションをクエリするようにします。

## 3. スタイリングとブランディング
- [ ] ロゴを `app/assets/logo.svg` に追加するか、`PageLayout.tsx` を更新してテキストの代わりに画像を使用します。
- [ ] ブランドカラーを `tailwind.config.js` でさらに微調整します。
- [ ] `app/routes/($locale).about.tsx` をより多くのコンテンツと画像で更新します。
- [ ] ARCTECH専用のランディングページを作成することを検討してください。

## 4. デプロイ
- [ ] コードをGitHubにプッシュします。
- [ ] Shopify Oxygen（ホスティング）またはVercelに接続します。
- [ ] ホスティングプロバイダーで環境変数を設定します。
