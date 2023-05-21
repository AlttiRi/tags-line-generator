import typescript from "@rollup/plugin-typescript";

/** @type {import("rollup").RollupOptions} */
const options = {
    input: "src/tags-line-generator.ts",
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
                outDir: "./dist",
                sourceMap: false,
            }
        })
    ]
};

export default options;
