import { APIGatewayProxyHandler } from 'aws-lambda';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createResponse} from "../utils/utils";

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
    const bucket = "shop-import-bucket";
    const fileName = event.queryStringParameters?.name;
    
    if (!fileName) {
        return createResponse(400, { message: 'Filename is required' });
    }
    const key = `uploaded/${fileName}`;
    
    const client = new S3Client({ region: "eu-west-1" });
    
    const putObjectCommand = new PutObjectCommand({
     Bucket: bucket,
     Key: key,
     ContentType: "text/csv",
});
    console.log(`Request: Method: ${event.httpMethod}, Path: ${event.path}, FileName: ${fileName}`);
    
    // await client.send(putObjectCommand);
    const signedUrl = await getSignedUrl(client, putObjectCommand, { expiresIn: 300 });
    return createResponse(200, signedUrl);
    
    } catch (error) {
        console.error('Error generating signed URL:', error);
        // @ts-ignore
        return createResponse(500, { message: error.message });
        
    }
};

