/* eslint-disable @typescript-eslint/unbound-method */
import { DynamoDBClient } from "../../client/dynamodb.client";
import { DRIVER_TABLE_NAME } from "../../config";

import { createDriver, getDriver, getDrivers } from "./driver.repository";

import type { Driver } from "../../models/driver";

jest.mock("aws-sdk", () => {
  const mDynamoDB = {
    put: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    scan: jest.fn().mockReturnThis(),
    promise: jest.fn()
  };
  const mDocumentClient = {
    put: jest.fn(() => mDynamoDB),
    get: jest.fn(() => mDynamoDB),
    scan: jest.fn(() => mDynamoDB)
  };
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mDocumentClient)
    }
  };
});

// Test cases
describe("driver repository", () => {
  const driver: Driver = {
    id: "1",
    firstname: "John",
    lastname: "Doe",
    driverLicenseId: "123456"
  };
  beforeEach(() => {
    // Clear all mock calls before each test
    jest.clearAllMocks();
  });

  describe("createDriver", () => {
    it("should create a driver", async () => {
      const result = await createDriver(driver);

      expect(result).toEqual(driver);
      expect(DynamoDBClient.getInstance().getClient().put).toHaveBeenCalledWith(
        {
          TableName: DRIVER_TABLE_NAME,
          Item: driver
        }
      );
    });
  });

  describe("getDriver", () => {
    const driverId = "1234";
    it("should return a driver if it exists", async () => {
      const mockGetResponse = { Item: driver };
      const mockGet = DynamoDBClient.getInstance().getClient().get as jest.Mock;
      mockGet.mockReturnValue({
        promise: jest.fn().mockResolvedValue(mockGetResponse)
      });

      const result = await getDriver(driverId);

      expect(result).toEqual(driver);
      expect(DynamoDBClient.getInstance().getClient().get).toHaveBeenCalledWith(
        {
          TableName: DRIVER_TABLE_NAME,
          Key: { id: driverId }
        }
      );
    });

    it("should return null if driver does not exist", async () => {
      const mockGetResponse = { Item: null };
      const mockGet = DynamoDBClient.getInstance().getClient().get as jest.Mock;
      mockGet.mockReturnValue({
        promise: jest.fn().mockResolvedValue(mockGetResponse)
      });

      const result = await getDriver(driverId);

      expect(result).toBeNull();
      expect(DynamoDBClient.getInstance().getClient().get).toHaveBeenCalledWith(
        {
          TableName: DRIVER_TABLE_NAME,
          Key: { id: driverId }
        }
      );
    });
  });

  describe("getDrivers", () => {
    it("should return a drivers if exists", async () => {
      const mockScanResponse = { Items: [driver] };
      const mockScan = DynamoDBClient.getInstance().getClient()
        .scan as jest.Mock;
      mockScan.mockReturnValue({
        promise: jest.fn().mockResolvedValue(mockScanResponse)
      });

      const result = await getDrivers();

      expect(result).toEqual([driver]);
      expect(
        DynamoDBClient.getInstance().getClient().scan
      ).toHaveBeenCalledWith({
        TableName: DRIVER_TABLE_NAME
      });
    });

    it("should return blank array if no driver exist", async () => {
      const mockScanResponse = { Item: null };
      const mockScan = DynamoDBClient.getInstance().getClient()
        .scan as jest.Mock;
      mockScan.mockReturnValue({
        promise: jest.fn().mockResolvedValue(mockScanResponse)
      });

      const result = await getDrivers();

      expect(result).toStrictEqual([]);
      expect(
        DynamoDBClient.getInstance().getClient().scan
      ).toHaveBeenCalledWith({
        TableName: DRIVER_TABLE_NAME
      });
    });
  });
});
