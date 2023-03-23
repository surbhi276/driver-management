/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { DynamoDBClient } from "../../client/dynamodb.client";
import { DRIVER_TIPS_TABLE_NAME } from "../../config";

import {
  getDriverTips,
  resetDriverTip,
  storeDriverTip,
} from "./driverTips.repository";

import type { DriverTipEvent } from "../../models/shared/driverTipEvent";

// Mock the DynamoDB.DocumentClient class
jest.mock("aws-sdk", () => {
  const mDynamoDB = {
    get: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };
  const mDocumentClient = {
    get: jest.fn(() => mDynamoDB),
    update: jest.fn(() => mDynamoDB),
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
  describe("getDriverTips", () => {
    it("should get driver tips from DynamoDB and return the correct data", async () => {
      const mockedDriverTips = {
        driverId: "test-driver-1",
        todayTips: 100,
        weeklyTips: 500,
      };
      const mockGetResponse = { Item: mockedDriverTips };
      const mockGet = DynamoDBClient.getInstance().getClient().get as jest.Mock;
      mockGet.mockReturnValue({
        promise: jest.fn().mockResolvedValue(mockGetResponse),
      });

      const driverTips = await getDriverTips(mockedDriverTips.driverId);

      expect(driverTips).toEqual(mockedDriverTips);
      expect(DynamoDBClient.getInstance().getClient().get).toHaveBeenCalledWith(
        {
          TableName: DRIVER_TIPS_TABLE_NAME,
          Key: {
            driverIdParam: mockedDriverTips.driverId,
          },
        }
      );
    });

    it("should throw an error if no tipping information is found for the driver", async () => {
      const driverId = "test-driver-2";

      const mockGetResponse = { Item: null };
      const mockGet = DynamoDBClient.getInstance().getClient().get as jest.Mock;
      mockGet.mockReturnValue({
        promise: jest.fn().mockResolvedValue(mockGetResponse),
      });

      await expect(getDriverTips(driverId)).rejects.toThrow(
        `No tipping information found for driver id ${driverId}`
      );
    });

    it("should handle errors thrown by DynamoDB", async () => {
      const driverId = "test-driver-3";
      const expectedError = new Error("error occured");

      const mockGet = DynamoDBClient.getInstance().getClient().get as jest.Mock;
      mockGet.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error("error occured")),
      });

      await expect(getDriverTips(driverId)).rejects.toThrow(expectedError);
    });
  });
  describe("storeDriverTip", () => {
    it("should update daily and weekly tips if the event is from today and this week", async () => {
      const driverTipEvent: DriverTipEvent = {
        driverId: "123",
        amount: "10",
        eventTime: new Date().toISOString(),
      };

      const expectedParams = {
        TableName: DRIVER_TIPS_TABLE_NAME,
        Key: { driverId: "123" },
        UpdateExpression:
          "ADD todayTips :todayAmount, weeklyTips :weeklyAmount",
        ExpressionAttributeValues: {
          ":lastUpdatedTimestamp": driverTipEvent.eventTime,
          ":todayAmount": 10,
          ":weeklyAmount": 10,
        },
      };
      await storeDriverTip(driverTipEvent);

      expect(
        DynamoDBClient.getInstance().getClient().update
      ).toHaveBeenCalledWith(expectedParams);
    });

    it("should update throw error if any error occurs", async () => {
      const driverTipEvent: DriverTipEvent = {
        driverId: "123",
        amount: "10",
        eventTime: new Date("2025-04-04").toISOString(),
      };
      const expectedError = new Error("error occured");

      const mockUpdate = DynamoDBClient.getInstance().getClient()
        .update as jest.Mock;
      mockUpdate.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error("error occured")),
      });

      await expect(storeDriverTip(driverTipEvent)).rejects.toThrow(
        expectedError
      );
    });
  });

  describe("resetDriverTip", () => {
    it("should reset todayTips field in database", async () => {
      const driverId = "123";
      const currentDate = new Date(); // get the current date timestamp
      const previousDate = new Date(
        currentDate.getTime() - 24 * 60 * 60 * 1000
      );
      const lastUpdatedTimestamp = previousDate.toISOString();

      const expectedParams = {
        TableName: DRIVER_TIPS_TABLE_NAME,
        Key: { primaryKey: "123" },
        UpdateExpression: "SET todayTips = :value",
        ExpressionAttributeValues: { ":value": 0 },
      };

      const mockUpdate = DynamoDBClient.getInstance().getClient()
        .update as jest.Mock;
      mockUpdate.mockReturnValue({
        promise: jest.fn().mockResolvedValue("resolve"),
      });
      await resetDriverTip(driverId, lastUpdatedTimestamp);

      expect(
        DynamoDBClient.getInstance().getClient().update
      ).toHaveBeenCalledWith(expectedParams);
    });

    it("should reset weeklyTips field in database", async () => {
      const driverId = "123";
      const startOfCurrentWeekTimestamp =
        new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() -
        new Date().getUTCDay() * 24 * 60 * 60 * 1000;

      const oneDayBeforeStartOfCurrentWeek = new Date(
        startOfCurrentWeekTimestamp - 24 * 60 * 60 * 1000
      );
      const lastUpdatedTimestamp = oneDayBeforeStartOfCurrentWeek.toISOString();

      const expectedParamsTodayTips = {
        TableName: DRIVER_TIPS_TABLE_NAME,
        Key: { primaryKey: "123" },
        UpdateExpression: "SET todayTips = :value",
        ExpressionAttributeValues: { ":value": 0 },
      };
      const expectedParamsWeeklyTips = {
        TableName: DRIVER_TIPS_TABLE_NAME,
        Key: { primaryKey: "123" },
        UpdateExpression: "SET weeklyTips = :value",
        ExpressionAttributeValues: { ":value": 0 },
      };

      const mockUpdate = DynamoDBClient.getInstance().getClient()
        .update as jest.Mock;
      mockUpdate.mockReturnValue({
        promise: jest.fn().mockResolvedValue("resolve"),
      });
      await resetDriverTip(driverId, lastUpdatedTimestamp);

      expect(DynamoDBClient.getInstance().getClient().update).toBeCalledTimes(
        2
      );
      expect(
        DynamoDBClient.getInstance().getClient().update
      ).toHaveBeenCalledWith(expectedParamsTodayTips);

      expect(
        DynamoDBClient.getInstance().getClient().update
      ).toHaveBeenCalledWith(expectedParamsWeeklyTips);
    });

    it("should update throw error if any error occurs", async () => {
      const driverId = "123";
      const currentDate = new Date(); // get the current date timestamp
      const previousDate = new Date(
        currentDate.getTime() - 24 * 60 * 60 * 1000
      );
      const lastUpdatedTimestamp = previousDate.toISOString();

      const expectedError = new Error("error occured");

      const mockUpdate = DynamoDBClient.getInstance().getClient()
        .update as jest.Mock;
      mockUpdate.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error("error occured")),
      });

      await expect(
        resetDriverTip(driverId, lastUpdatedTimestamp)
      ).rejects.toThrow(expectedError);
    });
  });
});
