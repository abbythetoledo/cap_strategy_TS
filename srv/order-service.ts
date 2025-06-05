const cds = require("@sap/cds");
const logger = cds.log("OrderService");
import { Request } from "@sap/cds";
const ops = require("./operations/operations");

module.exports = class OrderService extends cds.ApplicationService {

    init() {

        this.on("sendOrder", async (req: Request, next: Function) => {
            req.reply(await ops.sendOrder(req.data.payload));
            return next();
        });

        return super.init();
    }

}