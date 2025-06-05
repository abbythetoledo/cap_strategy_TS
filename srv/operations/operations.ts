const cds = require("@sap/cds");
const logger = cds.log("OrderService");
const { create } = require("../lib/crud");
const helper = require("../lib/helper");

module.exports = class Operations {
    static async addCategory(
        req: ProductCategoryPayload[]
    ): Promise<ResponseData<ProductCategoryPayload[]>> {
        try {
            const existingCategory = await cds.run(
                SELECT.from(cds.entities.ProductCategory)
                    .columns("ID")
                    .where({
                        ID: {
                            in: req.map((data: ProductCategoryPayload) => data.ID),
                        },
                    })
            );

            if (existingCategory.length > 0) {
                const filteredCategories = req.filter(
                    (data: ProductCategoryPayload) =>
                        !existingCategory.map((res: any) => res.ID).includes(data.ID)
                );

                if (filteredCategories.length > 0) {
                    await create(cds.entities.ProductCategory, filteredCategories);
                }
                return {
                    message:
                        "The following category IDs already exist: " +
                        existingCategory.map((res: any) => res.ID).join(", "),
                    code: 200,
                    data: req,
                };
            }

            await create(cds.entities.ProductCategory, req);

            return {
                message: "Data inserted successfully",
                code: 200,
                data: req,
            };
        } catch (error: any) {
            logger.error(JSON.stringify(error));

            return {
                message:
                    error.message || error.originalMessage || "Inserting category failed",
                code: error.code || 400,
                data: req,
            };
        }
    }

    static async addProduct(
        req: ProductPayload[]
    ): Promise<ResponseData<ProductPayload[]>> {
        try {
            let { maxProductID } = await cds.run(
                SELECT.one(`max(ID) as maxProductID`).from(cds.entities.Products)
            );

            const existingCategories = await cds
                .run(
                    SELECT.from(cds.entities.ProductCategory)
                        .columns("ID")
                        .where({
                            ID: {
                                in: req.map((data: ProductPayload) => data.Category_ID),
                            },
                        })
                )
                .then((res: any) => res.map((data: any) => data.ID));

            const filteredProducts = req
                .filter((data: ProductPayload) =>
                    existingCategories.includes(data.Category_ID)
                )
                .map((data: ProductPayload) => {
                    return {
                        ...data,
                        ID: ++maxProductID,
                    };
                });

            if (filteredProducts.length > 0) {
                await create(cds.entities.Products, filteredProducts);
            }

            const returnMessage =
                filteredProducts.length === req.length
                    ? "Data inserted successfully"
                    : "The following products were not registered: " +
                    req.filter(
                        (data: ProductPayload) =>
                            !filteredProducts
                                .map((res: ProductPayload) => res.Category_ID)
                                .includes(data.Category_ID)
                    ).map((data: ProductPayload) => data.Name)
                        .join(", ");

            return {
                message: returnMessage,
                code: 200,
                data: filteredProducts,
            };
        } catch (error: any) {
            logger.error(JSON.stringify(error));

            return {
                message:
                    error.message || error.originalMessage || "Inserting products failed",
                code: error.code || 400,
                data: req,
            };
        }
    }

    static async sendOrder(
        req: OrderPayload
    ): Promise<ResponseData<OrderPayload>> {
        try {
            let { maxOrderID } = await cds.run(
                SELECT.one("max(ID) as maxOrderID").from(cds.entities.Orders)
            );
            const currentOrderID = maxOrderID + 1;
            const orderDate = helper.getSystemDateTime("ISO");
            let { maxOrderItemID } = await cds.run(
                SELECT.one("max(ID) as maxOrderItemID").from(cds.entities.OrderItems)
            );

            const customerID: number = req.Customer_ID;

            const productIDs: number[] = req.OrderItems.map(
                (item: OrderItem) => item.Product_ID
            );
            const orderItems: OrderItem[] = req.OrderItems.map((data: OrderItem) => {
                return { ...data, ID: ++maxOrderItemID, Order_ID: currentOrderID };
            });
            delete req.OrderItems;
            const order: OrderPayload = {
                ...req,
                ID: currentOrderID,
                OrderDate: orderDate,
            };

            const customerQuery = SELECT.from(cds.entities.Customers)
                .columns("ID")
                .where({ ID: customerID });
            const customer = await cds.run(customerQuery);
            if (customer.length === 0) {
                return {
                    message: "Customer does not exist in our system",
                    code: 400,
                    data: {
                        ...order,
                        OrderItems: orderItems,
                    },
                };
            }

            const products = await cds.run(
                SELECT.columns(["ID", "Name"])
                    .from(cds.entities.Products)
                    .where({
                        ID: {
                            in: productIDs,
                        },
                    })
            );

            if (products.length === 0) {
                return {
                    message: "Products do not exist in the system",
                    code: 400,
                    data: {
                        ...order,
                        OrderItems: orderItems,
                    },
                };
            }

            await create(cds.entities.Orders, [order]);
            await create(cds.entities.OrderItems, orderItems);

            return {
                message: "Order sent successfully",
                code: 200,
                data: {
                    ...order,
                    OrderItems: orderItems,
                },
            };
        } catch (error: any) {
            return {
                message:
                    error.message || error.originalMessage || "Sending order failed",
                code: error.code || 400,
                data: req,
            };
        }
    }
};
