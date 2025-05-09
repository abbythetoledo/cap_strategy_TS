

service OrderService @(path: '/orders'){
    action addProductCategory(id: Integer, name: String, description: String);
    action selectProductCategory(id: Integer)
}