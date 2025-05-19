const cds = require("@sap/cds");
const logger = cds.log("OrderService");
import { Request, Transaction } from "@sap/cds";


module.exports = class AdminService extends cds.ApplicationService {

    init() {

        this.on("addProductCategory", async (req : Request) => await this.addCategory(req));

        return super.init();
    }
    
    async addCategory(req : Request) : Promise<ResponseData<ProductCategoryPayload>> {
        try {
            const tx : Transaction = cds.tx();
            const query = INSERT.into(cds.entities.ProductCategory).entries(req.data.payload)
    
            await tx.run(query).then(tx.commit, tx.rollback);

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

}