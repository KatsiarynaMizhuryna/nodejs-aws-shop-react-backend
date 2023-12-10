import { v4 as uuidv4 } from 'uuid';
import {DynamoDBDocumentClient, TransactWriteCommand} from '@aws-sdk/lib-dynamodb';
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";

const dynamoDBClient = new DynamoDBClient({ region: "eu-west-1",});
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);
export const createProductLogic = async (requestData: any) => {
    const id = uuidv4();
    
    const transactWriteCommand = new TransactWriteCommand({
      TransactItems: [
          {
              Put: {
                  TableName: 'Products',
                  Item: {
                      id: id,
                      description: requestData.description,
                      price: requestData.price,
                      title: requestData.title,
                  },
              },
          },
          {
              Put: {
                  TableName: 'Stocks',
                  Item: {
                      product_id: id,
                      count: requestData.count,
                  },
              },
          },
      ],
  });

    await documentClient.send(transactWriteCommand);
    
    return {
        id: id,
        description: requestData.description,
        price: requestData.price,
        title: requestData.title,
        count: requestData.count
    };
};
