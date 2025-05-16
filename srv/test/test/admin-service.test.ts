const cds = require('@sap/cds');
const { GET } = cds.test('serve','AdminService');
const logger = cds.log("AdminServiceTest")

test('ProductCategoryProjection should retrieve categories from table', async () => {
    const categories = await cds.run(SELECT.from(cds.entities.ProductCategory).columns(["ID", "Name", "Description"]));
    const { data } = await GET ('/admin/ProductCategoryProjection');
    logger.info(categories);

    expect(data.value.length).toBe(categories.length)
});