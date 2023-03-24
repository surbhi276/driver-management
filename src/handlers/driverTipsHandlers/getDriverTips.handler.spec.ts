/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { APIGatewayEvent } from "aws-lambda";

import { handleGetDriverTips } from "./getDriverTips.handler";

import { DriverReceivedTips, DriverTip } from "../../models/driverTips";
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

    const mockDriverTips: DriverTip[] = [
      {
        id: "123",
        driverId: "1234",
        amount: "20",
        eventTime: "30"
      }
    ];

    const expectedOutput: DriverReceivedTips = {
      driverId: "1234",
      todayTips: "20.00",
      weeklyTips: "20.00"
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

  it("should give 500 if any error occurs if getDriverTipsWithinRange fails second time", async () => {
    const event = { pathParameters: { id: "1234" } };
    const mockDriverTips: DriverTip[] = [
      {
        id: "123",
        driverId: "1234",
        amount: "20",
        eventTime: "30"
      }
    ];

    mockGetDriverTipsWithinRange
      .mockResolvedValueOnce(mockDriverTips)
      .mockRejectedValueOnce(new Error("Erro occured"));

    const response = await handleGetDriverTips(
      event as unknown as APIGatewayEvent
    );

    expect(response.statusCode).toBe(500);
    expect(response.body).toBe(
      JSON.stringify({ message: "Failed to get drivers tips" })
    );
    expect(mockGetDriverTipsWithinRange).toBeCalledTimes(2);
  });

  it("should give 500 if any error occurs if getDriverTipsWithinRange fails frist time", async () => {
    const event = { pathParameters: { id: "1234" } };

    mockGetDriverTipsWithinRange.mockRejectedValueOnce(
      new Error("Erro occured")
    );

    const response = await handleGetDriverTips(
      event as unknown as APIGatewayEvent
    );

    expect(response.statusCode).toBe(500);
    expect(response.body).toBe(
      JSON.stringify({ message: "Failed to get drivers tips" })
    );
  });

  it("should return a 200 response if no response is given by getDriverTipsWithinRange", async () => {
    const event = { pathParameters: { id: "1234" } };

    const expectedOutput: DriverReceivedTips = {
      driverId: "1234",
      todayTips: "0.00",
      weeklyTips: "0.00"
    };

    mockGetDriverTipsWithinRange
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const response = await handleGetDriverTips(
      event as unknown as APIGatewayEvent
    );
    console.log(response);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toStrictEqual(expectedOutput);
  });

  it("should return a 200 response if getDriverTipsWithinRange gives todaytips correct response", async () => {
    const event = { pathParameters: { id: "1234" } };

    const mockDriverTips: DriverTip[] = [
      {
        id: "123",
        driverId: "1234",
        amount: "20",
        eventTime: "30"
      }
    ];

    const expectedOutput: DriverReceivedTips = {
      driverId: "1234",
      todayTips: "20.00",
      weeklyTips: "0.00"
    };

    mockGetDriverTipsWithinRange
      .mockResolvedValueOnce(mockDriverTips)
      .mockResolvedValueOnce(null);

    const response = await handleGetDriverTips(
      event as unknown as APIGatewayEvent
    );
    console.log(response);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toStrictEqual(expectedOutput);
  });

  it("should return a 200 response if getDriverTipsWithinRange gives weeklytips correct response", async () => {
    const event = { pathParameters: { id: "1234" } };

    const mockDriverTips: DriverTip[] = [
      {
        id: "123",
        driverId: "1234",
        amount: "20",
        eventTime: "30"
      }
    ];

    const expectedOutput: DriverReceivedTips = {
      driverId: "1234",
      todayTips: "0.00",
      weeklyTips: "20.00"
    };

    mockGetDriverTipsWithinRange
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockDriverTips);

    const response = await handleGetDriverTips(
      event as unknown as APIGatewayEvent
    );
    console.log(response);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toStrictEqual(expectedOutput);
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
