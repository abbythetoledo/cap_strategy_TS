const cds = require("@sap/cds");
const logger = cds.log("OrderService");
import { Request, Transaction } from "@sap/cds";
const { create } = require("./lib/crud");


module.exports = class AdminService extends cds.ApplicationService {

    init() {

        this.on("addProductCategory", async (req : Request) => await addCategory(req));

        async function addCategory(req : Request) : Promise<ResponseData<ProductCategoryPayload>> {
            try {
    
                const existingCategory = await cds.run(SELECT.from(cds.entities.ProductCategory).columns("ID").where({ ID: req.data.payload.ID }));
    
                if(existingCategory.length > 0) {
                    return {
                        message: "Category already exists",
                        code: 200,
                        data: req.data.payload
                    }
                }
    
                await create(cds.entities.ProductCategory, req.data.payload);
    
                return {
                    message: "Data inserted successfully",
                    code: 200,
                    data: req.data.payload
                }
            } catch (error : any) {
                logger.error(JSON.stringify(error));
    
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