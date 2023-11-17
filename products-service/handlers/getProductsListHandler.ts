import { products} from "../products";

// @ts-ignore
export const createResponse = (statusCode, body) => ({
    statusCode: statusCode,
    headers:{
        'Access-Control-Allow_Credentials': true,
        'Access-Control-Allow_Origin': '*',
        'Access-Control-Allow_Headers': '*',
    },
    body: JSON.stringify(body)
})

export const handler = async (event: any) => {
    try {
        console.log('HELLO', event)
        return createResponse(200, products)}
    catch (err) {
        // @ts-ignore
        return createResponse(500, {message: err.message,})
    }
    }
