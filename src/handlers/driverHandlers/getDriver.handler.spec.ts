/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import type { APIGatewayEvent } from "aws-lambda";

import { getDriver } from "../../repositories/driver/driver.repository";

import { handleGetDriver } from "./getDriver.handler";

jest.mock("../../repositories/driver/driver.repository");

describe("handleGetDriver", () => {
  const mockDriver = { id: "1", name: "John Doe", rating: 4.8 };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return 400 if id is missing in pathParameters", async () => {
    const event = { pathParameters: {} } as APIGatewayEvent;
    const result = await handleGetDriver(event);
    expect(result.statusCode).toBe(400);
    expect(result.body).toBe("path parameter missing");
  });

  it("should call getDriver with correct id", async () => {
    const event = { pathParameters: { id: "1" } } as APIGatewayEvent;
    await handleGetDriver(event);
    expect(getDriver).toHaveBeenCalledWith("1");
  });

  it("should return 200 with driver data if driver is found", async () => {
    getDriver.mockResolvedValue(mockDriver);
    const event = { pathParameters: { id: "1" } };
    const result = await handleGetDriver(event);
    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(mockDriver));
  });

  it("should return 404 if driver is not found", async () => {
    getDriver.mockResolvedValue(null);
    const event = { pathParameters: { id: "1" } };
    const result = await handleGetDriver(event);
    expect(result.statusCode).toBe(404);
  });

  it("should throw error if getDriver throws error", async () => {
    const error = new Error("Some error");
    getDriver.mockRejectedValue(error);
    const event = { pathParameters: { id: "1" } };
    await expect(handleGetDriver(event)).rejects.toThrow(error);
  });
});
