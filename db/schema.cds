using { managed } from '@sap/cds/common';

entity Products : managed {
    key ID          : Integer;
        Name        : String(100);
        Description : String(500);
        Price       : Decimal(10, 2);
        Stock       : Integer;
        Category    : Association to ProductCategory;
}

entity ProductCategory : managed {
    key ID          : Integer;
        Name        : String(100);
        Description : String(500);
}

entity Orders : managed {
    key ID         : Integer;
        OrderDate  : Timestamp;
        Status     : String(20);
        Customer   : Association to Customers;
        OrderItems : Association to many OrderItems
                         on OrderItems.Order = $self;
}

entity Customers : managed {
    key ID      : Integer;
        Name    : String(100);
        Email   : String(100);
        Phone   : String(20);
        Address : String(200);
}

entity OrderItems : managed {
    key ID       : Integer;
        Order    : Association to Orders;
        Product  : Association to Products;
        Quantity : Integer;
        Price    : Decimal(10, 2);
}