import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from 'aws-cdk-lib/aws-lambda';

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const basicAuthorizer = new NodejsFunction(this, "basicAuthorizerLambda", {
      runtime: Runtime.NODEJS_20_X,
      environment: { PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION! },
      functionName:'basicAuthorizer',
      entry:'handlers/basicAuthorizerHandler.ts',
    });
  }
}
