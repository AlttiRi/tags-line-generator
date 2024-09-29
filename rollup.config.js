import {nodeResolve} from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

import {createRequire} from "node:module";
const require_ex = createRequire(import.meta.url);

const packageJson = require_ex("./package.json");


/** @type {import("rollup").RollupOptions[]} */
const options = [{
    input: "index.default.ts",
    output: {
        file: "dist/tags-line-generator.browser.js",
        format: "iife",
        name: "TagsLineGenerator",
        exports: "default",
        banner: `/*! TLG v${packageJson.version} */`
    },
    plugins: [
        nodeResolve(),
        typescript({
            "compilerOptions": {
                outDir: "./dist",
                declaration: false,
            }
        }),
    ],
}];

export default options;
