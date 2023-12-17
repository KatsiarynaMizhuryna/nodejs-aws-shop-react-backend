import { APIGatewayTokenAuthorizerEvent , APIGatewayAuthorizerResult } from 'aws-lambda';
require('dotenv').config();

const policy = (
    principalId: string,
    resource: string,
    effect = "Deny"
) => {
    return {
        principalId: principalId,
        policyDocument: {
            Version: "2012-10-17",
            Statement: [
                {
                    Action: "execute-api:Invoke",
                    Effect: effect,
                    Resource: resource,
                },
            ],
        },
    };
};

export const handler = async (event: APIGatewayTokenAuthorizerEvent ): Promise<APIGatewayAuthorizerResult> => {
    console.log("EVENT:", event);
    
    const token = event.authorizationToken;
    
    console.log("TOKEN:", token);
    
    const credentials = token.split(" ")[1];
    console.log('credentials', credentials)
    const buffer = Buffer.from(credentials, "base64");
    const [username, userPass] = buffer.toString("utf-8").split(":");
    const storedPassword = process.env[username];
    console.log(`username: ${username}, password: ${userPass}`);
    console.log('+++++++++++++++++++++')
    console.log('storedPassword:',storedPassword)
    
    const effect =
        !storedPassword || storedPassword !== userPass ? "Deny" : "Allow";
    try {
        if (token === 'Basic null') {
            console.log('========================================')
            console.log("Authorization header is not provided");
            console.log('Token: ', token)
            console.log('========================================')
            throw Error("Unauthorized");
        }
        return policy(token, event.methodArn, effect);
    }
    catch (error) {
        console.log("Invalid auth token. error => ", error);
        return policy(token, event.methodArn);
    }
};
