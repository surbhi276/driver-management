import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { getDriver } from "../../repositories/driver/driver.repository";
import { getDriverTips } from "../../repositories/driverTips/driverTips.repository";

export const handleGetDriverTips = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const { id: driverId } = event.pathParameters ?? {};

  if (!driverId) {
    return {
      statusCode: 400,
      body: "path parameter missing"
    };
  }

  try {
    const driver = await getDriver(driverId);
    const driverTips = await getDriverTips(driverId);

    return {
      statusCode: 200,
      body: JSON.stringify({ ...driver, ...driverTips })
    };
  } catch (error) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: `Error occured while getting the driver's tips of driverId - ${driverId}`
      })
    };
  }
};
