import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as  s3  from "aws-cdk-lib/aws-s3";
import * as s3notifications from "aws-cdk-lib/aws-s3-notifications";
import {PolicyStatement, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);
     
    
    const bucket = s3.Bucket.fromBucketName(this, 'importProductBucket', 'shop-import-bucket')
    
    const importProductsFile = new NodejsFunction(this, "importProductsFileLambda", {
        runtime: Runtime.NODEJS_20_X,
        environment: { PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION! },
        functionName:'importProductsFile',
        entry:'handlers/importProductsFileHandler.ts',
    });
      
      bucket.grantReadWrite(importProductsFile);
    
    const importFileParser  = new NodejsFunction(this, "importFileParserLambda", {
          runtime: Runtime.NODEJS_20_X,
          environment: { PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION! },
          functionName:'importFileParser',
          entry:'handlers/importFileParserHandler.ts',
          });
      
    bucket.grantReadWrite(importFileParser);
    
    bucket.addEventNotification(
          s3.EventType.OBJECT_CREATED,
          new s3notifications.LambdaDestination(importFileParser),
          { prefix: "uploaded/" })
     
    
    const api = new apiGateway.HttpApi(this,'ImportFileAPI',{corsPreflight:{
        allowHeaders:['*'],
        allowOrigins:['*'],
        allowMethods:[apiGateway.CorsHttpMethod.ANY]
      }});
    
    api.addRoutes({
        integration: new HttpLambdaIntegration('importProductsFile', importProductsFile),
        path: '/import',
        methods:[HttpMethod.GET]
      })
 
  }
}
