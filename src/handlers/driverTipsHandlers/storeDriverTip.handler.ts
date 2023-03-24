/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-restricted-syntax */
import type { APIGatewayProxyResult, SQSEvent } from "aws-lambda";

import { DriverTip } from "../../models/driverTips";

import { driverTipSchema } from "./validation";

import { storeDriverTip } from "../../repositories/driverTips/driverTips.repository";
import { Logger } from "../../shared/logger/logger";

const logger = new Logger();

export const handleStoreDriverTip = async (
  event: SQSEvent
): Promise<APIGatewayProxyResult> => {
  try {
    for (const { body: recordBody } of event.Records) {
      const driverTip = JSON.parse(recordBody) as DriverTip;

      const { error } = driverTipSchema.validate(driverTip);
      if (error) {
        logger.error("Invalid driver tip event:", error);
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: JSON.stringify({ message: error.message })
          })
        };
      }

      await storeDriverTip(driverTip);
    }
    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Driver tips get stored successfully" })
    };
  } catch (error) {
    logger.error("Error occured while storing drivers tips", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to store drivers tips"
      })
    };
  }
};
