import fs from "fs";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript";

let bundles = [];

const packages = fs.readdirSync("./packages");
for (const pkg of packages) {
  // browser-friendly UMD build
  bundles.push({
    input: `packages/${pkg}/src/index.ts`,
    output: {
      name: `@tokenwrap/${pkg}`,
      file: `bundles/@tokenwrap/${pkg}.js`,
      format: "umd",
      globals: packages.reduce(
        (a, p) =>
          Object.assign(a, {
            [`@tokenwrap/${p}`]: `@tokenwrap/${p}`
          }),
        {}
      )
    },
    external: packages.map(p => `@tokenwrap/${p}`),
    plugins: [
      resolve(), // so Rollup can find node_modules
      commonjs(), // so Rollup can convert node_modules to ES modules
      typescript({ declarationMap: false }) // so Rollup can convert TypeScript to JS
    ]
  });
}

export default bundles;
