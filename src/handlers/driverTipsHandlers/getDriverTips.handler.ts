/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

import { ROUND_OFF_VALUE } from "../../config";
import { DriverReceivedTips } from "../../models/driverTips";
import { getDriverTipsWithinRange } from "../../repositories/driverTips/driverTips.repository";
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
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).toISOString();
    const startOfCurrentWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay()
    ).toISOString();
    const aggregatedDriverTodaysTips = await getDriverTipsWithinRange(
      driverId,
      startOfToday
    );
    const todayTips =
      aggregatedDriverTodaysTips?.reduce(
        (acc, item) => acc + Number(item.amount || 0),
        0
      ) ?? 0;

    const aggregatedDriverWeeklyTips = await getDriverTipsWithinRange(
      driverId,
      startOfCurrentWeek
    );
    const weeklyTips =
      aggregatedDriverWeeklyTips?.reduce(
        (acc, item) => acc + Number(item.amount || 0),
        0
      ) ?? 0;
    todayTips.toFixed(2);
    const driverReceivedTips: DriverReceivedTips = {
      driverId,
      todayTips: todayTips.toFixed(ROUND_OFF_VALUE),
      weeklyTips: weeklyTips.toFixed(ROUND_OFF_VALUE),
    };

    logger.info(`successfully fetched driver tips data ${driverReceivedTips}`);
    const driverTipsResult = JSON.stringify(driverReceivedTips);
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
