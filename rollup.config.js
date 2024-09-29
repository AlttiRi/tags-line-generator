import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

import {createRequire} from "node:module";
const require = createRequire(import.meta.url);

const packageJson  = require("./package.json");


/** @type {import("rollup").RollupOptions[]} */
const options = [{
    input: "src/main.ts",
    output: {
        file: "dist/tag-line-generator.js",
        format: "es",
        name: "TagLinGen",
    },
    plugins: [
        typescript({
            "compilerOptions": {
                noEmit: false,
                declaration: true,
                outDir: "./dist/dts",
                sourceMap: false,
                declarationMap: true,
            }
        }),
    ],
}, {
    input: "./dist/dts/main.d.ts",
    output: [{
        file: "dist/tag-line-generator.d.ts",
        format: "es",
    }],
    plugins: [
        dts(),
    ],
}, {
    input: "src/main.default.ts",
    output: {
        file: "dist/tag-line-generator.browser.js",
        format: "iife",
        name: "TagLineGenerator",
        exports: "default",
        banner: `/*! TLG v${packageJson.version} */`
    },
    plugins: [
        typescript({
            "compilerOptions": {
                noEmit: false,
                declaration: false,
                outDir: "./dist",
                sourceMap: false,
            }
        }),
    ],
}];

export default options;
