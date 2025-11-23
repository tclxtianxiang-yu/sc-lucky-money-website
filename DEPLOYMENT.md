# Website 部署指南

本指南将帮助您将 LuckyMoney 网站部署到 Cloudflare Pages（推荐）或 Cloudflare Workers。

> **注意**：Next.js App Router 项目更适合部署到 Cloudflare Pages，而不是 Workers。

## 方案选择

| 方案 | 优势 | 劣势 | 推荐 |
|------|------|------|------|
| **Cloudflare Pages** | - 免费<br>- 自动构建<br>- 全面支持 Next.js | - 需要 Git 集成 | ✅ 推荐 |
| Vercel | - 官方推荐<br>- 零配置 | - 国内访问慢 | 备选 |
| Cloudflare Workers | - 边缘计算 | - 需要适配器<br>- 配置复杂 | 不推荐 |

## 部署到 Cloudflare Pages（推荐）

### 前置准备

1. **创建 Cloudflare 账户**
   - 访问 [Cloudflare](https://www.cloudflare.com/)
   - 注册免费账户

2. **推送代码到 Git**
   ```bash
   cd sc-lucky-money-website
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GIT_REPO_URL
   git push -u origin main
   ```

### 部署步骤

### 1. 连接 Git 仓库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 前往 **Pages**
3. 点击 **Create a project**
4. 选择 **Connect to Git**
5. 授权并选择您的仓库（`sc-lucky-money-website`）

### 2. 配置构建设置

在 Cloudflare Pages 配置页面：

| 配置项 | 值 |
|--------|-----|
| **Framework preset** | Next.js |
| **Build command** | `npm run build` |
| **Build output directory** | `.next` |
| **Root directory** | `/` |
| **Node version** | `18` 或 `20` |

### 3. 设置环境变量

在 **Settings → Environment Variables** 中添加：

```env
# Subgraph 查询 URL
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/YOUR_ID/lucky-money/version/latest

# 如果使用去中心化网络
# NEXT_PUBLIC_SUBGRAPH_URL=https://gateway.thegraph.com/api/YOUR_API_KEY/subgraphs/id/YOUR_SUBGRAPH_ID

# 可选：Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### 4. 部署

1. 点击 **Save and Deploy**
2. 等待构建完成（通常 2-5 分钟）
3. 部署成功后获得 URL：`https://your-project.pages.dev`

### 5. 配置自定义域名（可选）

1. 在 Pages 项目中，前往 **Custom domains**
2. 添加您的域名（例如：`luckymoney.yourdomain.com`）
3. 按照指引配置 DNS CNAME 记录
4. 等待 SSL 证书自动签发

## 更新代码配置

### 1. 更新合约地址

确保以下文件中的合约地址是 Sepolia 测试网地址：

- `src/app/page.tsx`
- `src/components/OwnerDashboard.tsx`
- `src/components/UserDashboard.tsx`

```typescript
const CONTRACT_ADDRESS = '0xYOUR_SEPOLIA_CONTRACT_ADDRESS'
```

### 2. 更新 Wagmi 配置

在 `src/config/wagmi.ts` 中，移除 `hardhat` 链：

```typescript
import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [sepolia, mainnet],  // 移除 hardhat
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
})
```

### 3. 创建 `.env.local`

在 `sc-lucky-money-website` 目录创建 `.env.local`:

```env
# Subgraph URL
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/YOUR_ID/lucky-money/version/latest

# WalletConnect Project ID（可选）
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### 4. 更新 `.gitignore`

确保不提交敏感文件：

```gitignore
# Local env files
.env*.local
.env

# Next.js
.next/
out/
build/
```

## 本地测试生产构建

部署前在本地测试：

```bash
# 安装依赖
npm install

# 生产构建
npm run build

# 本地预览
npm start
```

访问 `http://localhost:3000` 验证功能正常。

## 部署到 Vercel（备选方案）

### 快速部署

1. 访问 [Vercel](https://vercel.com/)
2. 使用 GitHub 登录
3. 点击 **New Project**
4. 选择您的仓库
5. Vercel 会自动检测 Next.js 配置
6. 添加环境变量（同上）
7. 点击 **Deploy**

### 环境变量

在 Vercel Dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/...
```

## 部署到 Cloudflare Workers（高级）

> **注意**：需要使用 `@cloudflare/next-on-pages` 适配器。

### 1. 安装适配器

```bash
npm install --save-dev @cloudflare/next-on-pages
```

### 2. 配置 `wrangler.toml`

创建 `wrangler.toml`:

```toml
name = "lucky-money-website"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".vercel/output/static"

[env.production]
vars = { NEXT_PUBLIC_SUBGRAPH_URL = "https://api.studio.thegraph.com/query/..." }
```

### 3. 修改 `package.json`

```json
{
  "scripts": {
    "pages:build": "npx @cloudflare/next-on-pages",
    "pages:deploy": "npm run pages:build && wrangler pages deploy .vercel/output/static",
    "pages:dev": "npx @cloudflare/next-on-pages --watch"
  }
}
```

### 4. 部署

```bash
npm run pages:deploy
```

## 性能优化

### 1. 图片优化

使用 Next.js Image 组件：

```tsx
import Image from 'next/image'

<Image src="/logo.png" alt="Logo" width={200} height={50} />
```

### 2. 代码分割

使用动态导入：

```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
})
```

### 3. 缓存策略

在 `next.config.js` 中：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-cdn.com'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

## 监控与分析

### Cloudflare Analytics

Cloudflare Pages 自带基础分析：
- 访问量
- 带宽使用
- 错误率

### 集成 Google Analytics（可选）

```tsx
// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## 故障排除

### 构建失败

**错误：Module not found**
```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

**错误：Out of memory**
- 在 Cloudflare Pages 设置中增加 Node.js 内存
- 或优化代码，减少依赖

### 运行时错误

**错误：API 请求失败**
- 检查环境变量是否正确设置
- 确认 Subgraph URL 可访问
- 查看浏览器 Console 获取详细错误

### CORS 问题

如果遇到 CORS 错误：
```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
      ],
    },
  ]
}
```

## 成本估算

### Cloudflare Pages（免费层）

- **构建时间**: 500 分钟/月
- **部署次数**: 无限制
- **带宽**: 无限制
- **自定义域名**: 免费
- **SSL 证书**: 免费

### 升级到 Pro（$20/月）

- 更长构建时间
- 优先支持
- 高级分析

## 安全检查清单

- [ ] 环境变量已正确配置
- [ ] 敏感信息未提交到 Git
- [ ] HTTPS 已启用
- [ ] Content Security Policy 已配置
- [ ] API 端点已验证访问权限

## 相关链接

- [Cloudflare Pages](https://pages.cloudflare.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel](https://vercel.com/)
- [@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages)
