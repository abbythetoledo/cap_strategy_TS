service OrderService @(path: '/orders', impl: 'srv/order-service'){

    type OrderPayload {
        ID: Integer;
        OrderDate: Timestamp;
        Status: String;
        Customer_ID: Integer;
        OrderItems: array of OrderItemsPayload;
    };

    type OrderItemsPayload {
        ID: Integer;
        Order_ID: Integer;
        Product_ID: Integer;
        Quantity: Integer;
        Price: Decimal(10,2);
    };

    action sendOrder (payload: OrderPayload) returns String;

}