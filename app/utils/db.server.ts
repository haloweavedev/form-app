import { 
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  PutCommand,
  GetCommand,
  ScanCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const docClient = DynamoDBDocumentClient.from(client);

export async function saveFormSubmission(userId: string, userEmail: string, formData: any) {
  const command = new PutCommand({
    TableName: "mindwell-forms",
    Item: {
      userEmail,  // Primary key
      userId,     // Additional attribute
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

export async function deleteFormSubmission(userEmail: string) {
  const command = new DeleteCommand({
    TableName: "mindwell-forms",
    Key: {
      userEmail
    }
  });

  return docClient.send(command);
}