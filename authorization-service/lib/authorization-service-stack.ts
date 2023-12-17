import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import {PolicyStatement} from "aws-cdk-lib/aws-iam";
require('dotenv').config()

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const basicAuthorizer = new NodejsFunction(this, "basicAuthorizerLambda", {
      runtime: Runtime.NODEJS_20_X,
      environment: {
        PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
        katsiarynamizhuryna: process.env.katsiarynamizhuryna!
        },
      functionName:'basicAuthorizer',
      entry:'handlers/basicAuthorizerHandler.ts',
    });
    
    basicAuthorizer.addToRolePolicy(
      new PolicyStatement({
       actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
       resources: ['*'],
    })
    );
 
    new cdk.CfnOutput(this, 'basicAuthorizerArn', {
  value: basicAuthorizer.functionArn,
});
  }
}
