import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { createDriver } from "../../repositories/driver/driver.repository";

import { handleCreateDriver } from "./createDriver.handler";

jest.mock("../../repositories/driver/driver.repository");

const mockCreateDriver = createDriver as jest.MockedFunction<
  typeof createDriver
>;

describe("handleCreateDriver", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a 400 response when no request body is provided", async () => {
    const event = {
      body: undefined,
    } as unknown as APIGatewayEvent;

    const expectedResponse: APIGatewayProxyResult = {
      statusCode: 400,
      body: JSON.stringify({ message: "invalid input" }),
    };

    const result = await handleCreateDriver(event);

    expect(result).toEqual(expectedResponse);
  });

  it("should return a 400 response when no firstname is provided", async () => {
    const event = {
      body: '{"lastname": "singh", "driverLicenseId": "12345"}',
    } as unknown as APIGatewayEvent;

    const result = await handleCreateDriver(event);

    expect(result.statusCode).toEqual(400);
  });

  it("should return a 400 response when no lastname is provided", async () => {
    const event = {
      body: '{"firstname": "singh", "driverLicenseId": "12345"}',
    } as unknown as APIGatewayEvent;

    const result = await handleCreateDriver(event);

    expect(result.statusCode).toEqual(400);
  });

  it("should return a 400 response when no driverLicenseId is provided", async () => {
    const event = {
      body: '{"firstname": "singh", "lastname": "singh"}',
    } as unknown as APIGatewayEvent;

    const result = await handleCreateDriver(event);

    expect(result.statusCode).toEqual(400);
  });

  it("should return a 500 response when createDriver fails", async () => {
    const event = {
      body: '{"firstname": "John Doe", "lastname": "singh", "driverLicenseId": "12345"}',
    } as APIGatewayEvent;

    mockCreateDriver.mockRejectedValue(new Error("Error creating driver"));

    const expectedResponse: APIGatewayProxyResult = {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to create driver" }),
    };

    const result = await handleCreateDriver(event);

    expect(result).toEqual(expectedResponse);
  });

  it("should return a 201 response when createDriver succeeds", async () => {
    const event = {
      body: '{"firstname": "xyz", "lastname": "xyz", "driverLicenseId": "1234"}',
    } as APIGatewayEvent;

    const createdDriver = {
      id: "1234",
      firstname: "abc",
      lastname: "abc",
      driverLicenseId: "123456",
    };

    mockCreateDriver.mockResolvedValue(createdDriver);

    const expectedResponse = {
      statusCode: 201,
    };

    const result = await handleCreateDriver(event);

    expect(result.statusCode).toEqual(expectedResponse.statusCode);
  });
});
