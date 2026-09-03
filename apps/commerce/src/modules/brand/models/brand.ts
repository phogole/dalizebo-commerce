import { model } from "@medusajs/framework/utils";

/**
 * Commerce-owned brand identity. Editorial fields belong in Strapi; this
 * record exists so products can refer to a stable commerce brand key.
 */
export const Brand = model.define("brand", {
  id: model.id().primaryKey(),
  name: model.text(),
  handle: model.text(),
});

