import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Runtime, Function, CfnPermission } from 'aws-cdk-lib/aws-lambda';
import * as  s3  from "aws-cdk-lib/aws-s3";
import * as s3notifications from "aws-cdk-lib/aws-s3-notifications";
import * as sqs  from 'aws-cdk-lib/aws-sqs';
import {
    HttpLambdaAuthorizer, HttpLambdaResponseType
} from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";
require('dotenv').config()

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);
     
    
    const bucket = s3.Bucket.fromBucketName(this, 'importProductBucket', 'shop-import-bucket');
    const queue = sqs.Queue.fromQueueArn(this, 'catalog-items-queue','arn:aws:sqs:eu-west-1:431649919812:catalog-items-queue')
    
    const importProductsFile = new NodejsFunction(this, "importProductsFileLambda", {
        runtime: Runtime.NODEJS_20_X,
        environment: {
            PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
            IMPORT_SQS_QUEUE: queue.queueUrl
        },
        functionName:'importProductsFile',
        entry:'handlers/importProductsFileHandler.ts',
    });
      
      bucket.grantReadWrite(importProductsFile);
    
    const importFileParser  = new NodejsFunction(this, "importFileParserLambda", {
          runtime: Runtime.NODEJS_20_X,
          environment: {
              PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
              IMPORT_SQS_QUEUE: queue.queueUrl
          },
          functionName:'importFileParser',
          entry:'handlers/importFileParserHandler.ts',
          });
      
    bucket.grantReadWrite(importFileParser);
    queue.grantSendMessages(importFileParser);
    
    bucket.addEventNotification(
          s3.EventType.OBJECT_CREATED,
          new s3notifications.LambdaDestination(importFileParser),
          { prefix: "uploaded/" })
      
    const api = new apiGateway.HttpApi(this, 'ImportFileAPI', {
        corsPreflight: {
            allowHeaders: ['*'],
            allowOrigins: ['*'],
            allowMethods: [apiGateway.CorsHttpMethod.ANY],
        },
    });
     
     
     const basicAuthorizer = Function.fromFunctionArn(
          this,
          "basicAuthorizerLambda",
          process.env.ARN_BASIC_AUTHORIZER!
      );
      
     const authorizer = new HttpLambdaAuthorizer(
          "BasicAuthorizer",
          basicAuthorizer,
          {
              responseTypes: [HttpLambdaResponseType.IAM],
              resultsCacheTtl: cdk.Duration.seconds(0)
          }
      );
      new CfnPermission(this, 'LambdaAuthorizerPermission', {
          action: 'lambda:InvokeFunction',
          functionName: basicAuthorizer.functionName,
          principal: 'apigateway.amazonaws.com',
          sourceAccount: this.account,
      });
      
    api.addRoutes({
        integration: new HttpLambdaIntegration('importProductsFile', importProductsFile),
        path: '/import',
        methods:[HttpMethod.GET],
        authorizer: authorizer
      })
 
  }
}
