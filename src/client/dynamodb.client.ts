import { DynamoDB } from "aws-sdk";

export class DynamoDBClient {
  private static instance: DynamoDBClient;

  private readonly DynamoDbClient: DynamoDB.DocumentClient;

  private constructor() {
    this.DynamoDbClient = new DynamoDB.DocumentClient();
  }

  public static getInstance(): DynamoDBClient {
    if (!DynamoDBClient.instance) {
      DynamoDBClient.instance = new DynamoDBClient();
    }
    return DynamoDBClient.instance;
  }

  public getClient(): DynamoDB.DocumentClient {
    return this.DynamoDbClient;
  }
}
