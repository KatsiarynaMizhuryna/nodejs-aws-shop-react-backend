import { APIGatewayProxyHandler } from 'aws-lambda';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createResponse} from "../utils/utils";

export const importProductsFile: APIGatewayProxyHandler = async (event) => {
    const bucket = "shop-import-bucket";
    const fileName = event.queryStringParameters?.name;
    const key = `uploaded/${fileName}`;
    
    const client = new S3Client({ region: "eu-west-1" });
    
    const putObjectCommand = new PutObjectCommand({
     Bucket: bucket,
     Key: key,
     ContentType: "text/csv",
});
    
    try {
        await client.send(putObjectCommand);
        const signedUrl = await getSignedUrl(client, putObjectCommand, { expiresIn: 60 });
        return createResponse(200, signedUrl);
       
    } catch (error) {
        console.error('Error generating signed URL:', error);
        // @ts-ignore
        return createResponse(500, { message: error.message });
        
    }
};

