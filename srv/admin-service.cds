using { ProductCategory } from '../db/schema';

service AdminService @(path: '/admin', impl: 'srv/admin-service'){
    type CategoryPayload {
        ID: Integer;
        Name: String;
        Description: String;
    }
    entity ProductCategoryProjection as projection on ProductCategory {
        ID, Name, Description
    };
    action addProductCategory(payload: array of CategoryPayload) returns String;

}