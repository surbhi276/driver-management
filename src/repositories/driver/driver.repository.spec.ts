/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { DynamoDBClient } from "../../client/dynamodb.client";

import { createDriver, getDriver } from "./driver.repository";

// Mock the DynamoDBClient
jest.mock("../../client/dynamodb.client", () => ({
  DynamoDBClient: {
    getInstance: jest.fn(() => ({
      getClient: jest.fn(() => ({
        put: jest.fn(() => ({ promise: jest.fn() })),
        get: jest.fn(() => ({ promise: jest.fn() })),
        scan: jest.fn(() => ({ promise: jest.fn() })),
      })),
    })),
  },
}));

describe("createDriver", () => {
  it("should create a driver", async () => {
    const driver = {
      id: "1",
      firstname: "John",
      lastname: "Doe",
      driverLicenseId: "1234",
    };
    const createdDriver = await createDriver(driver);
    expect(createdDriver).toEqual(driver);
  });
});

describe("getDriver", () => {
  it("should return a driver if it exists", async () => {
    const driverId = "1";
    const driver = {
      id: driverId,
      firstname: "John",
      lastname: "Doe",
      driverLicenseId: "1234",
    };
    // Mock the response from DynamoDB
    jest.spyOn(global.console, "log").mockImplementation(() => {});
    jest
      .spyOn(DynamoDBClient.getInstance().getClient(), "get")
      .mockResolvedValue({ Item: driver } as never);
    const retrievedDriver = await getDriver(driverId);
    expect(retrievedDriver).toEqual(driver);
  });

  it("should return null if the driver does not exist", async () => {
    const driverId = "nonexistent-id";
    // Mock the response from DynamoDB
    jest.spyOn(global.console, "log").mockImplementation(() => {});
    jest
      .spyOn(DynamoDBClient.getInstance().getClient(), "get")
      .mockResolvedValue({} as never);
    const retrievedDriver = await getDriver(driverId);
    expect(retrievedDriver).toBeNull();
  });
});
