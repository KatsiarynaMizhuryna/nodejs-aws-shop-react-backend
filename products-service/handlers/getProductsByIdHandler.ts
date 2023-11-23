import { products } from "../products";
import { createResponse } from "../utils/utils";

export const getProductById = (productId: string) => {
    return products.find((product) => product.id === productId);
};

export const handler = async (event: any) => {
    try {
        const productId = event.pathParameters.productId;
        
        if (!productId) {
            return createResponse(400, { message: "Product ID is required" });
        }
        
        const product = getProductById(productId);
        
        if (!product) {
            return createResponse(404, { message: "Product not found" });
        }
        
        return createResponse(200, product);
    } catch (err) {
        // @ts-ignore
        return createResponse(500, { message: err.message });
    }
};
