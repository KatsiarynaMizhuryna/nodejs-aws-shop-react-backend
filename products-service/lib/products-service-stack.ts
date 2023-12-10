import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {PolicyStatement, Role, ServicePrincipal, Effect} from "aws-cdk-lib/aws-iam";
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as sns  from 'aws-cdk-lib/aws-sns';
import * as sqs  from 'aws-cdk-lib/aws-sqs';
import {SqsEventSource} from "aws-cdk-lib/aws-lambda-event-sources";
require('dotenv').config()

export class ProductsServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const role = new Role(this, "dynamodbAccessRole", {
          assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      });
      
      role.addToPolicy(
          new PolicyStatement({
              actions: ["dynamodb:*", "logs:PutLogEvents"],
              resources: ["*"],
          })
      );
      
    const getProductsList = new NodejsFunction(this, "getProductsListLambda", {
      runtime: Runtime.NODEJS_20_X,
      environment: {
          PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
          PRODUCT_TABLE_NAME: process.env.PRODUCT_TABLE_NAME!,
          STOCK_TABLE_NAME: process.env.STOCK_TABLE_NAME!},
      functionName:'getProductsList',
      entry:'handlers/getProductsListHandler.ts',
      role,
      
    });
    
    const getProductsById = new NodejsFunction(this, "getProductsByIdLambda", {
        runtime: Runtime.NODEJS_20_X,
        environment: {
           PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
           PRODUCT_TABLE_NAME: process.env.PRODUCT_TABLE_NAME!,
           STOCK_TABLE_NAME: process.env.STOCK_TABLE_NAME!},
       functionName:'getProductsById',
       entry:'handlers/getProductsByIdHandler.ts',
       role,
      });
      
    const createProduct = new NodejsFunction(this, "createProductLambda", {
          environment: {
           PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
           PRODUCT_TABLE_NAME: process.env.PRODUCT_TABLE_NAME!,
           STOCK_TABLE_NAME: process.env.STOCK_TABLE_NAME!},
        functionName:'createProduct',
        entry:'handlers/createProductHandler.ts',
          role,
      });
      
    const importProductTopic = new sns.Topic(this, 'importProductTopic', { topicName: 'import-product-topic'});
    
    const catalogItemsQueue = new sqs.Queue(this, 'catalogItemsQueue', { queueName: 'catalog-items-queue'} );
    
    const catalogItemsQueuePolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      principals: [new ServicePrincipal("lambda.amazonaws.com")],
      actions: ["sqs:SendMessage", "sqs:ReceiveMessage"],
      resources: ["*"],
  });
    
    catalogItemsQueue.addToResourcePolicy(catalogItemsQueuePolicy);
    
    new sns.Subscription(this, 'BigStockSubscription', {
          endpoint: process.env.BIG_STOCK_EMAIL || '',
          protocol:sns.SubscriptionProtocol.EMAIL,
          topic: importProductTopic,
    })
    
    const catalogBatchProcess = new NodejsFunction(this, "catalogBatchProcessLambda", {
          environment: {
              PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
              IMPORT_PRODUCT_TOPIC_ARN: importProductTopic.topicArn,
              PRODUCT_TABLE_NAME: 'Products',
              STOCK_TABLE_NAME: 'Stocks'},
          functionName:'catalogBatchProcess',
          entry:'handlers/catalogBatchProcessHandler.ts',
          role,
      });
    
    importProductTopic.grantPublish(catalogBatchProcess);
    
    catalogBatchProcess.addEventSource( new SqsEventSource(catalogItemsQueue, { batchSize: 5}))
    
    
    const api = new apiGateway.HttpApi(this,'ProductAPI',{corsPreflight:{
          allowHeaders:['*'],
          allowOrigins:['*'],
          allowMethods:[apiGateway.CorsHttpMethod.ANY]
        }});
    
    api.addRoutes({
      integration: new HttpLambdaIntegration('getProductsListIntegration', getProductsList),
      path: '/products',
      methods:[HttpMethod.GET]
    })
     
     api.addRoutes({
       integration: new HttpLambdaIntegration('getProductsByIdIntegration', getProductsById),
       path: '/products/{productId}',
       methods:[HttpMethod.GET]
     })
     
     api.addRoutes({
       integration: new HttpLambdaIntegration('createProductIntegration', createProduct),
       path: '/products',
       methods:[HttpMethod.POST]
     })
  }
}
