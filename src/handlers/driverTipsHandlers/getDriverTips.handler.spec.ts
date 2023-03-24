import { APIGatewayEvent } from "aws-lambda";

import { handleGetDriverTips } from "./getDriverTips.handler";

import { DriverReceivedTips } from "../../models/driverTips";
import { getDriverTipsWithinRange } from "../../repositories/driverTips/driverTips.repository";

jest.mock("../../repositories/driver/driver.repository");
jest.mock("../../repositories/driverTips/driverTips.repository");

const mockGetDriverTipsWithinRange =
  getDriverTipsWithinRange as jest.MockedFunction<
    typeof getDriverTipsWithinRange
  >;

describe("handleGetDriverTips", () => {
  beforeEach(() => {
    // Clear all mock calls before each test
    jest.clearAllMocks();
  });
  it("should return a 200 response with driver and driver tips data", async () => {
    const event = { pathParameters: { id: "1234" } };

    const mockDriverTips: DriverReceivedTips = {
      driverId: "1234",
      todayTips: 12,
      weeklyTips: 13,
    };

    const expectedOutput = {
      driverId: "1234",
      todayTips: 12,
      weeklyTips: 13,
    };

    mockGetDriverTipsWithinRange.mockResolvedValue(mockDriverTips);

    const response = await handleGetDriverTips(
      event as unknown as APIGatewayEvent
    );
    console.log(response);
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

    mockGetDriverTipsWithinRange.mockRejectedValue(new Error("Error Occured"));

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
