import { search } from "../lib/dependencies.js";
import { PRODUCT_INDEX, productIndexSettings } from "../lib/search-document.js";

export async function configureProductIndex() {
  return search.index(PRODUCT_INDEX).updateSettings(productIndexSettings);
}
