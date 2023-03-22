/* eslint-disable @typescript-eslint/consistent-type-assertions */
import type { APIGatewayEvent } from "aws-lambda/trigger/api-gateway-proxy";

import type { Driver } from "../../models/driver";

import { handleCreateDriver } from "./createDriver.handler";

import { createDriver } from "../../repositories/driver/driver.repository";

// Mock the createDriver function

jest.mock("../../repositories/driver/driver.repository", () => ({
  createDriver: jest.fn().mockResolvedValue({
    id: "1222",
    firstname: "xyz",
    lastname: "abc",
    driverLicenseId: "123456",
  }),
}));

describe("handleCreateDriver", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return a 400 error if no body is provided", async () => {
    const event = {
      body: null,
    } as APIGatewayEvent;
    const result = await handleCreateDriver(event);

    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual(JSON.stringify({ message: "invalid input" }));
  });

  it("should create a driver and return a 201 success response", async () => {
    // Mock the createDriver function to return a driver
    const mockDriver: Driver = {
      id: "1222",
      firstname: "xyz",
      lastname: "abc",
      driverLicenseId: "123456",
    };

    const event = {
      body: JSON.stringify({
        firstname: "xyz",
        lastname: "abc",
        driverLicenseId: "123456",
      }),
    } as APIGatewayEvent;
    const result = await handleCreateDriver(event);

    expect(createDriver).toBeCalledTimes(1);
    expect(result.statusCode).toEqual(201);
    expect(result.body).toEqual(JSON.stringify(mockDriver));
  });
});
