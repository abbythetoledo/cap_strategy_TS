const cds = require("@sap/cds");
const logger = cds.log("OrderService");
import { Request } from "@sap/cds";
const { create } = require("./lib/crud");
const helper = require("./lib/helper");

module.exports = class OrderService extends cds.ApplicationService {

    init() {

        this.on("sendOrder", async (req: Request, next: Function) => await sendOrder(req, next));

        async function sendOrder(req: Request, next: Function): Promise<Function> {

            try {
                let { maxOrderID } = await cds.run(SELECT.one("max(ID) as maxOrderID").from(cds.entities.Orders));
                const currentOrderID = maxOrderID + 1;
                const orderDate = helper.getSystemDateTime("ISO");
                let { maxOrderItemID } = await cds.run(SELECT.one("max(ID) as maxOrderItemID").from(cds.entities.OrderItems));

                const customerID: number = req.data.payload.Customer_ID;


                const productIDs: number[] = req.data.payload.OrderItems.map((item: OrderItem) => item.Product_ID);
                const orderItems: OrderItem[] = req.data.payload.OrderItems.map((data: OrderItem) => { return { ...data, ID: ++maxOrderItemID, Order_ID: currentOrderID } });
                delete req.data.payload.OrderItems;
                const order: OrderPayload[] = [{
                    ...req.data.payload, ID: currentOrderID, OrderDate: orderDate
                }];


                const customerQuery = SELECT.from(cds.entities.Customers).columns("ID").where({ ID: customerID });
                const customer = await cds.run(customerQuery);
                if (customer.length === 0) {
                    req.reply({
                        message: "Customer does not exist in our system",
                        code: 400,
                        data: order
                    });

                    return next();
                };

                const products = await cds.run(SELECT.columns(["ID", "Name"]).from(cds.entities.Products).where({
                    ID: {
                        in: productIDs
                    }
                }));

                if (products.length === 0) {
                    req.reply({
                        message: "Products do not exist in the system",
                        code: 400,
                        data: order
                    });

                    return next();
                }

                await create(cds.entities.Orders, order);
                await create(cds.entities.OrderItems, orderItems);

                req.reply({
                    message: "Order sent successfully",
                    code: 200,
                    data: order
                });

                return next();
            } catch (error: any) {

                req.reply({
                    message: error.message || error.originalMessage || "Sending order failed",
                    code: error.code || 400,
                    data: req.data.payload
                });

                return next();
            }
        }

        return super.init();
    }

}