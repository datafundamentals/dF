"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsup_1 = require("tsup");
exports.default = (0, tsup_1.defineConfig)({
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
//# sourceMappingURL=tsup.config.js.map