import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";


export class ProductsServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    

    const getProductsList = new NodejsFunction(this, "getProductsListLambda", {
      // runtime: lambda.Runtime.NODEJS_18_X,
      environment: { PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!},
      functionName:'getProductsList',
      entry:'handlers/getProductsListHandler.ts'
      
    });
    
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
  }
}
