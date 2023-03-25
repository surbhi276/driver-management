import type { APIGatewayProxyResult, SQSEvent } from "aws-lambda";
import { v4 as uuid } from "uuid";

import { driverTipSchema } from "./validation";

import { DriverTip, DriverTipEvent } from "../../models/driverTips";
import { storeDriverTip } from "../../repositories/driverTips/driverTips.repository";
import { Logger } from "../../shared/logger/logger";

const logger = new Logger();

export const handleStoreDriverTip = async (
  event: SQSEvent
): Promise<APIGatewayProxyResult> => {
  try {
    for (const { body: recordBody } of event.Records) {
      const driverTipEvent = JSON.parse(recordBody) as DriverTipEvent;

      const { error } = driverTipSchema.validate(driverTipEvent);
      if (error) {
        logger.error("Invalid driver tip event:", error);
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: JSON.stringify({ message: error.message }),
          }),
        };
      }
      const driverTip: DriverTip = {
        id: uuid(),
        driverId: driverTipEvent.driverId,
        amount: driverTipEvent.amount,
        eventTime: driverTipEvent.eventTime,
      };

      await storeDriverTip(driverTip);
    }
    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Driver tips get stored successfully" }),
    };
  } catch (error) {
    logger.error("Error occured while storing drivers tips", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to store drivers tips",
      }),
    };
  }
};
