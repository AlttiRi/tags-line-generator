import typescript from "@rollup/plugin-typescript";

/** @type {import("rollup").RollupOptions} */
const options = {
    input: "src/tags-line-generator.default.ts",
    output: {
        file: "dist/tags-line-generator.browser.js",
        format: "iife",
        name: "TagsLineGenerator",
        exports: "default",
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
};

export default options;
