const cds = require("@sap/cds");

module.exports = class CrudOperations {
    static async create<T>(table: any, data: T): Promise<void> {

        const tx = cds.tx();

        const query = INSERT.into(table).entries(data);

        const res = await tx.run(query).then(tx.commit, tx.rollback);

        return res;
    }
}