# 店铺政策展示 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在页脚和政策页面正确展示所有店铺政策链接，包括法律声明（特定商取引法に基づく表記）

**Architecture:** 利用已有的 Storefront API 政策查询路由（`policies._index.tsx` / `policies.$policyHandle.tsx`）和 Shopify Pages 路由（`pages.$pageHandle.tsx`），将页脚的占位链接替换为实际路由，并添加法律声明支持。

**Tech Stack:** Shopify Hydrogen (Remix), Storefront API, Tailwind CSS, Shopify Pages

---

### File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `app/components/PageLayout.tsx` | Footer 组件：替换占位链接为实际政策路由，添加更多政策链接 |
| Modify | `app/data/translations.ts` | 添加政策相关的翻译键（三语：ja/zh/en） |
| No change | `app/routes/($locale).policies._index.tsx` | 已有，政策列表页 |
| No change | `app/routes/($locale).policies.$policyHandle.tsx` | 已有，单个政策详情页 |
| No change | `app/routes/($locale).pages.$pageHandle.tsx` | 已有，Shopify Pages 路由（用于法律声明） |

**重要发现：** 政策查询路由和 GraphQL 查询已完整实现，无需新建路由文件。法律声明（特定商取引法に基づく表記）不在 Storefront API 的 `shop` 对象中，需通过 Shopify Pages 创建页面，利用已有的 `pages.$pageHandle.tsx` 路由展示。

---

### Task 1: 更新翻译文件，添加政策相关翻译键

**Files:**
- Modify: `app/data/translations.ts`

- [ ] **Step 1: 在 `ja.footer.social` 中添加政策翻译键**

在 `translations.ja.footer.social` 对象中，将现有的 `privacy`、`terms`、`cookie` 保留，并添加 `refund`、`shipping`、`subscription`、`legalNotice` 键：

```typescript
social: {
  privacy: 'プライバシーポリシー',
  terms: '利用規約',
  cookie: 'Cookie 設定',
  refund: '返金・返品ポリシー',
  shipping: '配送ポリシー',
  subscription: '定期購入のキャンセルポリシー',
  legalNotice: '特定商取引法に基づく表記',
},
```

- [ ] **Step 2: 在 `zh.footer.social` 中添加对应的中文翻译**

```typescript
social: {
  privacy: '隐私政策',
  terms: '服务条款',
  cookie: 'Cookie 设置',
  refund: '退款及退货政策',
  shipping: '配送政策',
  subscription: '订阅取消政策',
  legalNotice: '特定商品交易法标识',
},
```

- [ ] **Step 3: 在 `en.footer.social` 中添加对应的英文翻译**

```typescript
social: {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  cookie: 'Cookie Settings',
  refund: 'Refund Policy',
  shipping: 'Shipping Policy',
  subscription: 'Subscription Cancellation Policy',
  legalNotice: 'Legal Notice',
},
```

- [ ] **Step 4: 验证修改无语法错误**

Run: `npx tsc --noEmit app/data/translations.ts 2>&1 | head -20`
Expected: 无错误输出（或至少无 translations.ts 相关错误）

- [ ] **Step 5: Commit**

```bash
git add app/data/translations.ts
git commit -m "feat: add policy translation keys for footer"
```

---

### Task 2: 更新 Footer 组件，将占位链接替换为实际政策路由

**Files:**
- Modify: `app/components/PageLayout.tsx:545-562`

当前 Footer 底部政策链接区域代码（第 545-562 行）：

```tsx
<div className="border-t border-[#e7e5e4] pt-8 flex flex-col md:flex-row items-center justify-between">
  <p className="text-[#a8a29e] text-xs tracking-wider">
    &copy; {currentYear} Apex-Toys. All rights reserved.
  </p>
  <div className="flex space-x-6 mt-4 md:mt-0">
    <a
      href="#"
      className="text-[#a8a29e] hover:text-[#292524] text-xs transition-colors"
    >
      プライバシーポリシー
    </a>
    <a
      href="#"
      className="text-[#a8a29e] hover:text-[#292524] text-xs transition-colors"
    >
      利用規約
    </a>
  </div>
</div>
```

- [ ] **Step 1: 替换政策链接区域，使用 Link 组件和实际路由路径**

将 `<div className="flex space-x-6 mt-4 md:mt-0">` 内的内容替换为：

```tsx
<div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 md:mt-0">
  <Link
    to="/policies/privacy-policy"
    className="text-[#a8a29e] hover:text-[#292524] text-xs transition-colors"
  >
    プライバシーポリシー
  </Link>
  <Link
    to="/policies/terms-of-service"
    className="text-[#a8a29e] hover:text-[#292524] text-xs transition-colors"
  >
    利用規約
  </Link>
  <Link
    to="/policies/refund-policy"
    className="text-[#a8a29e] hover:text-[#292524] text-xs transition-colors"
  >
    返金・返品ポリシー
  </Link>
  <Link
    to="/policies/shipping-policy"
    className="text-[#a8a29e] hover:text-[#292524] text-xs transition-colors"
  >
    配送ポリシー
  </Link>
  <Link
    to="/pages/legal-notice"
    className="text-[#a8a29e] hover:text-[#292524] text-xs transition-colors"
  >
    特定商取引法に基づく表記
  </Link>
</div>
```

注意：
- 使用 `<Link>` 组件（已从 `~/components/Link` 导入）替代 `<a>` 标签
- `flex space-x-6` 改为 `flex flex-wrap justify-center gap-x-4 gap-y-2`，支持多行换行显示
- 法律声明使用 `/pages/legal-notice` 路径（依赖 Shopify Pages，见 Task 3）
- 政策路由的 handle 遵循 kebab-case 规则，与现有 `$policyHandle.tsx` 中的 camelCase 转换逻辑对应

- [ ] **Step 2: 验证 Link 组件已在 PageLayout.tsx 中导入**

Run: `grep -n "import.*Link" app/components/PageLayout.tsx`
Expected: 已有 `import {Link} from '~/components/Link';` 导入

- [ ] **Step 3: 启动开发服务器验证页脚链接**

Run: `npm run dev`
Expected: 页脚显示所有政策链接，点击可导航到对应页面

- [ ] **Step 4: Commit**

```bash
git add app/components/PageLayout.tsx
git commit -m "feat: update footer policy links to use actual routes"
```

---

### Task 3: 在 Shopify Admin 创建法律声明页面

**Files:**
- No code changes — 这是在 Shopify Admin 中的操作

法律声明（特定商取引法に基づく表記）不在 Storefront API 的 `shop` 查询中，需要通过 Shopify Pages 创建。

- [ ] **Step 1: 在 Shopify Admin 创建页面**

操作路径：Shopify Admin → 在线商店 → 页面 → 添加页面

- 标题：`特定商取引法に基づく表記`
- Handle：`legal-notice`（URL 显示为 `/pages/legal-notice`）
- 内容：填入日本法律要求的商家信息，包括：
  - 販売業者（销售业者名称）
  - 代表責任者（代表责任人）
  - 所在地（所在地）
  - 電話番号（电话号码）
  - 公開メールアドレス（公开邮箱）
  - 販売価格（销售价格）
  - 代金の支払方法（付款方式）
  - 引渡し時期（交付时期）
  - 返品・交換について（退换货）
  - 販売数量（销售数量，如适用）

- [ ] **Step 2: 验证法律声明页面可访问**

访问 `/pages/legal-notice`，确认通过已有的 `($locale).pages.$pageHandle.tsx` 路由正确渲染。

---

### Task 4: 可选 — 在政策列表页添加法律声明链接

**Files:**
- Modify: `app/routes/($locale).policies._index.tsx`

当前政策列表页只展示 Storefront API 返回的政策。法律声明通过 Shopify Pages 提供，不在 `shop` 查询中。可以在列表底部添加一个手动链接。

- [ ] **Step 1: 在政策列表页底部添加法律声明链接**

在 `($locale).policies._index.tsx` 的 `Policies` 组件中，在 policies map 之后添加：

```tsx
<div className="mt-8">
  <Heading className="font-normal text-heading">
    <Link to="/pages/legal-notice">特定商取引法に基づく表記</Link>
  </Heading>
</div>
```

- [ ] **Step 2: 验证政策列表页显示法律声明链接**

访问 `/policies`，确认列表底部显示法律声明链接且可点击。

- [ ] **Step 3: Commit**

```bash
git add app/routes/\(\$locale\).policies._index.tsx
git commit -m "feat: add legal notice link to policies list page"
```

---

### 各政策最终展示位置总结

| 政策 | 路由 | 页脚链接 | 政策列表页 | 备注 |
|------|------|---------|-----------|------|
| 隐私政策 | `/policies/privacy-policy` | ✅ | ✅ | Storefront API |
| 利用規約 | `/policies/terms-of-service` | ✅ | ✅ | Storefront API |
| 返金・返品 | `/policies/refund-policy` | ✅ | ✅ | Storefront API |
| 配送政策 | `/policies/shipping-policy` | ✅ | ✅ | Storefront API |
| 定期購入キャンセル | `/policies/subscription-policy` | ❌ (低频) | ✅ | Storefront API |
| 特定商取引法表記 | `/pages/legal-notice` | ✅ (日本必需) | ✅ | Shopify Pages |
