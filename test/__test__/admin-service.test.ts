import { ApplicationService } from "@sap/cds";

const cds = require("@sap/cds");
const { GET, POST } = cds.test("serve", "AdminService");
const helper = require("../../srv/lib/helper");

class CustomError_1 {
  private originalMessage: string;
  private code: number;
  constructor(message: string, code: number) {
    this.originalMessage = message;
    this.code = code;
  }
}

class CustomError_2 {
  private customMessage: string;
  private code: number;
  constructor(message: string, code: number) {
    this.customMessage = message;
    this.code = code;
  }
}

describe("Admin Test Suite", () => {
  let srv: ApplicationService;
  jest.setTimeout(90000);

  beforeAll(async () => {
    cds.env.requires.db = {
      kind: "sqlite",
      credentials: {
        url: ":test.db",
      },
      pool: {
        max: 50, // Maximum number of connections in the pool
        min: 5, // Minimum number of connections in the pool
        acquireTimeout: 60000, // Timeout for acquiring a connection (milliseconds)
        idleTimeout: 300000, // Timeout for idle connections (milliseconds)
      },
    };
    srv = await cds.load(cds.root + "/srv/admin-service.cds").then(cds.serve);
    await cds.deploy(cds.root + "/db");
  });

  afterAll(async () => {
    await cds.shutdown();
  });

  beforeEach(() => {
    jest.clearAllMocks();
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

    expect(data.value.length).toBe(categories.length);
  });

  test("addProductCategory should insert new category if category does not exist", async () => {
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

  test("addProductCategory should NOT insert new category if category already exists", async () => {
    const testTime = helper.getSystemDateTime("ISO");
    const category = {
      payload: [
        {
          ID: 10,
          Name: "test order 1",
          Description: "this is a test entry",
        },
        {
          ID: 13,
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
          createdAt: {
            [">="]: testTime,
          },
        })
    );

    expect(res.status).toBe(200);
    expect(categories.length).toBe(1);
    expect(res.data.value.message).toBe(
      "The following category IDs already exist: 10"
    );
  });

  test("If database error occurs when inserting category - branch 1", async () => {
    const testError = "Test error 1";
    const cdsSpy = jest.spyOn(cds, "run").mockImplementation(() => {
      throw new Error(testError);
      throw new CustomError_2(testError, 400);
    });

    const category = {
      payload: [
        {
          ID: 10,
          Name: "test order 1",
          Description: "this is a test entry",
        },
        {
          ID: 13,
          Name: "test order 1",
          Description: "this is a test entry",
        },
      ],
    };

    const res = await POST("/admin/addProductCategory", category);

    expect(cdsSpy).toHaveBeenCalled();
    expect(res.data.value.message).toBe(testError);
    expect(res.data.value.code).toBe(400);
  });

  test("If database error occurs when inserting category - branch 2", async () => {
    const testError = "Test error 2";
    const testErrorCode = 401;
    const cdsSpy = jest.spyOn(cds, "run").mockImplementation(() => {
      throw new CustomError_1(testError, testErrorCode);
    });

    const category = {
      payload: [
        {
          ID: 10,
          Name: "test order 1",
          Description: "this is a test entry",
        },
        {
          ID: 13,
          Name: "test order 1",
          Description: "this is a test entry",
        },
      ],
    };

    const res = await POST("/admin/addProductCategory", category);

    expect(cdsSpy).toHaveBeenCalled();
    expect(res.data.value.message).toBe(testError);
    expect(res.data.value.code).toBe(testErrorCode);
  });

  test("If database error occurs when inserting category - branch 3", async () => {
    const testError = "Test error 3";
    const testErrorCode = 402;
    const cdsSpy = jest.spyOn(cds, "run").mockImplementation(() => {
      throw new CustomError_2(testError, testErrorCode);
    });

    const category = {
      payload: [
        {
          ID: 10,
          Name: "test order 1",
          Description: "this is a test entry",
        },
        {
          ID: 13,
          Name: "test order 1",
          Description: "this is a test entry",
        },
      ],
    };

    const res = await POST("/admin/addProductCategory", category);

    expect(cdsSpy).toHaveBeenCalled();
    expect(res.data.value.message).toBe("Inserting category failed");
    expect(res.data.value.code).toBe(testErrorCode);
  });

  test("addProducts should insert new products if category exists", async () => {
    const product = {
      payload: [
        {
          Name: "test order",
          Description: "this is a test entry",
          Price: 18.99,
          Stock: 20,
          Category_ID: 1,
        },
      ],
    };

    const res = await POST("/admin/addProducts", product);

    expect(res.status).toBe(200);
    expect(res.data.value.message).toBe("Data inserted successfully");
  });

  test("addProducts should not insert new products if category does not exist", async () => {
    let { maxCategoryID } = await cds.run(
      SELECT.one(`max(ID) as maxCategoryID`).from(cds.entities.ProductCategory)
    );
    const product = {
      payload: [
        {
          Name: "test order",
          Description: "this is a test entry",
          Price: 18.99,
          Stock: 20,
          Category_ID: ++maxCategoryID,
        },
        {
          Name: "test order 2",
          Description: "this is a test entry",
          Price: 18.99,
          Stock: 20,
          Category_ID: 1,
        },
        {
          Name: "test order 3",
          Description: "this is a test entry",
          Price: 18.99,
          Stock: 20,
          Category_ID: 1,
        },
        {
          Name: "test order 4",
          Description: "this is a test entry",
          Price: 18.99,
          Stock: 20,
          Category_ID: ++maxCategoryID,
        },
      ],
    };

    const res = await POST("/admin/addProducts", product);

    expect(res.status).toBe(200);
    expect(res.data.value.message).toBe(
      "The following products were not registered: test order, test order 4"
    );
  });

  test("If database error occurs when inserting product - branch 1", async () => {
    const testError = "Test error 1";
    const cdsSpy = jest.spyOn(cds, "run").mockImplementation(() => {
      throw new Error(testError);
    });

    const product = {
      payload: [
        {
          Name: "test order",
          Description: "this is a test entry",
          Price: 18.99,
          Stock: 20,
          Category_ID: 1,
        },
      ],
    };

    const res = await POST("/admin/addProducts", product);

    expect(cdsSpy).toHaveBeenCalled();
    expect(res.data.value.message).toBe(testError);
    expect(res.data.value.code).toBe(400);
  });

  test("If database error occurs when inserting product - branch 2", async () => {
    const testError = "Test error 2";
    const testErrorCode = 501;
    const cdsSpy = jest.spyOn(cds, "run").mockImplementation(() => {
      throw new CustomError_1(testError, testErrorCode);
    });

    const product = {
      payload: [
        {
          Name: "test order",
          Description: "this is a test entry",
          Price: 18.99,
          Stock: 20,
          Category_ID: 1,
        },
      ],
    };

    const res = await POST("/admin/addProducts", product);

    expect(cdsSpy).toHaveBeenCalled();
    expect(res.data.value.message).toBe(testError);
    expect(res.data.value.code).toBe(testErrorCode);
  });

  test("If database error occurs when inserting product - branch 3", async () => {
    const testError = "Test error 3";
    const testErrorCode = 502;
    const cdsSpy = jest.spyOn(cds, "run").mockImplementation(() => {
      throw new CustomError_2(testError, testErrorCode);
    });

    const product = {
      payload: [
        {
          Name: "test order",
          Description: "this is a test entry",
          Price: 18.99,
          Stock: 20,
          Category_ID: 1,
        },
      ],
    };

    const res = await POST("/admin/addProducts", product);

    expect(cdsSpy).toHaveBeenCalled();
    expect(res.data.value.message).toBe("Inserting products failed");
    expect(res.data.value.code).toBe(testErrorCode);
  });
});
