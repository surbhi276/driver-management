import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

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
      `successfully fetched driver and driver tips data ${driver} ${driverTips}`
    );
    const driverTipsResult = JSON.stringify({ ...driver, ...driverTips });
    return {
      statusCode: 200,
      body: driverTipsResult,
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
