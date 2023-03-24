import type { APIGatewayProxyResult, SQSEvent } from "aws-lambda";

import { handleStoreDriverTip } from "./storeDriverTip.handler";

import { DriverTip } from "../../models/driverTips";
import { storeDriverTip } from "../../repositories/driverTips/driverTips.repository";

jest.mock("../../repositories/driverTips/driverTips.repository");

storeDriverTip as jest.MockedFunction<typeof storeDriverTip>;

describe("handleStoreDriverTip", () => {
  beforeEach(() => {
    // Clear all mock calls before each test
    jest.clearAllMocks();
  });

  it("should return a 400 response when driverId is not correct", async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify({
            driverId: "abcd",
            amount: "12",
            eventTime: "2019-09-16T10:58:14.651Z"
          } as DriverTip)
        }
      ]
    } as SQSEvent;

    const result = await handleStoreDriverTip(event);

    expect(result.statusCode).toEqual(400);
  });

  it("should return a 400 response when amount is not correct", async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify({
            driverId: "275d7bb8-3a2f-432c-8435-5a01c64ca6ba",
            amount: "Nan",
            eventTime: "2019-09-16T10:58:14.651Z"
          } as DriverTip)
        }
      ]
    } as SQSEvent;

    const result = await handleStoreDriverTip(event);

    expect(result.statusCode).toEqual(400);
  });

  it("should return a 400 response when eventTime is not correct", async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify({
            driverId: "275d7bb8-3a2f-432c-8435-5a01c64ca6ba",
            amount: "13",
            eventTime: "2019/09/16"
          } as DriverTip)
        }
      ]
    } as SQSEvent;

    const result = await handleStoreDriverTip(event);

    expect(result.statusCode).toEqual(400);
  });

  it("should store driver tips for each record in the event", async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify({
            driverId: "275d7bb8-3a2f-432c-8435-5a01c64ca6ba",
            amount: "12",
            eventTime: "2019-09-16T10:58:14.651Z"
          } as DriverTip)
        },
        {
          body: JSON.stringify({
            driverId: "275d7bb8-3a2f-432c-8435-5a01c64ca6ba",
            amount: "12",
            eventTime: "2019-09-16T10:58:14.651Z"
          } as DriverTip)
        }
      ]
    } as SQSEvent;

    await handleStoreDriverTip(event);
    expect(storeDriverTip).toHaveBeenCalledTimes(2);
  });

  it("should return a 201 status code and success message when all driver tips are successfully stored", async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify({
            driverId: "275d7bb8-3a2f-432c-8435-5a01c64ca6ba",
            amount: "12",
            eventTime: "2019-09-16T10:58:14.651Z"
          } as DriverTip)
        }
      ]
    } as SQSEvent;

    const expectedResponse: APIGatewayProxyResult = {
      statusCode: 500,
      body: JSON.stringify({ message: "Driver tips get stored successfully" })
    };
    const result = await handleStoreDriverTip(event);
    console.log(result);
    expect(result.statusCode).toEqual(201);
    expect(result.body).toEqual(expectedResponse.body);
  });

  it("should log an error and return a 500 status code when there is an error while storing driver tips", async () => {
    const error = new Error("Some error occurred");
    (storeDriverTip as jest.Mock).mockRejectedValueOnce(error);
    const event = {
      Records: [
        {
          body: JSON.stringify({
            driverId: "275d7bb8-3a2f-432c-8435-5a01c64ca6ba",
            amount: "12",
            eventTime: "2019-09-16T10:58:14.651Z"
          } as DriverTip)
        }
      ]
    } as SQSEvent;
    const result = await handleStoreDriverTip(event);
    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual(
      JSON.stringify({ message: "Failed to store drivers tips" })
    );
  });
});
