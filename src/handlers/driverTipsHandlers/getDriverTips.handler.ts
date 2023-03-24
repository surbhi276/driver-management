import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

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
      body: "path parameter missing"
    };
  }

  try {
    const driverTips = await getDriverTips(driverId);
    logger.info(`successfully fetched driver tips data ${driverTips}`);
    const driverTipsResult = JSON.stringify(driverTips);
    return {
      statusCode: 200,
      body: driverTipsResult
    };
  } catch (error) {
    logger.error("Error occured while getting drivers tips", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to get drivers tips"
      })
    };
  }
};
