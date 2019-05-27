const fs = require("fs");

const packages = fs.readdirSync('./packages');
const paths = packages.map(dir => {
    return `packages/${dir}/tsconfig.package.json`
}).join(' ');

const json = JSON.parse(fs.readFileSync("./package.json", {encoding:'utf8'}));
json.scripts.build = `npm run clean:dist && tsc --build ${paths}`;
json.scripts.watch = `${json.scripts.build} --watch`;

fs.writeFileSync('./package.json', JSON.stringify(json, null, 2));

console.log(`Aligned package.json`);
