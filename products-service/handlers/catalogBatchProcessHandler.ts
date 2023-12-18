import {createResponse} from "../utils/utils";
import {PublishCommand, SNSClient} from '@aws-sdk/client-sns';
import { createProductLogic} from "../dynamoDB/createProductLogic";

 const snsClient = new SNSClient({region: process.env.PRODUCT_AWS_REGION})

 export const handler = async(event) => {
 try {
     console.log('====================');
    console.log('sqs event', event);
    const {Records = []} = event;
    
    for (const record of Records) {
      const newProductData = await createProductLogic(JSON.parse(record.body));
      console.log(newProductData)
      await snsClient.send(
      new PublishCommand({
        Subject: 'New files have been added to Catalog',
        Message: JSON.stringify(newProductData),
        TopicArn: process.env.IMPORT_PRODUCT_TOPIC_ARN,
        MessageAttributes: {
            count: {
                DataType: 'Number',
                StringValue: newProductData.count.toString(),
               }
            }
         })
       )
        console.log('===============================');
        console.log('newProductData', newProductData);
     }
     
     return createResponse(200, Records)
     } catch (err) {
         console.log(err)
         return createResponse(500, err)
     }
 }
