import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

const dynamoDBClient = new DynamoDBClient({ region: "eu-west-1",});
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const requestBody = JSON.parse(event.body || '{}');
      
        
        const productItem = {
            id: uuidv4(),
            title: requestBody.title,
            description: requestBody.description,
            price: requestBody.price,
        };
        const stockItem = {
            id: productItem.id,
            count: requestBody.count,
        };
        
        const putProductCommand = new PutCommand(
            {
                   TableName: 'Products',
                   Item: productItem,
                 });
        
        await dynamoDBClient.send(putProductCommand);
        
       
        const putStockCommand = new PutCommand(
            {
                   TableName: 'Stocks',
                   Item: stockItem,
               });
        
        await dynamoDBClient.send(putStockCommand);
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Product created successfully' }),
        };
    } catch (error) {
        console.error('Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
};
