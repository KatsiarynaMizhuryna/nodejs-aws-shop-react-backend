import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient, TransactWriteCommand} from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

const dynamoDBClient = new DynamoDBClient({ region: "eu-west-1",});
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const requestBody = JSON.parse(event.body || '{}');
        const id = uuidv4()
        
        
        const transactWriteCommand = new TransactWriteCommand( {
            TransactItems: [
                {
                    Put: {
                        TableName: 'Products',
                        Item: {
                            id: id,
                            description: requestBody.description,
                            price: requestBody.price,
                            title: requestBody.title
                        }
                    }
                },
                {
                    Put: {
                        TableName: 'Stocks',
                        Item: {
                            product_id: id,
                            count: requestBody.count
                        }
                    }
                }
            ]
        });
        await documentClient.send(transactWriteCommand);
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
