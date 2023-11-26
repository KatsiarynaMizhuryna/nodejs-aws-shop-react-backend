import { createResponse} from "../utils/utils";
import {DynamoDBDocumentClient, ExecuteStatementCommand, ScanCommand} from "@aws-sdk/lib-dynamodb";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDBClient = new DynamoDBClient({ region: "eu-west-1",});
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);


export const handler = async (event: any) => {
  try {
    const productQuery = new ExecuteStatementCommand(
        { Statement: 'SELECT * FROM Products',
                Parameters: [false],
                ConsistentRead: true,});
    const productResponse = (await documentClient.send(productQuery)).Items;
    
    const stockQuery = new ExecuteStatementCommand(
        { Statement: 'SELECT * FROM Stocks',
                Parameters: [false],
                ConsistentRead: true,});
    const stockResponse = (await documentClient.send(stockQuery)).Items;
    
    const combineResults = stockResponse.map((stock) => {
        const mixProduct = productResponse?.find((product) => stock.product_id === product.id);
        return {
            ...mixProduct,
            count: stock.count,
        };
    });
        
        console.log(combineResults, event);
        return createResponse(200, combineResults);
    } catch (err) {
        console.error('Error:', err.message);
        return createResponse(500, { message: err.message });
    }
};
