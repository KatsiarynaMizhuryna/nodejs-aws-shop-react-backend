import { S3Event } from "aws-lambda";
import { S3Client, CopyObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import {createResponse} from "../utils/utils";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
const csvParser = require("csv-parser");


export const handler = async (event: S3Event): Promise<void> => {
    const client = new S3Client({ region: 'eu-west-1' });
    const sqsClient = new SQSClient({ region: "eu-west-1" });
    const bucket = event.Records[0].s3.bucket.name;
    const fileName = decodeURIComponent(
        event.Records[0].s3.object.key.replace(/\+/g, ' ')
    );
    const data = {
        Bucket: bucket,
        Key: fileName,
    };
    
    try {
       const readableStream = (await client.send(new GetObjectCommand(data))).Body as Readable;
        console.log('readableStream',readableStream)
        await new Promise<void>((resolve, reject) => {
            const parser = readableStream.pipe(csvParser());
            parser.on("data", async (obj: any) => {
            await sqsClient.send(
            new SendMessageCommand({
               QueueUrl: process.env.IMPORT_SQS_QUEUE!,
               MessageBody: JSON.stringify(obj),
           })
        );
    });
           parser.on("error", (error: any) => {
                reject(error);
            });
            
            parser.on("finish", () => {
                resolve();
            });
        });
        
        const copyData = {
            Bucket: bucket,
            CopySource: `${bucket}/${fileName}`,
            Key: fileName.replace("uploaded", "parsed"),
        };
        
        await client.send(new CopyObjectCommand(copyData));
        console.log("Object has been copied into parsed");
        
        await client.send(new DeleteObjectCommand(data));
        console.log("Object has been deleted from uploaded");
    } catch (error) {
        console.error("Error:", error);
        // @ts-ignore
        return createResponse(500, { message: error.message });
    }
};
