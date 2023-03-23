/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { getDriver } from "../../repositories/driver/driver.repository";
import { getDriverTips } from "../../repositories/driverTips/driverTips.repository";
import { Logger } from "../../shared/logger/logger";

const logger = new Logger();

export const handleGetDriverTips = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const { id: driverId } = event.pathParameters ?? {};

  if (!driverId) {
    logger.error("Invalid input");
    return {
      statusCode: 400,
      body: "path parameter missing",
    };
  }

  try {
    const driver = await getDriver(driverId);
    const driverTips = await getDriverTips(driverId);
    logger.info(
      `successfully fetched full driver tips data ${driver} ${driverTips}`
    );
    return {
      statusCode: 200,
      body: JSON.stringify({ ...driver, ...driverTips }),
    };
  } catch (error) {
    logger.error("Error occured while getting drivers tips", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to get drivers tips",
      }),
    };
  }
};
