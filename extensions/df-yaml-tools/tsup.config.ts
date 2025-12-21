import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/extension.ts'],
	format: ['cjs'],
	splitting: false,
	dts: false,
	target: 'node18',
	external: ['vscode'],
	noExternal: ['yaml'],
	minify: false,
	sourcemap: true
});
