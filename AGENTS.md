# AGENTS.md - Apex HomePage (Shopify Hydrogen)

## 开发命令

```bash
npm run dev          # 开发服务器 (自动运行 codegen)
npm run build        # 生产构建 (自动运行 codegen)
npm run preview      # 预览构建结果
npm run lint         # ESLint 检查
npm run format       # Prettier 格式化
npm run format:check # Prettier 检查
npm run typecheck    # TypeScript 类型检查
npm run e2e          # Playwright E2E 测试
npm run e2e:ui       # Playwright UI 模式
```

## CI 流程

`lint → format → typecheck → e2e` (并行执行，按分组取消)

## 重要配置

- **Node 版本**: `v18` (见 `.nvmrc`)
- **路径别名**: `~/*` → `app/*`
- **环境变量**: 需要 `.env` 包含:
  - `PUBLIC_STORE_DOMAIN`
  - `PUBLIC_STOREFRONT_API_TOKEN`

## 项目架构

- Shopify Hydrogen + Remix 电商模板
- 部署目标: Shopify Oxygen
- GraphQL 类型自动生成 (codegen)

## 注意事项

- `dev` 和 `build` 命令自动触发 GraphQL codegen
- Playwright 测试需要 Shopify 商店连接才能运行完整 E2E
