/* eslint-disable @typescript-eslint/unbound-method */
import { DynamoDBClient } from "../../client/dynamodb.client";
import { DRIVER_TIPS_TABLE_NAME } from "../../config";

import {
  getDriverTipsWithinRange,
  storeDriverTip,
} from "./driverTips.repository";

import type { DriverTip } from "../../models/driverTips";

jest.mock("aws-sdk", () => {
  const mDynamoDB = {
    put: jest.fn().mockReturnThis(),
    query: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };
  const mDocumentClient = {
    put: jest.fn(() => mDynamoDB),
    query: jest.fn(() => mDynamoDB),
  };
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mDocumentClient),
    },
  };
});

describe("DriverTips.repository", () => {
  beforeEach(() => {
    // Clear all mock calls before each test
    jest.clearAllMocks();
  });
  describe("getDriverTipsWithinRange", () => {
    it("should get driver tips from DynamoDB and return the correct data", async () => {
      const driverId = "123";
      const mockedDataToday = {
        Items: [
          {
            amount: { S: "100" },
          },
        ],
      };
      const mockedDataCurrentWeek = {
        Items: [
          {
            amount: { S: "500" },
          },
        ],
      };
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const startOfCurrentWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay()
      );
      const expectedOutput = {
        driverId: "123",
        todayTips: 100,
        weeklyTips: 500,
      };
      const mockQuery = DynamoDBClient.getInstance().getClient()
        .query as jest.Mock;
      mockQuery
        .mockReturnValueOnce({
          promise: jest.fn().mockResolvedValueOnce(mockedDataToday),
        })
        .mockReturnValueOnce({
          promise: jest.fn().mockResolvedValueOnce(mockedDataCurrentWeek),
        });

      const driverTips = await getDriverTipsWithinRange(driverId);

      expect(driverTips).toEqual(expectedOutput);
      expect(
        DynamoDBClient.getInstance().getClient().query
      ).toHaveBeenCalledTimes(2);
      expect(
        DynamoDBClient.getInstance().getClient().query
      ).toHaveBeenCalledWith({
        TableName: DRIVER_TIPS_TABLE_NAME,
        KeyConditionExpression: "driverId = :id AND eventTime >= :startOfToday",
        ExpressionAttributeValues: {
          ":id": { S: driverId },
          ":startOfToday": { S: startOfToday.toISOString() },
        },
        ProjectionExpression: "amount",
      });
      expect(
        DynamoDBClient.getInstance().getClient().query
      ).toHaveBeenCalledWith({
        TableName: DRIVER_TIPS_TABLE_NAME,
        KeyConditionExpression:
          "driverId = :id AND eventTime >= :startOfCurrentWeek",
        ExpressionAttributeValues: {
          ":id": { S: driverId },
          ":startOfCurrentWeek": { S: startOfCurrentWeek.toISOString() },
        },
        ProjectionExpression: "amount",
      });
    });

    it("should throw an error if any error occurs while querying for today amount", async () => {
      const driverId = "123";
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const expectedError = new Error("Error Occured");
      const mockQuery = DynamoDBClient.getInstance().getClient()
        .query as jest.Mock;
      mockQuery.mockReturnValueOnce({
        promise: jest.fn().mockRejectedValueOnce(new Error("Error Occured")),
      });

      await expect(getDriverTipsWithinRange(driverId)).rejects.toThrow(
        expectedError
      );
      expect(
        DynamoDBClient.getInstance().getClient().query
      ).toHaveBeenCalledTimes(2);
      expect(
        DynamoDBClient.getInstance().getClient().query
      ).toHaveBeenCalledWith({
        TableName: DRIVER_TIPS_TABLE_NAME,
        KeyConditionExpression: "driverId = :id AND eventTime >= :startOfToday",
        ExpressionAttributeValues: {
          ":id": { S: driverId },
          ":startOfToday": { S: startOfToday.toISOString() },
        },
        ProjectionExpression: "amount",
      });
    });

    it("should throw an error if any error occurs while querying for current week amount", async () => {
      const driverId = "123";
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const mockedDataToday = {
        Items: [
          {
            amount: { S: "100" },
          },
        ],
      };
      const expectedError = new Error("Error Occured");
      const mockQuery = DynamoDBClient.getInstance().getClient()
        .query as jest.Mock;
      mockQuery
        .mockReturnValueOnce({
          promise: jest.fn().mockResolvedValueOnce(mockedDataToday),
        })
        .mockReturnValueOnce({
          promise: jest.fn().mockRejectedValueOnce(new Error("Error Occured")),
        });

      await expect(getDriverTipsWithinRange(driverId)).rejects.toThrow(
        expectedError
      );
      expect(
        DynamoDBClient.getInstance().getClient().query
      ).toHaveBeenCalledTimes(2);
      expect(
        DynamoDBClient.getInstance().getClient().query
      ).toHaveBeenCalledWith({
        TableName: DRIVER_TIPS_TABLE_NAME,
        KeyConditionExpression: "driverId = :id AND eventTime >= :startOfToday",
        ExpressionAttributeValues: {
          ":id": { S: driverId },
          ":startOfToday": { S: startOfToday.toISOString() },
        },
        ProjectionExpression: "amount",
      });
    });

    it("should get driver tips from DynamoDB and return the correct data with multiple entries", async () => {
      const driverId = "123";
      const mockedDataToday = {
        Items: [
          {
            amount: { S: "100" },
          },
          {
            amount: { S: "100" },
          },
          {
            amount: { S: "100" },
          },
        ],
      };
      const mockedDataCurrentWeek = {
        Items: [
          {
            amount: { S: "500" },
          },
          {
            amount: { S: "500" },
          },
          {
            amount: { S: "500" },
          },
        ],
      };
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const startOfCurrentWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay()
      );
      const expectedOutput = {
        driverId: "123",
        todayTips: 300,
        weeklyTips: 1500,
      };
      const mockQuery = DynamoDBClient.getInstance().getClient()
        .query as jest.Mock;
      mockQuery
        .mockReturnValueOnce({
          promise: jest.fn().mockResolvedValueOnce(mockedDataToday),
        })
        .mockReturnValueOnce({
          promise: jest.fn().mockResolvedValueOnce(mockedDataCurrentWeek),
        });

      const driverTips = await getDriverTipsWithinRange(driverId);

      expect(driverTips).toEqual(expectedOutput);
      expect(
        DynamoDBClient.getInstance().getClient().query
      ).toHaveBeenCalledTimes(2);
      expect(
        DynamoDBClient.getInstance().getClient().query
      ).toHaveBeenCalledWith({
        TableName: DRIVER_TIPS_TABLE_NAME,
        KeyConditionExpression: "driverId = :id AND eventTime >= :startOfToday",
        ExpressionAttributeValues: {
          ":id": { S: driverId },
          ":startOfToday": { S: startOfToday.toISOString() },
        },
        ProjectionExpression: "amount",
      });
      expect(
        DynamoDBClient.getInstance().getClient().query
      ).toHaveBeenCalledWith({
        TableName: DRIVER_TIPS_TABLE_NAME,
        KeyConditionExpression:
          "driverId = :id AND eventTime >= :startOfCurrentWeek",
        ExpressionAttributeValues: {
          ":id": { S: driverId },
          ":startOfCurrentWeek": { S: startOfCurrentWeek.toISOString() },
        },
        ProjectionExpression: "amount",
      });
    });

    it("should get driver tips from DynamoDB and if no entry is found", async () => {
      const driverId = "123";
      const mockedDataToday = {
        Items: [],
      };
      const mockedDataCurrentWeek = {
        Items: [],
      };
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const startOfCurrentWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay()
      );
      const expectedOutput = {
        driverId: "123",
        todayTips: 0,
        weeklyTips: 0,
      };
      const mockQuery = DynamoDBClient.getInstance().getClient()
        .query as jest.Mock;
      mockQuery
        .mockReturnValueOnce({
          promise: jest.fn().mockResolvedValueOnce(mockedDataToday),
        })
        .mockReturnValueOnce({
          promise: jest.fn().mockResolvedValueOnce(mockedDataCurrentWeek),
        });

      const driverTips = await getDriverTipsWithinRange(driverId);

      expect(driverTips).toEqual(expectedOutput);
      expect(
        DynamoDBClient.getInstance().getClient().query
      ).toHaveBeenCalledTimes(2);
      expect(
        DynamoDBClient.getInstance().getClient().query
      ).toHaveBeenCalledWith({
        TableName: DRIVER_TIPS_TABLE_NAME,
        KeyConditionExpression: "driverId = :id AND eventTime >= :startOfToday",
        ExpressionAttributeValues: {
          ":id": { S: driverId },
          ":startOfToday": { S: startOfToday.toISOString() },
        },
        ProjectionExpression: "amount",
      });
      expect(
        DynamoDBClient.getInstance().getClient().query
      ).toHaveBeenCalledWith({
        TableName: DRIVER_TIPS_TABLE_NAME,
        KeyConditionExpression:
          "driverId = :id AND eventTime >= :startOfCurrentWeek",
        ExpressionAttributeValues: {
          ":id": { S: driverId },
          ":startOfCurrentWeek": { S: startOfCurrentWeek.toISOString() },
        },
        ProjectionExpression: "amount",
      });
    });

    it("should get driver tips from DynamoDB and if no entry is found", async () => {
      const driverId = "123";
      const mockedDataToday = {
        Items: [],
      };
      const mockedDataCurrentWeek = {
        Items: [],
      };
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const startOfCurrentWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay()
      );
      const expectedOutput = {
        driverId: "123",
        todayTips: 0,
        weeklyTips: 0,
      };
      const mockQuery = DynamoDBClient.getInstance().getClient()
        .query as jest.Mock;
      mockQuery
        .mockReturnValueOnce({
          promise: jest.fn().mockResolvedValueOnce(mockedDataToday),
        })
        .mockReturnValueOnce({
          promise: jest.fn().mockResolvedValueOnce(mockedDataCurrentWeek),
        });

      const driverTips = await getDriverTipsWithinRange(driverId);

      expect(driverTips).toEqual(expectedOutput);
      expect(
        DynamoDBClient.getInstance().getClient().query
      ).toHaveBeenCalledTimes(2);
      expect(
        DynamoDBClient.getInstance().getClient().query
      ).toHaveBeenCalledWith({
        TableName: DRIVER_TIPS_TABLE_NAME,
        KeyConditionExpression: "driverId = :id AND eventTime >= :startOfToday",
        ExpressionAttributeValues: {
          ":id": { S: driverId },
          ":startOfToday": { S: startOfToday.toISOString() },
        },
        ProjectionExpression: "amount",
      });
      expect(
        DynamoDBClient.getInstance().getClient().query
      ).toHaveBeenCalledWith({
        TableName: DRIVER_TIPS_TABLE_NAME,
        KeyConditionExpression:
          "driverId = :id AND eventTime >= :startOfCurrentWeek",
        ExpressionAttributeValues: {
          ":id": { S: driverId },
          ":startOfCurrentWeek": { S: startOfCurrentWeek.toISOString() },
        },
        ProjectionExpression: "amount",
      });
    });

    it("should get driver tips from DynamoDB and if no amount is available", async () => {
      const driverId = "123";
      const mockedDataToday = {
        Items: [{}],
      };
      const mockedDataCurrentWeek = {
        Items: [{}],
      };
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const startOfCurrentWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay()
      );
      const expectedOutput = {
        driverId: "123",
        todayTips: 0,
        weeklyTips: 0,
      };
      const mockQuery = DynamoDBClient.getInstance().getClient()
        .query as jest.Mock;
      mockQuery
        .mockReturnValueOnce({
          promise: jest.fn().mockResolvedValueOnce(mockedDataToday),
        })
        .mockReturnValueOnce({
          promise: jest.fn().mockResolvedValueOnce(mockedDataCurrentWeek),
        });

      const driverTips = await getDriverTipsWithinRange(driverId);

      expect(driverTips).toEqual(expectedOutput);
      expect(
        DynamoDBClient.getInstance().getClient().query
      ).toHaveBeenCalledTimes(2);
      expect(
        DynamoDBClient.getInstance().getClient().query
      ).toHaveBeenCalledWith({
        TableName: DRIVER_TIPS_TABLE_NAME,
        KeyConditionExpression: "driverId = :id AND eventTime >= :startOfToday",
        ExpressionAttributeValues: {
          ":id": { S: driverId },
          ":startOfToday": { S: startOfToday.toISOString() },
        },
        ProjectionExpression: "amount",
      });
      expect(
        DynamoDBClient.getInstance().getClient().query
      ).toHaveBeenCalledWith({
        TableName: DRIVER_TIPS_TABLE_NAME,
        KeyConditionExpression:
          "driverId = :id AND eventTime >= :startOfCurrentWeek",
        ExpressionAttributeValues: {
          ":id": { S: driverId },
          ":startOfCurrentWeek": { S: startOfCurrentWeek.toISOString() },
        },
        ProjectionExpression: "amount",
      });
    });
  });
  describe("storeDriverTip", () => {
    it("should store the driver tip data", async () => {
      const driverTip: DriverTip = {
        driverId: "123",
        amount: "10",
        eventTime: "2021-04-04",
      };
      await storeDriverTip(driverTip);
      expect(DynamoDBClient.getInstance().getClient().put).toHaveBeenCalledWith(
        {
          TableName: DRIVER_TIPS_TABLE_NAME,
          Item: driverTip,
        }
      );
    });

    it("should update throw error if any error occurs", async () => {
      const DriverTip: DriverTip = {
        driverId: "123",
        amount: "10",
        eventTime: "2022-04-04",
      };
      const expectedError = new Error("error occured");

      const mockPut = DynamoDBClient.getInstance().getClient().put as jest.Mock;
      mockPut.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error("error occured")),
      });

      await expect(storeDriverTip(DriverTip)).rejects.toThrow(expectedError);
    });
  });
});
