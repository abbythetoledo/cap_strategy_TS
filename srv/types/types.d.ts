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