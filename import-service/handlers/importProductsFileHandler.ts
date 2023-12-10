import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createResponse} from "../utils/utils";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
 try {
   const bucket = "shop-import-bucket";
   const client = new S3Client({ region: "eu-west-1" });
   const fileName = event.queryStringParameters?.name;
     console.log(fileName)
    if (!fileName) {
        return createResponse(400, { message: 'Filename is required' });
    }
    const key = `uploaded/${fileName}`;
     console.log(key)
    
    const putObjectCommand = new PutObjectCommand(
        {
               Bucket: bucket,
               Key: key,
               ContentType: "text/csv",
              });
    console.log(`Request: Method: ${event.requestContext}, Path: ${event.requestContext}, FileName: ${fileName}`);
    await client.send(putObjectCommand);
    
    const signedUrl = await getSignedUrl(client, putObjectCommand, { expiresIn: 3600 });
    return createResponse(200, signedUrl);
} catch (error) {
    console.error('Error:', error);
    // @ts-ignore
    return createResponse(500, { message: error.message });
    }
};

