/***
 * Creates a new package and sets up Typescript support automatically.
 * @type {module:fs}
 */

const fs = require("fs");

// Added to each package to provide typescript compilation
const TS_CONFIG = {
  extends: "../../tsconfig.json",
  compilerOptions: { outDir: "./dist" },
  include: ["./src/index.ts"]
};

const getPackageDirectory = (packageName = "") => `./packages/${packageName}`;

const args = process.argv.slice(2);
const PACKAGE_NAME = args[0];
const PACKAGE_DIR = getPackageDirectory(PACKAGE_NAME);

const PACKAGE_JSON = {
  name: PACKAGE_NAME,
  version: "0.0.0",
  author: "GetScatter Ltd.",
  license: "MIT",
  main: "dist/index.js",
  directories: { lib: "dist", test: "__tests__" },
  files: ["dist"],
  scripts: {
    build: 'echo "Error: build from root" && exit 1',
    test: 'echo "Error: run tests from root" && exit 1'
  }
};

if (fs.existsSync(PACKAGE_DIR)) {
  console.error("A package with this name already exists");
  process.exit(0);
}

console.log(`Creating package: ${PACKAGE_NAME} at ${PACKAGE_DIR}`);

fs.mkdirSync(PACKAGE_DIR);
fs.mkdirSync(`${PACKAGE_DIR}/src`);
fs.mkdirSync(`${PACKAGE_DIR}/__tests__`);
fs.writeFileSync(`${PACKAGE_DIR}/__tests__/${PACKAGE_NAME}.spec.ts`, "");
fs.writeFileSync(
  `${PACKAGE_DIR}/package.json`,
  JSON.stringify(PACKAGE_JSON, null, 2)
);
fs.writeFileSync(`${PACKAGE_DIR}/README.md`, `# ${PACKAGE_NAME}`);
fs.writeFileSync(
  `${PACKAGE_DIR}/tsconfig.json`,
  JSON.stringify(TS_CONFIG, null, 2)
);
fs.writeFileSync(`${PACKAGE_DIR}/src/index.ts`, "");

console.log(`Successfully created package ${PACKAGE_NAME}`);
