import { APIGatewayTokenAuthorizerEvent , APIGatewayAuthorizerResult } from 'aws-lambda';
require('dotenv').config();

const policy = (
    principalId: string,
    resource: string,
    effect = "Allow"
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
    const token = event.authorizationToken;
    const buffer = Buffer.from(token, "base64");
    const [username, userPass] = buffer.toString("utf-8").split(":");
    const storedPassword = process.env[username];
    console.log(`username: ${username}, password: ${userPass}`);
    
    const effect =
        !storedPassword || storedPassword !== userPass ? "Deny" : "Allow";
    try {
        if (!token) {
            console.log("Authorization header is not provided");
            throw Error("Unauthorized");
        }
        return policy(token, event.methodArn, effect);
    }
    catch (error) {
        console.log("Invalid auth token. error => ", error);
        return policy(token, event.methodArn, effect);
    }
};
