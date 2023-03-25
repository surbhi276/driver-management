import { APIGatewayEvent } from "aws-lambda/trigger/api-gateway-proxy";

import { getDriver } from "../../repositories/driver/driver.repository";

import { handleGetDriver } from "./getDriver.handler";

jest.mock("../../repositories/driver/driver.repository");

const mockGetDriver = getDriver as jest.MockedFunction<typeof getDriver>;

describe("handleGetDriver", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 status code when event is missing", async () => {
    const event = {};
    const result = await handleGetDriver(event as APIGatewayEvent);

    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual("path parameter missing");
  });
  it("returns 400 status code when path parameter is missing", async () => {
    const event = { pathParameters: {} };
    const result = await handleGetDriver(event as APIGatewayEvent);

    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual("path parameter missing");
  });

  it("returns 500 status code when getDriver function throws an error", async () => {
    const event = { pathParameters: { id: "1234" } };
    const error = new Error("Failed to get driver");
    mockGetDriver.mockRejectedValueOnce(error);

    const result = await handleGetDriver(event as unknown as APIGatewayEvent);

    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual(
      JSON.stringify({ message: "Failed to get driver" })
    );
  });

  it("returns 200 status code when driver is successfully fetched", async () => {
    const event = { pathParameters: { id: "1234" } };
    const driver = {
      id: "1234",
      firstname: "abc",
      lastname: "abc",
      driverLicenseId: "123456",
    };
    mockGetDriver.mockResolvedValueOnce(driver);

    const result = await handleGetDriver(event as unknown as APIGatewayEvent);

    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(JSON.stringify(driver));
  });
});
