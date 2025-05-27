import { ApplicationService } from "@sap/cds";

const cds = require("@sap/cds");
const { POST } = cds.test("serve", "OrderService");
const logger = cds.log("OrderServiceTest");
const helper = require("../../srv/lib/helper");

describe("Order Service Test Suite", () => {
  let srv: ApplicationService;
  jest.setTimeout(90000);

  beforeAll(async () => {
    try {
      cds.env.requires.db = { kind: "sqlite", database: "test.db" };
      srv = await cds.load(cds.root + "/srv/order-service.cds").then(cds.serve);
      await cds.deploy(cds.root + "/db");
    } catch (error) {
      logger.error(error);
    }
  });

  afterAll(async () => {
    await cds.shutdown();
  });

  test("addOrder should insert new order if order ID does not exist and customer exists", async () => {
    let { maxOrderID } = await cds.run(
      SELECT.one("max(ID) as maxOrderID").from(cds.entities.Orders)
    );

    let { maxOrderItemID } = await cds.run(
      SELECT.one("max(ID) as maxOrderItemID").from(cds.entities.OrderItems)
    );

    let orderDate = helper.getSystemDateTime("ISO");

    maxOrderID = ++maxOrderID || 1;
    maxOrderItemID = ++maxOrderItemID || 1;

    const order = {
      payload: {
        ID: maxOrderID,
        OrderDate: orderDate,
        Status: "New",
        Customer_ID: 1,
        OrderItems: [
          {
            ID: maxOrderItemID,
            Order_ID: maxOrderID,
            Product_ID: 1,
            Quantity: 1,
            Price: 12.99,
          },
          {
            ID: ++maxOrderItemID,
            Order_ID: maxOrderID,
            Product_ID: 1,
            Quantity: 1,
            Price: 12.99,
          }
        ],
      },
    };

    const res = await POST("/orders/sendOrder", order);

    const orders = await cds.run(
      SELECT.from(cds.entities.Orders).columns(["ID"]).where({
        ID: order.payload.ID,
      })
    );

    const orderItems = await cds.run(
        SELECT.from(cds.entities.OrderItems).columns(["ID"]).where({
          ID: {
            in: order.payload.OrderItems.map((data) => data.ID)
          }
        })
    );

    expect(res.status).toBe(200);
    expect(orders.length).toBeGreaterThan(0);
    expect(orderItems.length).toBe(order.payload.OrderItems.length);
  });
  test("addOrder should NOT insert new order if order ID does not exist but customer does not exist", async () => {
    let { maxOrderID } = await cds.run(
      SELECT.one("max(ID) as maxOrderID").from(cds.entities.Orders)
    );

    let { maxOrderItemID } = await cds.run(
      SELECT.one("max(ID) as maxOrderItemID").from(cds.entities.OrderItems)
    );

    let { maxCustomerID } = await cds.run(
        SELECT.one("max(ID) as maxCustomerID").from(cds.entities.Customers)
      );

    maxOrderID = ++maxOrderID || 1;
    maxOrderItemID = ++maxOrderItemID || 1;

    const order = {
      payload: {
        ID: maxOrderID,
        OrderDate: "2025-05-21T09:14:00Z",
        Status: "New",
        Customer_ID: ++maxCustomerID,
        OrderItems: [
          {
            ID: maxOrderItemID,
            Order_ID: maxOrderID,
            Product_ID: 1,
            Quantity: 1,
            Price: 12.99,
          },
          {
            ID: ++maxOrderItemID,
            Order_ID: maxOrderID,
            Product_ID: 1,
            Quantity: 1,
            Price: 12.99,
          }
        ],
      },
    };

    const res = await POST("/orders/sendOrder", order);

    const orders = await cds.run(
      SELECT.from(cds.entities.Orders).columns(["ID"]).where({
        ID: order.payload.ID,
      })
    );

    const orderItems = await cds.run(
        SELECT.from(cds.entities.OrderItems).columns(["ID"]).where({
          ID: {
            in: order.payload.OrderItems.map((data) => data.ID)
          }
        })
    );

    expect(res.status).toBe(200);
    expect(orders.length).toBe(0);
    expect(orderItems.length).toBe(0);
    expect(res.data.value.code).toBe(400);
    expect(res.data.value.message).toBe("Customer does not exist in our system");
  });

  test("addOrder should NOT insert new order if order ID exists", async () => {
    let { maxOrderID } = await cds.run(
      SELECT.one("max(ID) as maxOrderID").from(cds.entities.Orders)
    );

    let { maxOrderItemID } = await cds.run(
      SELECT.one("max(ID) as maxOrderItemID").from(cds.entities.OrderItems)
    );

    const order = {
      payload: {
        ID: maxOrderID,
        OrderDate: "2025-05-21T09:14:00Z",
        Status: "New",
        Customer_ID: 10,
        OrderItems: [
          {
            ID: maxOrderItemID,
            Order_ID: maxOrderID,
            Product_ID: 1,
            Quantity: 1,
            Price: 12.99,
          },
          {
            ID: ++maxOrderItemID,
            Order_ID: maxOrderID,
            Product_ID: 1,
            Quantity: 1,
            Price: 12.99,
          }
        ],
      },
    };

    const res = await POST("/orders/sendOrder", order);

    const orders = await cds.run(
      SELECT.from(cds.entities.Orders).columns(["ID"]).where({
        ID: order.payload.ID,
      })
    );

    const orderItems = await cds.run(
        SELECT.from(cds.entities.OrderItems).columns(["ID"]).where({
          ID: {
            in: order.payload.OrderItems.map((data) => data.ID)
          }
        })
    );

    expect(res.status).toBe(200);
    expect(res.data.value.code).toBe(400);
  });

  
  test("addOrder should NOT insert new order if product does not exist", async () => {
    let { maxOrderID } = await cds.run(
      SELECT.one("max(ID) as maxOrderID").from(cds.entities.Orders)
    );

    let { maxOrderItemID } = await cds.run(
      SELECT.one("max(ID) as maxOrderItemID").from(cds.entities.OrderItems)
    );

    let { maxProductID } = await cds.run(
        SELECT.one("max(ID) as maxProductID").from(cds.entities.Products)
    );

    maxOrderID = ++maxOrderID || 1;
    maxOrderItemID = ++maxOrderItemID || 1
    maxProductID = ++maxProductID || 1

    const order = {
      payload: {
        ID: maxOrderID,
        OrderDate: "2025-05-21T09:14:00Z",
        Status: "New",
        Customer_ID: 10,
        OrderItems: [
          {
            ID: maxOrderItemID,
            Order_ID: maxOrderID,
            Product_ID: maxProductID,
            Quantity: 1,
            Price: 12.99,
          },
          {
            ID: ++maxOrderItemID,
            Order_ID: maxOrderID,
            Product_ID: maxProductID,
            Quantity: 1,
            Price: 12.99,
          }
        ],
      },
    };

    const res = await POST("/orders/sendOrder", order);

    const orders = await cds.run(
      SELECT.from(cds.entities.Orders).columns(["ID"]).where({
        ID: order.payload.ID,
      })
    );

    const orderItems = await cds.run(
        SELECT.from(cds.entities.OrderItems).columns(["ID"]).where({
          ID: {
            in: order.payload.OrderItems.map((data) => data.ID)
          }
        })
    );


    expect(res.status).toBe(200);
    expect(orders.length).toBe(0);
    expect(orderItems.length).toBe(0);
    expect(res.data.value.code).toBe(400);
    expect(res.data.value.message).toBe("Products do not exist in the system");
  });
});
