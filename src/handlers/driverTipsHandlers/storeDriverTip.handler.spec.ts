/* eslint-disable @typescript-eslint/consistent-type-assertions */
import type { SQSEvent } from "aws-lambda";

import type { DriverTotalTips } from "../../models/driverTotalTips";

import { handleStoreDriverTip } from "./storeDriverTip.handler";

import type { DriverTipEvent } from "../../models/shared/driverTipEvent";
import {
  getDriverTips,
  resetDriverTip,
  storeDriverTip,
} from "../../repositories/driverTips/driverTips.repository";

jest.mock("../../repositories/driverTips/driverTips.repository");

storeDriverTip as jest.MockedFunction<typeof storeDriverTip>;
getDriverTips as jest.MockedFunction<typeof getDriverTips>;
resetDriverTip as jest.MockedFunction<typeof resetDriverTip>;

describe("handleStoreDriverTip", () => {
  const mockDriverTips: DriverTotalTips = {
    driverId: "1234",
    todayTips: 12,
    weeklyTips: 13,
    lastUpdatedTimestamp: new Date().toISOString(),
  };
  (getDriverTips as jest.Mock).mockResolvedValue(mockDriverTips);
  (resetDriverTip as jest.Mock).mockResolvedValue("resolve");

  beforeEach(() => {
    // Clear all mock calls before each test
    jest.clearAllMocks();
  });
  it("should store driver tips for each record in the event", async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify({
            driverId: "1234",
            amount: "12",
            eventTime: "02-02-2012",
          } as DriverTipEvent),
        },
        {
          body: JSON.stringify({
            driverId: "1237",
            amount: "14",
            eventTime: "02-02-2012",
          } as DriverTipEvent),
        },
      ],
    } as SQSEvent;

    await handleStoreDriverTip(event);
    expect(storeDriverTip).toHaveBeenCalledTimes(2);
  });

  it("should return a 201 status code and success message when all driver tips are successfully stored", async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify({
            driverId: "1234",
            amount: "12",
            eventTime: "02-02-2012",
          } as DriverTipEvent),
        },
      ],
    } as SQSEvent;
    const result = await handleStoreDriverTip(event);
    expect(result.statusCode).toEqual(201);
    expect(result.body).toEqual("Driver tips got stored");
  });

  it("should log an error and return a 500 status code when there is an error while storing driver tips", async () => {
    const error = new Error("Some error occurred");
    (storeDriverTip as jest.Mock).mockRejectedValueOnce(error);
    const event = {
      Records: [
        {
          body: JSON.stringify({
            driverId: "1234",
            amount: "12",
            eventTime: "02-02-2012",
          } as DriverTipEvent),
        },
      ],
    } as SQSEvent;
    const result = await handleStoreDriverTip(event);
    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual(
      JSON.stringify({ message: "Failed to store drivers tips" })
    );
  });
});
