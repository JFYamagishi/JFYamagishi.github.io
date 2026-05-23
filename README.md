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

- Publications bibliography: `src/data/publications.bib`
- Publication display metadata: `src/data/publication-meta.yaml`
- Notes: `src/content/notes/*.md`
- Site text and navigation: `src/data/site.ts`
- Styles: `src/styles/global.css`

## Publication workflow

Publication data is split into two files.

### 1. `src/data/publications.bib`

Use this file for bibliographic facts that can be exported from Zotero, Google Scholar, or another reference manager:

- title
- author
- year
- journal / booktitle / note
- doi
- url
- eprint

Example:

```bibtex
@article{linear-response-metabolism,
  title = {Linear Response Theory of Evolved Metabolic Systems},
  author = {Yamagishi, Jumpei F. and Hatakeyama, Tetsuhiro S.},
  year = {2023},
  journal = {Physical Review Letters 131, 028401},
  doi = {10.1103/PhysRevLett.131.028401},
  url = {https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.131.028401}
}
```

### 2. `src/data/publication-meta.yaml`

Use this file for website-specific metadata keyed by the BibTeX citation key:

- selected
- type
- venue display override
- links
- English/Japanese summaries

Example:

```yaml
linear-response-metabolism:
  type: peer-reviewed paper
  selected: true
  venue: Physical Review Letters 131, 028401
  links:
    paper: https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.131.028401
    preprint: https://arxiv.org/abs/2210.14508
  summary:
    en: Predictive relations connecting nutrient and drug perturbations to global metabolic responses.
    ja: 栄養や薬剤摂動に対するグローバルな代謝応答を結びつける予測的応答理論。
```

The site merges these two files in `src/lib/publications.ts`.

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
