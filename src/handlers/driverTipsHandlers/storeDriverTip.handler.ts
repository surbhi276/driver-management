/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable no-restricted-syntax */
import type { APIGatewayProxyResult, SQSEvent } from "aws-lambda";

import type { DriverTipEvent } from "../../models/shared/driverTipEvent";
import {
  getDriverTips,
  resetDriverTip,
  storeDriverTip,
} from "../../repositories/driverTips/driverTips.repository";
import { Logger } from "../../shared/logger/logger";

const logger = new Logger();

export const handleStoreDriverTip = async (
  event: SQSEvent
): Promise<APIGatewayProxyResult> => {
  try {
    for (const { body: recordBody } of event.Records) {
      const driverTipEvent = JSON.parse(recordBody) as DriverTipEvent;
      const driverTips = await getDriverTips(driverTipEvent.driverId);

      if (driverTips) {
        await resetDriverTip(
          driverTipEvent.driverId,
          driverTips.lastUpdatedTimestamp
        );
      }
      await storeDriverTip(driverTipEvent);
    }
    return {
      statusCode: 201,
      body: "Driver tips got stored",
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
