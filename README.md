# NFT Standard Wrappers

This monorepository is meant to serve as a single-location for wrappers of all different types of
NFT standards such as **dGoods, Simple Assets, ERC721** and others.

## Design choices

### Data type consistency

The `nodeos` software returns inconsistent JS data types (sometimes `number`, sometimes `string`) for the
C++ integer data types used in the contracts. When the integer values are small enough to be represented
as a JS `number` type, it uses that, and when they are larger, it uses `string`. To avoid this inconsistency,
we cast all such fields coming from the contract DB tables to `string`.

### Model classes

Some data types that come from the contract DB tables will be augmented to instances of model classes which
might provide convenience methods on those instances. These classes will also ensure consistency in the returned
JS data types when converting from the C++ ones used in the contract ([as mentioned here](#data-type-consistency)).

### Pagination

Functions that query the blockchain DB tables accept `PaginationOptions` (`lower_bound`, `upper_bound`, `limit`)
to pass over to the `get_table_rows` function on `eosjs`.

The return value will have the same structure returned
by the `get_table_rows` function (`{ rows: any[], more: boolean }`), potentially with rows converted to instances
of a model class for the particular data type.

This will allow the developer to request more rows and paginate over the result set as they would when using
`eosjs` directly.

## Developing

### Adding new packages

**DO NOT use lerna to add new packages.**
Use `npm run create <PACKAGE_NAME>` instead which will set up all the necessary files along with
Typescript support inside of the `packages/` dir.

### Compiling Typescript

`npm run build` or `npm run watch` to build continuously while developing.

### Packaging web bundles

`npm run bundle`

### Running tests

`npm test`
