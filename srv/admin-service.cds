using { ProductCategory, Products } from '../db/schema';

service AdminService @(path: '/admin', impl: 'srv/admin-service'){
    type CategoryPayload {
        ID: Integer;
        Name: String;
        Description: String;
    }

    type ProductPayload {
        ID          : Integer;
        Name        : String(100);
        Description : String(500);
        Price       : Decimal(10, 2);
        Stock       : Integer;
        Category_ID : Integer;
    }
    entity ProductCategoryProjection as projection on ProductCategory {
        ID, Name, Description
    };

    entity ProductProjection as projection on Products {
        ID, Name, Description
    };
    
    action addProductCategory(payload: array of CategoryPayload) returns String;
    action addProducts(payload: array of ProductPayload) returns String;

}