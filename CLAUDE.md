# LBN 万能网站 (lbprime.github.io)

在线开发者工具集合，托管在 GitHub Pages 的**纯静态站点**（无构建、无后端）。每个工具是一个独立 HTML 文件，数据在浏览器本地处理，不上传服务器。

## 技术栈约定（强制）

- **新增或修改工具页，一律用 Vue 3 + Element Plus**，以 CDN 全局构建方式挂载（非工程化、非 SFC）。
- 相关库**必须本地化**到 `assets/libs/`，页面用绝对路径 `/assets/libs/...` 引用，**禁止外链 CDN**。
- 首页 `index.html` 是入口导航页，保留原生 JS；其余工具页统一 Vue + Element Plus。

## 目录结构

```
index.html                # 首页导航（原生 JS，从 tools.json 读工具清单）
pages/*.html              # 工具页，一个工具一个文件
pages/disabled/           # 已下线工具（移到这里，不参与 sitemap 收录）
assets/libs/              # 本地第三方库：vue、element-plus、codemirror、monaco-editor、
                          #   crypto-js、js-beautify、jshint、sql-formatter、node-sql-parser、terser、prism
assets/images/            # 图片：og-image.png、打赏二维码 donate-*.png
.github/workflows/static.yml  # 部署 + 自动生成 sitemap.xml 和 tools.json
```

## 新增工具页 checklist

1. 在 `pages/` 下新建 `xxx.html`（文件名即 URL，kebab-case）。
2. 以现有工具页（如 `pages/hash.html`）为模板，保留完整 SEO 头部：
   `<title>`、`<meta name="description">`、`<meta name="keywords">`，以及 og / twitter / canonical / favicon / ld+json。
   **这些 meta 会被 CI 自动抓取，生成 sitemap.xml（loc/lastmod）和 tools.json（首页导航数据源），必须写全且内容真实**。
3. 引入本地库：
   ```html
   <link rel="stylesheet" href="/assets/libs/element-plus/element-plus.index.css">
   <script src="/assets/libs/vue/vue.global.prod.js"></script>
   <script src="/assets/libs/element-plus/element-plus.index.full.min.js"></script>
   <script src="/assets/libs/element-plus/element-plus.icons.iife.min.js"></script>
   ```
   需要代码编辑/高亮用 `codemirror` 或 `monaco-editor`；哈希用 `crypto-js`；格式化用 `js-beautify` / `sql-formatter`。**先查 `assets/libs/` 是否已有，复用，不重复引入**。
4. 挂载 Vue：
   ```js
   const { createApp } = Vue;
   const app = createApp({ /* data / methods */ });
   app.use(ElementPlus);
   app.mount('#app');
   ```
5. **数据只在浏览器本地处理，不得上传任何服务**（站点核心卖点，也是隐私承诺）。
6. 如需打赏入口，沿用现有 donate sidebar 样式，引用 `assets/images/donate-*.png`。

## sitemap.xml 与 tools.json 由 CI 自动生成，勿手改

- `sitemap.xml` 和 `tools.json` 均已在 `.gitignore` 中，由 `.github/workflows/static.yml` 部署时扫描 `pages/*.html` 自动生成。
- `sitemap.xml` 遵循标准 sitemaps.org 0.9 协议，仅含 `loc` / `lastmod`，同时服务 Google 和 Bing；**不得添加自定义标签或命名空间**。
- `tools.json` 是首页导航的数据源，提取各工具页的 title / description 生成工具卡片。
- 新增页面**无需也不应**手动更新这两个文件；页面 meta 写全后 push 到 main 即自动收录。
- 首页导航从 `/tools.json` 读工具卡片，本地无该文件时首页显示「加载失败」属正常现象。

## 验证

纯静态站点，无构建步骤。改完本地验证：
- 直接浏览器打开对应 HTML，或 `python -m http.server` 起本地服务访问。
- 确认功能正常、meta 完整、无外链资源（F12 网络面板无 CDN 请求）。
