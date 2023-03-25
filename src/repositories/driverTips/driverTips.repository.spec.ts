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
    scan: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };
  const mDocumentClient = {
    put: jest.fn(() => mDynamoDB),
    scan: jest.fn(() => mDynamoDB),
  };
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mDocumentClient),
    },
  };
});

describe("DriverTips", () => {
  const mockPut = DynamoDBClient.getInstance().getClient().put as jest.Mock;
  const mockPutPromise = jest.fn();
  mockPut.mockReturnValue({
    promise: mockPutPromise,
  });

  const mockScan = DynamoDBClient.getInstance().getClient().scan as jest.Mock;
  const mockScanPromise = jest.fn();
  mockScan.mockReturnValue({
    promise: mockScanPromise,
  });

  beforeEach(() => {
    // Clear all mock calls before each test
    jest.clearAllMocks();
  });
  describe("getDriverTipsWithinRange", () => {
    it("should get the driver tip data", async () => {
      const id = "123";
      const dateValue = "2022-04-04";
      const driverTips: Array<DriverTip> = [
        {
          id: "123",
          driverId: "123",
          amount: "10",
          eventTime: "2021-04-04",
        },
      ];
      const mockParams = {
        TableName: DRIVER_TIPS_TABLE_NAME,
        FilterExpression: "driverId = :id AND eventTime >= :dateValue",
        ExpressionAttributeValues: { ":id": "123", ":dateValue": "2022-04-04" },
        ProjectionExpression: "amount",
      };
      mockScanPromise.mockResolvedValue({ Items: driverTips });

      const result = await getDriverTipsWithinRange(id, dateValue);
      expect(result).toStrictEqual(driverTips);
      expect(mockScan).toBeCalledWith(mockParams);
    });

    it("should get null data if Items not found", async () => {
      const id = "123";
      const dateValue = "2022-04-04";

      const mockParams = {
        TableName: DRIVER_TIPS_TABLE_NAME,
        FilterExpression: "driverId = :id AND eventTime >= :dateValue",
        ExpressionAttributeValues: { ":id": "123", ":dateValue": "2022-04-04" },
        ProjectionExpression: "amount",
      };

      mockScanPromise.mockResolvedValue({ Items: null });

      const result = await getDriverTipsWithinRange(id, dateValue);
      expect(result).toBeNull();
      expect(mockScan).toBeCalledWith(mockParams);
    });

    it("should update throw error if any error occurs", async () => {
      const id = "123";
      const dateValue = "2022-04-04";
      const expectedError = new Error("error occured");

      mockScanPromise.mockRejectedValue(new Error("error occured"));

      await expect(getDriverTipsWithinRange(id, dateValue)).rejects.toThrow(
        expectedError
      );
    });
  });
  describe("storeDriverTip", () => {
    it("should store the driver tip data", async () => {
      const driverTip: DriverTip = {
        id: "123",
        driverId: "123",
        amount: "10",
        eventTime: "2021-04-04",
      };
      await storeDriverTip(driverTip);
      expect(mockPut).toHaveBeenCalledWith({
        TableName: DRIVER_TIPS_TABLE_NAME,
        Item: driverTip,
      });
    });

    it("should update throw error if any error occurs", async () => {
      const DriverTip: DriverTip = {
        id: "123",
        driverId: "123",
        amount: "10",
        eventTime: "2022-04-04",
      };
      const expectedError = new Error("error occured");

      mockPutPromise.mockRejectedValue(new Error("error occured"));

      await expect(storeDriverTip(DriverTip)).rejects.toThrow(expectedError);
    });
  });
});
