/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuid } from "uuid";

import { createDriver } from "../../repositories/driver/driver.repository";

export const handleCreateDriver = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const { body } = event;
  if (!body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "invalid input" })
    };
  }

  const driver = await createDriver({
    id: uuid(),
    ...JSON.parse(body)
  });

  return {
    statusCode: 201,
    body: JSON.stringify(driver)
  };
};
