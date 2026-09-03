import { configureProductIndex } from "./search-schema.js";

await configureProductIndex();

console.log("Configured products_v1 index");
process.exit(0);
