import { products} from "../mockData/products";
import { createResponse} from "../utils/utils";

// @ts-ignore
export const handler = async (event: any) => {
    try {
        console.log('HELLO', event)
        return createResponse(200, products)}
    catch (err) {
        // @ts-ignore
        console.error('Error:', err.message);
        // @ts-ignore
        return createResponse(500, {message: err.message,})
    }
    }
