const cds = require("@sap/cds");
const logger = cds.log("OrderService");
import { Request } from "@sap/cds";
const { create } = require("./lib/crud");

module.exports = class OrderService extends cds.ApplicationService {

    init() {

        this.on("sendOrder", async (req : Request) => await sendOrder(req));

        async function sendOrder(req : Request) : Promise<ResponseData<OrderPayload>>{

            try {
                const customerID : number = req.data.payload.Customer_ID;
                const orderItems : OrderItem[] = req.data.payload.OrderItems;
                const orderItemIDs : number[] = req.data.payload.OrderItems.map((item : OrderItem) => item.ID);
                delete req.data.payload.OrderItems;
                const order : OrderPayload[] = [req.data.payload];
                const customerQuery = SELECT.from(cds.entities.Customers).columns("ID").where({ ID: customerID });
                const customer = await cds.run(customerQuery);
                if (customer.length === 0) {
                    return {
                        message: "Customer does not exist in our system",
                        code: 400,
                        data: req.data.payload
                    }
                };
    
                const products = await cds.run(SELECT.columns(["ID", "Name"]).from(cds.entities.Products).where({
                    ID: {
                        in: orderItemIDs
                    }
                }));
    
                if (products.length === 0) {
                    return {
                        message: "Products do not exist in the system",
                        code: 400,
                        data: req.data.payload
                    }
                }

                await create(cds.entities.Orders, order);
                await create(cds.entities.OrderItems, orderItems);
    
                return {
                    message: "Data inserted successfully",
                    code: 200,
                    data: req.data.payload
                }
            } catch (error : any) {
    
                return {
                    message: error.message || error.originalMessage || "Inserting category failed",
                    code: error.code || 400,
                    data: req.data.payload
                }
            }
        }

        return super.init();
    }

}