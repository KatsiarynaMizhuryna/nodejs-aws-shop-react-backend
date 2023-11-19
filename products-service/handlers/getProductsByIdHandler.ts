import { products} from "../products";
import { createResponse} from "../utils/utils";

export const getProductById = (productId: string) => {
    return products.find(product => product.id === productId);
};

export const handler = async (event: any) => {
    try {
        console.log('HELLO', event)
        return createResponse(200, getProductById("7567ec4b-b10c-48c5-9345-fc73c48a80a1"))}
    catch (err) {
        // @ts-ignore
        return createResponse(500, {message: err.message,})
    }
}
