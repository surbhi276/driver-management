import { APIGatewayEvent } from "aws-lambda";

import { Driver } from "../../models/driver";

import { handleGetDriverTips } from "./getDriverTips.handler";

import { DriverTotalTips } from "../../models/driverTips";
import { getDriver } from "../../repositories/driver/driver.repository";
import { getDriverTips } from "../../repositories/driverTips/driverTips.repository";

jest.mock("../../repositories/driver/driver.repository");
jest.mock("../../repositories/driverTips/driverTips.repository");

const mockGetDriver = getDriver as jest.MockedFunction<typeof getDriver>;
const mockGetDriverTips = getDriverTips as jest.MockedFunction<
  typeof getDriverTips
>;

describe("handleGetDriverTips", () => {
  beforeEach(() => {
    // Clear all mock calls before each test
    jest.clearAllMocks();
  });
  it("should return a 200 response with driver and driver tips data", async () => {
    const event = { pathParameters: { id: "1234" } };

    const mockDriver: Driver = {
      id: "1234",
      firstname: "abc",
      lastname: "1bc",
      driverLicenseId: "123456",
    };
    const timestamp = new Date().toISOString();
    const mockDriverTips: DriverTotalTips = {
      driverId: "1234",
      todayTips: 12,
      weeklyTips: 13,
      lastUpdatedTimestamp: timestamp,
    };

    const expectedOutput = {
      driverId: "1234",
      driverLicenseId: "123456",
      firstname: "abc",
      id: "1234",
      lastname: "1bc",
      todayTips: 12,
      weeklyTips: 13,
      lastUpdatedTimestamp: timestamp,
    };

    mockGetDriver.mockResolvedValue(mockDriver);
    mockGetDriverTips.mockResolvedValue(mockDriverTips);

    const response = await handleGetDriverTips(
      event as unknown as APIGatewayEvent
    );

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toStrictEqual(expectedOutput);
  });

  it("should return a 400 response ", async () => {
    const event = {};

    const response = await handleGetDriverTips(
      event as unknown as APIGatewayEvent
    );

    expect(response.statusCode).toBe(400);
    expect(response.body).toBe("path parameter missing");
  });

  it("should return a 400 response with error message", async () => {
    const event = { pathParameters: { id: null } };

    const response = await handleGetDriverTips(
      event as unknown as APIGatewayEvent
    );

    expect(response.statusCode).toBe(400);
    expect(response.body).toBe("path parameter missing");
  });

  it("should return a 500 response with error message", async () => {
    const event = { pathParameters: { id: "1233" } };

    mockGetDriver.mockRejectedValue(new Error("failed to get driver"));

    const response = await handleGetDriverTips(
      event as unknown as APIGatewayEvent
    );

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toHaveProperty(
      "message",
      "Failed to get drivers tips"
    );
  });
});
