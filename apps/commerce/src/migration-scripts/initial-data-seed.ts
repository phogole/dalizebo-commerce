import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
  MedusaError,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductOptionsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";
import { BRAND_MODULE } from "../modules/brand/index.js";
import BrandModuleService from "../modules/brand/service.js";

type SeedRecord = {
  id: string;
  [key: string]: unknown;
};

type GraphResult = {
  data: SeedRecord[];
};

/**
 * Dalizebo's bootstrap commerce data. Run against a Medusa database with
 * `medusa exec ./src/migration-scripts/initial-data-seed.ts`; stable records
 * are looked up before creation so reruns do not duplicate the seed.
 *
 * Medusa's product and shipping workflows accept major-unit decimal prices;
 * the BFF converts those values to Dalizebo's integer minor-unit API contract.
 */
export default async function initialDataSeed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT,
  );

  const graph = async (
    entity: string,
    fields: string[],
    filters?: Record<string, unknown>,
  ): Promise<SeedRecord[]> => {
    const result = (await query.graph({
      entity,
      fields,
      ...(filters ? { filters } : {}),
    } as never)) as GraphResult;
    return result.data;
  };

  const first = async (
    entity: string,
    fields: string[],
    filters?: Record<string, unknown>,
  ): Promise<SeedRecord | undefined> =>
    (await graph(entity, fields, filters))[0];

  logger.info("Seeding Dalizebo Commerce store data...");
  const existingSalesChannel = await first("sales_channel", ["id", "name"], {
    name: "Web",
  });
  let salesChannelId = existingSalesChannel?.id;
  if (!salesChannelId) {
    const {
      result: [salesChannel],
    } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          { name: "Web", description: "Dalizebo online storefront" },
        ],
      },
    });
    salesChannelId = salesChannel.id;
  }

  const publishableApiKeys = await graph(
    "api_key",
    ["id", "title", "type", "revoked_at"],
    {
      title: "Dalizebo Web Storefront",
      type: "publishable",
    },
  );
  const existingPublishableApiKey = publishableApiKeys.find(
    (key) => key.revoked_at == null,
  );
  let publishableApiKeyId = existingPublishableApiKey?.id;
  if (!publishableApiKeyId) {
    const {
      result: [publishableApiKey],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Dalizebo Web Storefront",
            type: "publishable",
            created_by: "seed",
          },
        ],
      },
    });
    publishableApiKeyId = publishableApiKey.id;
  }
  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: { id: publishableApiKeyId, add: [salesChannelId] },
  });

  const existingStore = await first("store", ["id", "name"], {
    name: "Dalizebo Commerce",
  });
  let storeName = "Dalizebo Commerce";
  if (!existingStore) {
    const {
      result: [store],
    } = await createStoresWorkflow(container).run({
      input: {
        stores: [
          {
            name: storeName,
            supported_currencies: [{ currency_code: "zar", is_default: true }],
            default_sales_channel_id: salesChannelId,
          },
        ],
      },
    });
    storeName = store.name;
  }

  const existingRegion = await first(
    "region",
    ["id", "name", "currency_code"],
    { name: "South Africa" },
  );
  let regionId = existingRegion?.id;
  if (!regionId) {
    const {
      result: [region],
    } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "South Africa",
            currency_code: "zar",
            countries: ["za"],
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    regionId = region.id;
  }

  const existingTaxRegion = await first(
    "tax_region",
    ["id", "country_code", "provider_id"],
    { country_code: "za" },
  );
  if (!existingTaxRegion) {
    await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: "za", provider_id: "tp_system" }],
    });
  }

  const existingStockLocation = await first("stock_location", ["id", "name"], {
    name: "Johannesburg Warehouse",
  });
  let stockLocationId = existingStockLocation?.id;
  if (!stockLocationId) {
    const {
      result: [stockLocation],
    } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "Johannesburg Warehouse",
            address: {
              city: "Johannesburg",
              country_code: "ZA",
              address_1: "",
            },
          },
        ],
      },
    });
    stockLocationId = stockLocation.id;
  }
  if (
    !salesChannelId ||
    !publishableApiKeyId ||
    !regionId ||
    !stockLocationId
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "DALIZEBO_SEED_REQUIRED_IDS_NOT_CREATED",
    );
  }
  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: stockLocationId, add: [salesChannelId] },
  });

  const shippingProfiles = await graph("shipping_profile", ["id"]);
  const shippingProfile = shippingProfiles[0];
  if (!shippingProfile) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "MEDUSA_SHIPPING_PROFILE_NOT_FOUND",
    );
  }

  const existingFulfillmentSet = await first(
    "fulfillment_set",
    ["id", "service_zones.id"],
    { name: "Johannesburg delivery" },
  );
  let fulfillmentSetId = existingFulfillmentSet?.id;
  let serviceZoneId = (
    existingFulfillmentSet?.service_zones as Array<{ id?: unknown }> | undefined
  )?.find((zone) => typeof zone?.id === "string")?.id as string | undefined;
  if (!fulfillmentSetId) {
    const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets(
      {
        name: "Johannesburg delivery",
        type: "shipping",
        service_zones: [
          {
            name: "South Africa",
            geo_zones: [{ country_code: "za", type: "country" }],
          },
        ],
      },
    );
    fulfillmentSetId = fulfillmentSet.id;
    serviceZoneId = fulfillmentSet.service_zones[0]?.id;
  }
  if (fulfillmentSetId && !serviceZoneId) {
    const existingServiceZone = await first(
      "service_zone",
      ["id", "fulfillment_set_id"],
      { fulfillment_set_id: fulfillmentSetId },
    );
    serviceZoneId = existingServiceZone?.id;
  }
  if (!fulfillmentSetId || !serviceZoneId) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "MEDUSA_SERVICE_ZONE_NOT_CREATED",
    );
  }
  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocationId },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
      fulfillment_set_id: fulfillmentSetId,
    },
  });
  const existingShippingOption = await first("shipping_option", ["id"], {
    name: "Standard Shipping",
    service_zone_id: serviceZoneId,
  });
  if (!existingShippingOption) {
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standard Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: serviceZoneId,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Standard",
            description: "Delivery in 2–4 business days",
            code: "standard",
          },
          prices: [{ currency_code: "zar", amount: 85, region_id: regionId }],
          rules: [
            { attribute: "enabled_in_store", value: "true", operator: "eq" },
            { attribute: "is_return", value: "false", operator: "eq" },
          ],
        },
      ],
    });
  }

  const existingCategory = await first(
    "product_category",
    ["id", "name", "handle"],
    { handle: "clothing" },
  );
  let categoryId = existingCategory?.id;
  if (!categoryId) {
    const {
      result: [category],
    } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [
          { name: "Clothing", handle: "clothing", is_active: true },
        ],
      },
    });
    categoryId = category.id;
  }

  const existingSizeOption = await first("product_option", ["id", "title"], {
    title: "Size",
  });
  const existingColorOption = await first("product_option", ["id", "title"], {
    title: "Color",
  });
  let sizeOptionId = existingSizeOption?.id;
  let colorOptionId = existingColorOption?.id;
  if (!sizeOptionId || !colorOptionId) {
    const missingOptions = [
      ...(!sizeOptionId
        ? [{ title: "Size", values: ["S", "M", "L", "XL"] }]
        : []),
      ...(!colorOptionId ? [{ title: "Color", values: ["Black"] }] : []),
    ];
    const { result: options } = await createProductOptionsWorkflow(
      container,
    ).run({
      input: { product_options: missingOptions },
    });
    sizeOptionId ??= options.find((option) => option.title === "Size")?.id;
    colorOptionId ??= options.find((option) => option.title === "Color")?.id;
  }
  if (!categoryId || !sizeOptionId || !colorOptionId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "MEDUSA_PRODUCT_OPTIONS_NOT_CREATED",
    );
  }

  const brandModuleService = container.resolve(
    BRAND_MODULE,
  ) as BrandModuleService;
  const [existingBrand] = await brandModuleService.listBrands({
    handle: "dalizebo",
  });
  const brand =
    existingBrand ??
    (await brandModuleService.createBrands({
      name: "Dalizebo",
      handle: "dalizebo",
    }));

  const existingProduct = await first("product", ["id", "handle"], {
    handle: "dalizebo-essential-tee",
  });
  let productId = existingProduct?.id;
  if (!productId) {
    const {
      result: [product],
    } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: "Dalizebo Essential Tee",
            handle: "dalizebo-essential-tee",
            status: ProductStatus.PUBLISHED,
            description: "A premium everyday essential from Dalizebo Commerce.",
            weight: 220,
            metadata: {
              brand: "Dalizebo",
              brand_key: "dalizebo",
              brand_id: brand.id,
            },
            category_ids: [categoryId],
            shipping_profile_id: shippingProfile.id,
            options: [{ id: sizeOptionId }, { id: colorOptionId }],
            sales_channels: [{ id: salesChannelId }],
            variants: [
              {
                title: "M / Black",
                sku: "DAL-TEE-BLK-M",
                options: { Size: "M", Color: "Black" },
                prices: [{ amount: 1299.99, currency_code: "zar" }],
              },
            ],
          },
        ],
      },
    });
    productId = product.id;
  }
  if (!productId) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "MEDUSA_PRODUCT_NOT_CREATED",
    );
  }
  await link.create({
    [Modules.PRODUCT]: { product_id: productId },
    [BRAND_MODULE]: { brand_id: brand.id },
  });

  const variants = await graph("product_variant", ["id", "sku"], {
    product_id: productId,
  });
  const variantIds = variants.map((variant) => variant.id);
  const variantInventoryLinks =
    variantIds.length > 0
      ? await graph(
          "product_variant_inventory_item",
          ["variant_id", "inventory_item_id"],
          { variant_id: variantIds },
        )
      : [];
  const inventoryItemIds = [
    ...new Set(
      variantInventoryLinks
        .map((item) => item.inventory_item_id)
        .filter((id): id is string => typeof id === "string"),
    ),
  ];
  const existingInventoryLevels =
    inventoryItemIds.length > 0
      ? await graph(
          "inventory_level",
          ["id", "inventory_item_id", "location_id"],
          { location_id: stockLocationId, inventory_item_id: inventoryItemIds },
        )
      : [];
  const existingInventoryItemIds = new Set(
    existingInventoryLevels.map((level) => level.inventory_item_id),
  );
  const missingInventoryItemIds = inventoryItemIds.filter(
    (inventoryItemId) => !existingInventoryItemIds.has(inventoryItemId),
  );
  if (missingInventoryItemIds.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: missingInventoryItemIds.map((inventoryItemId) => ({
          location_id: stockLocationId,
          stocked_quantity: 100,
          inventory_item_id: inventoryItemId,
        })),
      },
    });
  }
  logger.info(
    `Dalizebo seed complete for ${storeName} (${inventoryItemIds.length} inventory items).`,
  );
}
