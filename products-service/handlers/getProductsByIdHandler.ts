import { products } from "../mockData/products";
import { createResponse } from "../utils/utils";
import { DynamoDBDocumentClient, ExecuteStatementCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const dynamoDBClient = new DynamoDBClient({ region: "eu-west-1",});
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);
export const getProductById = (productId: string) => {
    return products.find((product) => product.id === productId);
};

export const handler = async (event: any) => {
    try {
        const productId = event.pathParameters.productId;
        
        const productIdQuery = new ExecuteStatementCommand(
            { Statement: 'SELECT * FROM Products WHERE id=?',
                Parameters: [productId],
                ConsistentRead: true,});
        const productResponse = (await documentClient.send(productIdQuery)).Items;
        
        const stockIdQuery = new ExecuteStatementCommand(
            { Statement: 'SELECT * FROM Stocks WHERE product_id=?',
                Parameters: [productId],
                ConsistentRead: true,});
        const stockResponse = (await documentClient.send(stockIdQuery)).Items;
        
        const combineResults = {
            ... productResponse[0],
            count: stockResponse[0].count,
        };
        
        if (!productId) {
            return createResponse(400, { message: "Product ID is required" });
        }
        
        if (!combineResults) {
            return createResponse(404, { message: "Product not found" });
        }
        
        return createResponse(200, combineResults);
    } catch (err) {
        // @ts-ignore
        return createResponse(500, { message: err.message });
    }
};
