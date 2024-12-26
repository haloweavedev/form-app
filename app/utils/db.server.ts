import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  PutCommand,
  GetCommand,
  ScanCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.COGNITO_REGION
});

const docClient = DynamoDBDocumentClient.from(client);

export async function saveFormSubmission(userEmail: string, formData: any) {
  const command = new PutCommand({
    TableName: "mindwell-forms",
    Item: {
      userEmail,
      ...formData,
      submittedAt: new Date().toISOString()
    }
  });

  return docClient.send(command);
}

export async function getFormSubmission(userEmail: string) {
  const command = new GetCommand({
    TableName: "mindwell-forms",
    Key: {
      userEmail
    }
  });

  return docClient.send(command);
}

export async function getAllSubmissions() {
  const command = new ScanCommand({
    TableName: "mindwell-forms"
  });

  return docClient.send(command);
}