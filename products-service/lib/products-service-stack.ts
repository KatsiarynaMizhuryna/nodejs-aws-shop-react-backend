import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {PolicyStatement, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";
import { Runtime } from 'aws-cdk-lib/aws-lambda';

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
          PRODUCT_TABLE_NAME: 'Products',
          STOCK_TABLE_NAME: 'Stocks'},
      functionName:'getProductsList',
      entry:'handlers/getProductsListHandler.ts',
      role,
      
    });
    
    const getProductsById = new NodejsFunction(this, "getProductsByIdLambda", {
        runtime: Runtime.NODEJS_20_X,
        environment: {
           PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
           PRODUCT_TABLE_NAME: 'Products',
           STOCK_TABLE_NAME: 'Stocks'},
       functionName:'getProductsById',
       entry:'handlers/getProductsByIdHandler.ts',
       role,
      });
      
      const createProduct = new NodejsFunction(this, "createProductLambda", {
          environment: {
              PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
              PRODUCT_TABLE_NAME: 'Products',
              STOCK_TABLE_NAME: 'Stocks'},
          functionName:'createProduct',
          entry:'handlers/createProductHandler.ts',
          role,
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
