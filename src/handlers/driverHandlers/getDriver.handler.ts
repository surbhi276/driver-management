import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { getDriver } from "../../repositories/driver/driver.repository";
import { Logger } from "../../shared/logger/logger";

const logger = new Logger();

export const handleGetDriver = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const { id } = event.pathParameters ?? {};

  if (!id) {
    logger.error("Invalid input");
    return {
      statusCode: 400,
      body: "path parameter missing",
    };
  }

  try {
    const driver = await getDriver(id);

    logger.info(`Driver is successfully fetched ${driver}`);

    return {
      statusCode: 200,
      body: JSON.stringify(driver),
    };
  } catch (error) {
    logger.error("Error occured while getting driver", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to get driver" }),
    };
  }
};
