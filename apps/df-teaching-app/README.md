# DF Practice App

Signal-driven host for the `df-practice-widget`. In the Data Fundamentals monorepo you can run the end-to-end flow checks with:

```bash
pnpm --filter @df/df-teaching-app test
```

The Playwright suite exercises the default task hydration, host-level reset button, and the recovery path after forcing the widget into an error state. The tests rely on the `start:test` script defined in `package.json`, which builds the TypeScript sources before launching Vite in test mode on port 4174.
