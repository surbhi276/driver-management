/* eslint-disable @typescript-eslint/no-unsafe-return */
import { DynamoDB } from "aws-sdk";

export class DynamoDBClient {
  private static instance: DynamoDBClient;

  private readonly DynamoDbClient: DynamoDB.DocumentClient;

  private constructor() {
    console.log("Creating new DynamoDB client");
    this.DynamoDbClient = new DynamoDB.DocumentClient();
  }

  public static getInstance(): DynamoDBClient {
    console.log("Creating new DynamoDB dd");
    if (!DynamoDBClient.instance) {
      console.log("Creating new ddd client");
      DynamoDBClient.instance = new DynamoDBClient();
    }
    console.log("dddd new DynamoDB client");
    return DynamoDBClient.instance;
  }

  public getClient(): DynamoDB.DocumentClient {
    console.log("Creating new ssss client");
    return this.DynamoDbClient;
  }
}
