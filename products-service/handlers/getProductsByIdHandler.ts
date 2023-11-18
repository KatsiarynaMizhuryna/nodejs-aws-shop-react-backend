import { products} from "../products";
import { createResponse} from "../utils/utils";

export const getProductById = (productId: string) => {
    return products.find(product => product.id === productId);
};

export const handler = async (event: any) => {
    try {
        console.log('HELLO', event)
        return createResponse(200, products[0].id)}
    catch (err) {
        // @ts-ignore
        return createResponse(500, {message: err.message,})
    }
}
