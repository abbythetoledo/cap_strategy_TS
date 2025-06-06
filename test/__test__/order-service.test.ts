import { ApplicationService } from "@sap/cds";

const cds = require("@sap/cds");
const { POST } = cds.test("serve", "OrderService");
const logger = cds.log("OrderServiceTest");
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

describe("Order Service Test Suite", () => {
  let srv: ApplicationService;
  jest.setTimeout(90000);

  beforeAll(async () => {
    try {
      cds.env.requires.db = {
        kind: "sqlite",
        credentials: {
          url: "test.db",
        },
        pool: {
          max: 50, // Maximum number of connections in the pool
          min: 5, // Minimum number of connections in the pool
          acquireTimeout: 60000, // Timeout for acquiring a connection (milliseconds)
          idleTimeout: 300000, // Timeout for idle connections (milliseconds)
        },
      };
      srv = await cds.load(cds.root + "/srv/order-service.cds").then(cds.serve);
      await cds.deploy(cds.root + "/db");
    } catch (error) {
      logger.error(error);
    }
  });

  afterAll(async () => {
    await cds.shutdown();
  });

  test("addOrder should NOT insert new order if customer does not exist", async () => {
    let { maxCustomerID } = await cds.run(
      SELECT.one("max(ID) as maxCustomerID").from(cds.entities.Customers)
    );

    const order = {
      payload: {
        Status: "New",
        Customer_ID: ++maxCustomerID,
        OrderItems: [
          {
            Product_ID: 1,
            Quantity: 1,
            Price: 12.99,
          },
          {
            Product_ID: 1,
            Quantity: 1,
            Price: 12.99,
          },
        ],
      },
    };

    const res = await POST("/orders/sendOrder", order);

    expect(res.status).toBe(200);
    expect(res.data.value.code).toBe(400);
    expect(res.data.value.message).toBe(
      "Customer does not exist in our system"
    );
  });

  test("addOrder should NOT insert new order if product does not exist", async () => {
    let { maxProductID } = await cds.run(
      SELECT.one("max(ID) as maxProductID").from(cds.entities.Products)
    );

    maxProductID = ++maxProductID || 1;

    const order = {
      payload: {
        Status: "New",
        Customer_ID: 10,
        OrderItems: [
          {
            Product_ID: maxProductID,
            Quantity: 1,
            Price: 12.99,
          },
          {
            Product_ID: maxProductID,
            Quantity: 1,
            Price: 12.99,
          },
        ],
      },
    };

    const res = await POST("/orders/sendOrder", order);

    expect(res.status).toBe(200);
    expect(res.data.value.code).toBe(400);
    expect(res.data.value.message).toBe("Products do not exist in the system");
  });

  test("addOrder should insert new order if product and customer both exist", async () => {
    const order = {
      payload: {
        Status: "New",
        Customer_ID: 10,
        OrderItems: [
          {
            Product_ID: 1,
            Quantity: 1,
            Price: 12.99,
          },
          {
            Product_ID: 1,
            Quantity: 1,
            Price: 12.99,
          },
        ],
      },
    };

    const res = await POST("/orders/sendOrder", order);

    expect(res.status).toBe(200);
    expect(res.data.value.code).toBe(200);
    expect(res.data.value.message).toBe("Order sent successfully");
  });

  test("when a database error occurs when sending a new order - branch 1", async () => {
    const testError = "Test error";
    const cdsSpy = jest.spyOn(cds, "run").mockImplementation(() => {
      throw new Error("Test error");
    });

    const order = {
      payload: {
        Status: "New",
        Customer_ID: 10,
        OrderItems: [
          {
            Product_ID: 1,
            Quantity: 1,
            Price: 12.99,
          },
          {
            Product_ID: 1,
            Quantity: 1,
            Price: 12.99,
          },
        ],
      },
    };

    const res = await POST("/orders/sendOrder", order);

    expect(cdsSpy).toHaveBeenCalled();
    expect(res.data.value.message).toBe(testError);
    expect(res.data.value.code).toBe(400);
  });

  test("when a database error occurs when sending a new order - branch 2", async () => {
    const testError = "Test error";
    const testErrorCode = 601;
    const cdsSpy = jest.spyOn(cds, "run").mockImplementation(() => {
      throw new CustomError_1(testError, testErrorCode);
    });

    const order = {
      payload: {
        Status: "New",
        Customer_ID: 10,
        OrderItems: [
          {
            Product_ID: 1,
            Quantity: 1,
            Price: 12.99,
          },
          {
            Product_ID: 1,
            Quantity: 1,
            Price: 12.99,
          },
        ],
      },
    };

    const res = await POST("/orders/sendOrder", order);

    expect(cdsSpy).toHaveBeenCalled();
    expect(res.data.value.message).toBe(testError);
    expect(res.data.value.code).toBe(testErrorCode);
  });

  test("when a database error occurs when sending a new order - branch 3", async () => {
    const testError = "Test error";
    const testErrorCode = 602;
    const cdsSpy = jest.spyOn(cds, "run").mockImplementation(() => {
      throw new CustomError_2(testError, testErrorCode);
    });

    const order = {
      payload: {
        Status: "New",
        Customer_ID: 10,
        OrderItems: [
          {
            Product_ID: 1,
            Quantity: 1,
            Price: 12.99,
          },
          {
            Product_ID: 1,
            Quantity: 1,
            Price: 12.99,
          },
        ],
      },
    };

    const res = await POST("/orders/sendOrder", order);

    expect(cdsSpy).toHaveBeenCalled();
    expect(res.data.value.message).toBe("Sending order failed");
    expect(res.data.value.code).toBe(testErrorCode);
  });
});
