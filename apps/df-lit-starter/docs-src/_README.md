This directory contains the sources for the static site generated in `/apps/df-lit-starter/docs/`. The site is based on the [Eleventy](https://www.11ty.dev) static site generator and is preserved for parity with the upstream `lit-starter-ts` template.

Useful scripts:

```bash
pnpm --filter @df/df-lit-starter run docs        # build the site
pnpm --filter @df/df-lit-starter run docs:serve  # serve locally
pnpm --filter @df/df-lit-starter run docs:gen:watch  # rebuild on change
```

To publish via GitHub Pages, point the project to the `/docs` folder on the default branch, matching the upstream starter instructions.
