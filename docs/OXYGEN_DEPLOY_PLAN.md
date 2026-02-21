# APEX 首页 → Shopify + Oxygen 部署计划

你已注册 Shopify，准备用 **Oxygen**（Shopify 为 Hydrogen 提供的托管）上线。按下面步骤做即可。

---

## 一、在 Shopify 后台做的事

### 1. 安装 Headless 渠道（如尚未安装）

1. 登录 [Shopify 管理后台](https://admin.shopify.com)
2. **设置 → 应用和销售渠道** → 添加 **Headless**（或 **Hydrogen**）销售渠道
3. 按提示完成安装，会为你创建一个 **Storefront（店铺前台）**

### 2. 记下你的 Storefront 信息

- 在 **Headless / Hydrogen** 渠道里会看到：
  - **Storefront 名称**（例如 Apex Homepage）
  - **Storefront ID**（数字，如 `1000013955`）
- 之后在 **环境与变量** 里会用到这里的 API 凭证

### 3. 环境变量（Oxygen 用）

- 进入该 Storefront 的 **环境与变量 / Environments and variables**
- Oxygen 会自动为 Production / Preview 等环境配置好：
  - `SESSION_SECRET`
  - `PUBLIC_STORE_DOMAIN`
  - `PUBLIC_STOREFRONT_API_TOKEN`
  - `PRIVATE_STOREFRONT_API_TOKEN`
  - `PUBLIC_STOREFRONT_ID`
  - `PUBLIC_CUSTOMER_ACCOUNT_*`、`SHOP_ID` 等
- **无需在本地把 .env 提交到 Git**；部署时 Oxygen 会用后台里配置的变量。

---

## 二、本地：把项目和你自己的店铺连起来

### 1. 登录 Shopify CLI

在项目根目录执行：

```bash
cd /Users/lilinzi/Apex-homepage/apexhomepage
npx shopify auth login --store 你的店铺.myshopify.com
```

按提示在浏览器完成登录（替换成你的店铺域名）。

### 2. 关联当前项目到 Storefront（若未关联）

```bash
npx shopify hydrogen link
```

选择你刚在后台创建/使用的 **Storefront**，完成关联。

### 3. 拉取环境变量到本地 .env（方便本地开发）

```bash
npx shopify hydrogen env pull
```

会生成/覆盖 `.env`，里面是当前 Storefront 的正式凭证，本地 `npm run dev` 会用到。

---

## 三、部署到 Oxygen 的两种方式

### 方式 A：GitHub 自动部署（推荐）

每次 **push 到 GitHub** 就自动构建并部署到 Oxygen。

1. **把仓库推到 GitHub**
   - 若还没推：在 GitHub 新建仓库，然后 `git remote add origin <url>`、`git push -u origin main`

2. **在 Shopify 里连接 GitHub**
   - 管理后台 → 你的 **Headless/Hydrogen Storefront** → **部署 / Deployments**
   - 选择 **连接 GitHub**，授权并选中 `Apex-homepage/apexhomepage`（或你的仓库名）
   - 连接成功后，Shopify 会为这个 Storefront 生成 **Deployment token**

3. **在 GitHub 配置 Secret**
   - 仓库 → **Settings → Secrets and variables → Actions**
   - 新增 Secret：
     - **Name**: `OXYGEN_DEPLOYMENT_TOKEN_你的StorefrontID`
       - 例如若 Storefront ID 是 `1234567890`，则填：`OXYGEN_DEPLOYMENT_TOKEN_1234567890`
     - **Value**: 在 Shopify 部署页面复制给你的 **Deployment token**

4. **更新 GitHub Actions 工作流（重要）**
   - 当前仓库里已有 `.github/workflows/oxygen-deployment-1000013955.yml`，其中的 `1000013955` 是模板自带的 Storefront ID。
   - 你的 Storefront ID 不同时，需要二选一：
     - **选项 1**：在 Shopify 部署页按提示「用 Shopify 生成 workflow」，用生成的新 yml 替换现有 `oxygen-deployment-*.yml`；或  
     - **选项 2**：把现有 yml 里的 `1000013955` 全部改成你的 Storefront ID，并把 Secret 名改为 `OXYGEN_DEPLOYMENT_TOKEN_<你的ID>`。

5. **触发部署**
   - 改完 workflow 和 Secret 后，`git push` 到对应分支，Actions 会自动跑「Build and Publish to Oxygen」，部署完成后在 Shopify 部署页可以看到预览/生产 URL。

### 方式 B：用 CLI 手动部署

不依赖 GitHub，本地直接推到 Oxygen：

```bash
npx shopify hydrogen deploy
```

按提示选择 Storefront、环境（Production/Preview）。部署完成后会给出一个 **.oxygen 的预览 URL**。

适合：临时预览、不想先配 GitHub 时使用。

---

## 四、部署后建议检查

| 项目 | 说明 |
|------|------|
| 环境变量 | 在 Shopify Storefront 的「环境与变量」确认 Production/Preview 的变量完整（尤其 `SESSION_SECRET`、Storefront API 相关） |
| 首页与导航 | 打开部署 URL，确认首页、导航栏、商品区块正常（不再走本地 fallback 布局） |
| 商品数据 | 若仍用本地 mock 数据，需在后台配置商品/Collection 并让 Hydrogen 从 Storefront API 拉取 |
| 自定义域名（可选） | 在 Storefront 设置里绑定自己的域名，并按提示做 DNS |

---

## 五、当前项目需注意的点

1. **workflow 里的 Storefront ID**  
   若你新建的 Storefront ID 不是 `1000013955`，务必改 workflow 文件名和内容里的 ID，以及 GitHub Secret 名称，否则会部署到错误的 Storefront 或报错。

2. **.env 不要提交**  
   `.env` 已在 .gitignore；生产环境用 Shopify 后台的变量，本地用 `hydrogen env pull` 即可。

3. **E2E 测试**  
   现有 workflow 里有 `end-to-end-tests` 步骤，若暂时不需要可先注释或删除该 step，避免因测试失败阻断部署。

---

## 六、步骤小结（按顺序做）

1. 在 Shopify 后台安装 Headless 渠道，创建/确认 Storefront，记下 Storefront ID。  
2. 本地：`npx shopify auth login` → `npx shopify hydrogen link` → `npx shopify hydrogen env pull`。  
3. 选一种部署方式：  
   - **GitHub**：仓库推 GitHub → 后台连接该仓库 → 复制 Deployment token → 在 GitHub 配 Secret → 更新 workflow 中的 Storefront ID 与 Secret 名 → push 触发部署。  
   - **CLI**：直接 `npx shopify hydrogen deploy`。  
4. 在部署 URL 上检查首页、导航、环境变量是否正常，再按需配置域名和商品数据。

如果你告诉我「打算用 GitHub 还是只用 CLI」，以及你的 **Storefront ID**（在后台 Headless 渠道里能看到），我可以按你当前仓库结构，写出要改的 workflow 具体内容和 Secret 名称。
