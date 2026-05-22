# Jumpei Yamagishi — Astro homepage prototype

A lightweight bilingual researcher homepage for GitHub Pages.

## Local preview

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Content editing

- Publications: `src/data/publications.yaml`
- Notes: `src/content/notes/*.md`
- Site text and navigation: `src/data/site.ts`
- Styles: `src/styles/global.css`

## GitHub Pages

For a user/organization site such as `jfyamagishi.github.io`, keep `astro.config.mjs` without `base`.
For a project site such as `username.github.io/repo-name`, set:

```js
export default defineConfig({
  site: 'https://username.github.io',
  base: '/repo-name',
  integrations: [mdx()]
});
```
