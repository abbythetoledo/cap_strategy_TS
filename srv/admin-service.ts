const cds = require("@sap/cds");
const logger = cds.log("OrderService");
import { Request, Transaction } from "@sap/cds";
const { create } = require("./lib/crud");

module.exports = class AdminService extends cds.ApplicationService {
  init() {
    this.on(
      "addProductCategory",
      async (req: Request) => await addCategory(req)
    );

    this.on("addProducts", async (req: Request) => await addProduct(req));

    async function addCategory(
      req: Request
    ): Promise<ResponseData<ProductCategoryPayload>> {
      try {
        const existingCategory = await cds.run(
          SELECT.from(cds.entities.ProductCategory)
            .columns("ID")
            .where({
              ID: {
                in: req.data.payload.map(
                  (data: ProductCategoryPayload) => data.ID
                ),
              },
            })
        );

        if (existingCategory.length > 0) {
          const filteredCategories = req.data.payload.filter(
            (data: ProductPayload) => !existingCategory.includes(data.ID)
          );

          if (filteredCategories.length > 0) {
            await create(cds.entities.ProductCategory, filteredCategories);
          }
          return {
            message:
              "The following category IDs already exist: " +
              existingCategory.join(", "),
            code: 200,
            data: req.data.payload,
          };
        }

        await create(cds.entities.ProductCategory, req.data.payload);

        return {
          message: "Data inserted successfully",
          code: 200,
          data: req.data.payload,
        };
      } catch (error: any) {
        logger.error(JSON.stringify(error));

        return {
          message:
            error.message ||
            error.originalMessage ||
            "Inserting category failed",
          code: error.code || 400,
          data: req.data.payload,
        };
      }
    }

    async function addProduct(
      req: Request
    ): Promise<ResponseData<ProductPayload>> {
      try {
        const existingProducts = await cds
          .run(
            SELECT.from(cds.entities.Products)
              .columns("ID")
              .where({
                ID: {
                  in: req.data.payload.map((data: ProductPayload) => data.ID),
                },
              })
          )
          .then((res: any) => res.map((data: any) => data.ID));

        const existingCategories = await cds
          .run(
            SELECT.from(cds.entities.ProductCategory)
              .columns("ID")
              .where({
                ID: {
                  in: req.data.payload.map(
                    (data: ProductPayload) => data.Category_ID
                  ),
                },
              })
          )
          .then((res: any) => res.map((data: any) => data.ID));

        if (existingProducts.length > 0) {
          const filteredProducts = req.data.payload
            .filter(
              (data: ProductPayload) => !existingProducts.includes(data.ID)
            )
            .filter((data: ProductPayload) =>
              existingCategories.includes(data.Category_ID)
            );

          if (filteredProducts.length > 0) {
            await create(cds.entities.Products, filteredProducts);
          }

          return {
            message:
              "The following products were not registered: " +
              req.data.payload
                .filter(
                  (data: ProductPayload) =>
                    !filteredProducts
                      .map((data: ProductPayload) => data.ID)
                      .includes(data.ID)
                )
                .map((data: ProductPayload) => data.ID)
                .join(", "),
            code: 200,
            data: req.data.payload,
          };
        }

        await create(cds.entities.Products, req.data.payload);

        return {
          message: "Data inserted successfully",
          code: 200,
          data: req.data.payload,
        };0
      } catch (error: any) {
        logger.error(JSON.stringify(error));

        return {
          message:
            error.message ||
            error.originalMessage ||
            "Inserting products failed",
          code: error.code || 400,
          data: req.data.payload,
        };
      }
    }

    return super.init();
  }
};
