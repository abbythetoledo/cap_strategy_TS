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
            const id : number = parseInt(req.data.id);
            const name : string = req.data.name;
            const description : string = req.data.description;
            const tx : Transaction = cds.tx();
            const query = INSERT.into(cds.entities.ProductCategory).columns(["ID", "Name", "Description"]).values(
                id,
                name,
                description)
    
            await tx.run(query).then(tx.commit, tx.rollback);
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
        } catch (error) {
            logger.error(JSON.stringify(error));
        }
    }

}