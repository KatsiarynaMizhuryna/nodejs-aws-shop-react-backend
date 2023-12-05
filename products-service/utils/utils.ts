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
