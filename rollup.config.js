import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import packageJson from "./package.json" assert {type: "json"};


/** @type {import("rollup").RollupOptions[]} */
const options = [{
    input: "src/main.ts",
    output: {
        file: "dist/tags-line-generator.js",
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
        file: "dist/tags-line-generator.d.ts",
        format: "es",
    }],
    plugins: [
        dts(),
    ],
}, {
    input: "src/main.default.ts",
    output: {
        file: "dist/tags-line-generator.browser.js",
        format: "iife",
        name: "TagsLineGenerator",
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
