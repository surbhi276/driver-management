import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { getDriver } from "../../repositories/driver/driver.repository";

export const handleGetDriver = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const { id } = event.pathParameters ?? {};

  if (!id) {
    return {
      statusCode: 400,
      body: "path parameter missing"
    };
  }

  const driver = await getDriver(id);

  return {
    statusCode: 200,
    body: JSON.stringify(driver)
  };
};
