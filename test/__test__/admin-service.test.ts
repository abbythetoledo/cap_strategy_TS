import { ApplicationService } from "@sap/cds";

const cds = require("@sap/cds");
const { GET, POST } = cds.test("serve", "AdminService");

let srv: ApplicationService;
jest.setTimeout(90000);

beforeAll(async () => {
  cds.env.requires.db = { kind: "sqlite", database: "test.db" };
  srv = await cds.load(cds.root + "/srv/admin-service.cds").then(cds.serve);
  await cds.deploy(cds.root + "/db");
});

afterAll(async () => {
  await cds.shutdown();
});

describe("Admin Test Suite", () => {
  test("ProductCategoryProjection should retrieve categories from table", async () => {
    const categories = await cds.run(
      SELECT.from(cds.entities.ProductCategory).columns([
        "ID",
        "Name",
        "Description",
      ])
    );
    const { data } = await GET("/admin/ProductCategoryProjection");

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

    expect(res.status).toBe(200);
    expect(categories.length).toBeGreaterThan(0);
  });

  test("addProducts should insert new products if category exists and product ID does not exist", async () => {

    let { maxID } = await cds.run(
      SELECT.one("max(ID) as maxID").from(cds.entities.Products)
    );
    const product = {
      payload: [
        {
          ID: ++maxID,
          Name: "test order",
          Description: "this is a test entry",
          Price: 18.99,
          Stock: 20,
          Category_ID: 13
        }
      ],
    };

    const res = await POST("/admin/addProducts", product);

    const products = await cds.run(
      SELECT.from(cds.entities.Products)
        .columns(["ID", "Name", "Description"])
        .where({
          ID: {
            in: product.payload.map((data) => data.ID),
          },
        })
    );

    expect(res.status).toBe(200);
    expect(products.length).toBeGreaterThan(0);
  });
});
