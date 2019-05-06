# NFT Standard Wrappers

This monorepository is meant to serve as a single-location for wrappers of all different types of
NFT standards such as **dGoods, Simple Assets, ERC721** and others.





## Adding new packages

**DO NOT use lerna to add new packages.**
Use `npm run create <PACKAGE_NAME>` instead which will set up all the necessary files along with
Typescript support inside of the `packages/` dir.

## Compiling Typescript
`lerna run tsc`

## Packaging web bundles
`npm run pack`

## Running tests
`npm run test`


