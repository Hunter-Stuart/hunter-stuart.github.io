import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://hunter-stuart.github.io',
  output: 'static',
  trailingSlash: 'never',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      // 双主题：由 CSS 变量在 data-theme 切换时取用，不额外加载样式表。
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
