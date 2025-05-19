import { ApplicationService } from "@sap/cds";

const cds = require("@sap/cds");
const { GET, POST } = cds.test("serve", "AdminService");
const logger = cds.log("AdminServiceTest");

describe("Admin Test Suite", () => {
  let srv: ApplicationService;
  jest.setTimeout(90000);

  beforeAll(async () => {
    try {
      cds.env.requires.db = { kind: "sqlite", database: ":memory" };
      srv = await cds
        .load(cds.root + "/srv/admin-service.cds")
        .then(cds.serve);
      await cds.deploy(cds.root + "/db");
    } catch (error) {
      logger.error(error);
    }
  });

  afterAll(async () => {
    await cds.shutdown();
  });

  test("ProductCategoryProjection should retrieve categories from table", async () => {
    const categories = await cds.run(
      SELECT.from(cds.entities.ProductCategory).columns([
        "ID",
        "Name",
        "Description",
      ])
    );
    const { data } = await GET("/admin/ProductCategoryProjection");
    logger.info(categories);

    expect(data.value.length).toBe(categories.length);
  });

  test("addProductCategory should insert new category", async () => {
    const category = {
      payload: [
        {
          ID: 12,
          Name: "test order 1",
          Description: "this is a test entry",
        },
      ],
    };

    const res = await POST("/admin/addProductCategory", category);

    
    const categories = await cds.run(
      SELECT.from(cds.entities.ProductCategory)
        .columns(["ID", "Name", "Description"])
        .where({
          ID: {
            in: category.payload.map((cat) => cat.ID),
          },
        })
    );
    logger.info(res.data);

    expect(res.status).toBe(200);
    expect(categories.length).toBeGreaterThan(0);
  });
});
