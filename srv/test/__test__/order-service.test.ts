import { ApplicationService } from "@sap/cds";

const cds = require('@sap/cds');
const { GET, POST } = cds.test("serve", "OrderService");
const logger = cds.log("OrderServiceTest");

describe('Order Service Test Suite', () => {
    let srv : ApplicationService;
    jest.setTimeout(90000);
 
    beforeAll(async () => {
        try {
            cds.env.requires.db = { kind: 'sqlite', database: ':memory' };
            srv = await cds.load(cds.root + '/srv/order-service.cds').then(cds.serve)
            await cds.deploy(cds.root + '/db');
     
        } catch (error) {
            logger.error(error);
        } 
 
    });

    afterAll(async () => {
        await cds.shutdown();
    });

    test('selectProductCategory should retrieve category from table', async () => {
        const res = await GET ('/orders/selectProductCategory(id=3)');
    
        expect(res.status).toBe(200);
    });


});

