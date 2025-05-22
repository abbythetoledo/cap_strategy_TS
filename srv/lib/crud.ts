const cds = require("@sap/cds");

module.exports = class CrudOperations {
    static async create<T>(table : any, data: T) : Promise<void> {

        const query = INSERT.into(table).entries(data);

        await cds.run(query)
    }
}