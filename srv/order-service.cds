using { Orders, OrderItems } from '../db/schema';

service OrderService @(path: '/orders', impl: 'srv/order-service'){

    type OrderPayload {
        Status: String;
        Customer_ID: Integer;
        OrderItems: array of OrderItemsPayload;
    };

    type OrderItemsPayload {
        Product_ID: Integer;
        Quantity: Integer;
        Price: Decimal(10,2);
    };

    entity OrdersProjection as projection on Orders;
    entity OrderItemsProjection as projection on OrderItems;
    action sendOrder (payload: OrderPayload) returns String;

}