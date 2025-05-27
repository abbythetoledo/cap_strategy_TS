type ResponseData<T> = {
    message : string,
    code: number,
    data: T
};

type ProductCategoryPayload = {
    ID: number,
    Name: string,
    Description: string
}
type OrderItem = {
    ID: number,
    Order_ID: number,
    Product_ID: number,
    Quantity: number,
    Price: float
}
type OrderPayload = {
    ID: number,
    OrderDate: string,
    Status: string,
    Customer_ID: integer,
    OrderItems: Optional<OrderItem[]>
}

type ProductPayload = {
    ID: string,
    Name: string,
    Description: string,
    Price: float,
    Stock: number,
    Category_ID: number
}