/* eslint-disable @typescript-eslint/unbound-method */
import { DynamoDBClient } from "../../client/dynamodb.client";
import { DRIVER_TIPS_TABLE_NAME } from "../../config";

import { getDriverTips, storeDriverTip } from "./driverTips.repository";

import type { DriverTipEvent } from "../../models/drivertips";

jest.mock("../../client/dynamodb.client");

describe("driverTips", () => {
  const mockDynamoDbClient = DynamoDBClient.getInstance().getClient();
  const mockDriverTipEvent: DriverTipEvent = {
    driverId: "test-driver-id",
    amount: "50",
    eventTime: new Date().toISOString(),
  };
  const mockDriverTipsData = {
    Item: {
      driverId: "test-driver-id",
      todayTips: 100,
      weeklyTips: 200,
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("getDriverTips", () => {
    it("should return driver tips data when driverId exists", async () => {
      mockDynamoDbClient.get = jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue(mockDriverTipsData),
      });
      const driverTips = await getDriverTips(mockDriverTipsData.Item.driverId);
      expect(mockDynamoDbClient.get).toHaveBeenCalledWith({
        TableName: DRIVER_TIPS_TABLE_NAME,
        Key: {
          driverIdParam: mockDriverTipsData.Item.driverId,
        },
      });
      expect(driverTips).toEqual({
        driverId: mockDriverTipsData.Item.driverId,
        todayTips: mockDriverTipsData.Item.todayTips,
        weeklyTips: mockDriverTipsData.Item.weeklyTips,
      });
    });

    it("should throw error when driverId does not exist", async () => {
      mockDynamoDbClient.get = jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      });
      await expect(
        getDriverTips("non-existent-driver-id")
      ).rejects.toThrowError(
        "No tipping information found for driver id non-existent-driver-id"
      );
      expect(mockDynamoDbClient.get).toHaveBeenCalledWith({
        TableName: DRIVER_TIPS_TABLE_NAME,
        Key: {
          driverIdParam: "non-existent-driver-id",
        },
      });
    });

    it("should throw error when DynamoDB get operation fails", async () => {
      mockDynamoDbClient.get = jest.fn().mockReturnValue({
        promise: jest.fn().mockRejectedValue("DynamoDB get operation failed"),
      });
      await expect(
        getDriverTips(mockDriverTipsData.Item.driverId)
      ).rejects.toThrowError(
        "Failed to get the tipping information of driver id test-driver-id: DynamoDB get operation failed"
      );
      expect(mockDynamoDbClient.get).toHaveBeenCalledWith({
        TableName: DRIVER_TIPS_TABLE_NAME,
        Key: {
          driverIdParam: mockDriverTipsData.Item.driverId,
        },
      });
    });
  });

  describe("storeDriverTip", () => {
    it("should update daily tips when event is from today", async () => {
      const todayTimestamp = new Date(
        new Date().setUTCHours(0, 0, 0, 0)
      ).getTime();
      const mockUpdateParams = {
        TableName: DRIVER_TIPS_TABLE_NAME,
        Key: { driverId: mockDriverTipEvent.driverId },
        UpdateExpression: "ADD todayTips :todayAmount",
        ExpressionAttributeValues: {
          ":todayAmount": mockDriverTipEvent.amount,
        },
      };
      mockDynamoDbClient.update = jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      });
      await storeDriverTip({
        ...mockDriverTipEvent,
        eventTime: new Date(todayTimestamp + 1000).toISOString(),
      });
      expect(mockDynamoDbClient.update).toHaveBeenCalledWith(mockUpdateParams);
    });
  });
});
