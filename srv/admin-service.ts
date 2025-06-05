const cds = require("@sap/cds");
const logger = cds.log("OrderService");
import { Request } from "@sap/cds";
const { create } = require("./lib/crud");
const ops = require("./operations/operations")

module.exports = class AdminService extends cds.ApplicationService {

  init() {
    this.on(
      "addProductCategory",
      async (req: Request, next: Function) => {
        req.reply(await ops.addCategory(req.data.payload));
        return next();
      }
    );

    this.on("addProducts", async (req: Request, next: Function) => {
      req.reply(await ops.addProduct(req.data.payload));
      return next();
    });

    return super.init();

  }
}
