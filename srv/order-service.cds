using { ProductCategory } from '../db/schema';

service OrderService @(path: '/orders', impl: 'srv/order-service.ts'){


    type CategoryPayload {
        ID: Integer;
        Name: String;
        Description: String;
    }
    entity ProductCategoryProjection as projection on ProductCategory {
        ID, Name, Description
    };
    action addProductCategory(payload: array of CategoryPayload) returns String;
    function selectProductCategory(id: Integer) returns String;

}