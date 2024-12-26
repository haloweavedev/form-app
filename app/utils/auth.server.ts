// app/utils/auth.server.ts
import { 
  CognitoIdentityProviderClient, 
  InitiateAuthCommand, 
  SignUpCommand,
  ConfirmSignUpCommand
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({
  region: process.env.COGNITO_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export async function signUp(email: string, password: string) {
  try {
    const command = new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: "email",
          Value: email,
        },
      ],
    });

    const response = await client.send(command);
    return { success: true, data: response };
  } catch (error: any) {
    console.error('SignUp error:', error);
    return { success: false, error: error.message };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const response = await client.send(command);
    return { success: true, data: response };
  } catch (error: any) {
    console.error('SignIn error:', error);
    return { success: false, error: error.message };
  }
}

export async function confirmSignUp(email: string, confirmationCode: string) {
  try {
    const command = new ConfirmSignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: confirmationCode,
    });

    const response = await client.send(command);
    return { success: true, data: response };
  } catch (error: any) {
    console.error('Confirm SignUp error:', error);
    return { success: false, error: error.message };
  }
}