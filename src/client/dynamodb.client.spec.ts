import { DynamoDB } from "aws-sdk";

import { DynamoDBClient } from "./dynamodb.client";

// Mock DynamoDB.DocumentClient
jest.mock("aws-sdk", () => ({
  DynamoDB: {
    DocumentClient: jest.fn(),
  },
}));

describe("DynamoDBClient", () => {
  describe("getInstance", () => {
    it("should return an instance of DynamoDBClient", () => {
      const instance = DynamoDBClient.getInstance();
      expect(instance).toBeInstanceOf(DynamoDBClient);
    });

    it("should return the same instance of DynamoDBClient on subsequent calls", () => {
      const instance1 = DynamoDBClient.getInstance();
      const instance2 = DynamoDBClient.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("getClient", () => {
    it("should return an instance of DynamoDB.DocumentClient", () => {
      const instance = DynamoDBClient.getInstance();
      const client = instance.getClient();
      expect(client).toBeInstanceOf(DynamoDB.DocumentClient);
    });
  });
});
