const cds = require('@sap/cds');
const { GET } = cds.test('serve','AdminService');
const logger = cds.log("AdminServiceTest");
const path = require("path");

describe('Admin Test Suite', () => {
    let srv : any;
 
    beforeAll(async () => {
        try {
            cds.env.requires.db = { kind: 'sqlite', database: ':memory' };
            srv = await cds.load(path.join(__dirname + '/../../admin-service.cds')).then(cds.serve)
            await cds.deploy(path.join(__dirname + '/../../../db'));
     
        } catch (error) {
            logger.error(error);
        } 
 
 
    });

    afterAll(async () => {
        await cds.shutdown();
    });

    test('ProductCategoryProjection should retrieve categories from table', async () => {
        const categories = await cds.run(SELECT.from(cds.entities.ProductCategory).columns(["ID", "Name", "Description"]));
        const { data } = await GET ('/admin/ProductCategoryProjection');
        logger.info(categories);
    
        expect(data.value.length).toBe(categories.length)
    });
});

