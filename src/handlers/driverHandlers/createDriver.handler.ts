/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuid } from "uuid";

import { driverSchema } from "./validation";

import { Driver, DriverEvent } from "../../models/driver";
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
    const bodyParsed = JSON.parse(body) as DriverEvent;

    const { error } = driverSchema.validate(bodyParsed);

    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: error.message }),
      };
    }

    const driver: Driver = {
      id: uuid(),
      firstname: bodyParsed.firstname,
      lastname: bodyParsed.lastname,
      driverLicenseId: bodyParsed.driverLicenseId,
    };
    await createDriver(driver);
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
