const cds = require("@sap/cds");
const logger = cds.log("OrderService");
import { Request, Transaction } from "@sap/cds";
import { ProductCategory } from '#cds-models/';


module.exports = class OrderService extends cds.ApplicationService {

    init() {

        this.on("addProductCategory", async (req : Request) => await this.addCategory(req));
        this.on("selectProductCategory", async (req : Request) => await this.selectCategory(req));

        return super.init();
    }
    
    async addCategory(req : Request) {
        try {
            const tx : Transaction = cds.tx();
            const query = INSERT.into(cds.entities.ProductCategory).entries(req.data.payload)
    
            await tx.run(query).then(tx.commit, tx.rollback);

            return {
                message: "Data inserted successfully",
                data: req.data.payload
            }
        } catch (error) {
            logger.error(JSON.stringify(error));
        }
    }

    async selectCategory(req : Request) {
        try {
            const query = SELECT.from(cds.entities.ProductCategory).columns("ID", "Name", "Description").where({
                ID: req.data.id
            });
    
            const result : ProductCategory[] = await cds.run(query);

            logger.info(result);

            return result;
        } catch (error) {
            logger.error(JSON.stringify(error));
        }
    }

}