/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuid } from "uuid";

import { createDriver } from "../../repositories/driver/driver.repository";
import { Logger } from "../../shared/logger/logger";

const logger = new Logger();

export const handleCreateDriver = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const { body } = event;
  if (!body) {
    logger.error("Invalid input");
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "invalid input" }),
    };
  }
  try {
    const driver = await createDriver({
      id: uuid(),
      ...JSON.parse(body),
    });
    logger.info(`Driver with id ${driver.id} created successfully`);

    return {
      statusCode: 201,
      body: JSON.stringify(driver),
    };
  } catch (error) {
    logger.error("Error occured while creating driver", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to create driver" }),
    };
  }
};
