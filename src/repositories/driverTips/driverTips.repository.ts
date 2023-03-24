/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { DynamoDBClient } from "../../client/dynamodb.client";
import { DRIVER_TIPS_TABLE_NAME } from "../../config";
import { DriverReceivedTips, DriverTip } from "../../models/driverTips";
import { Logger } from "../../shared/logger/logger";

const logger = new Logger();

const dynamoDbInstance = DynamoDBClient.getInstance();
const dynamodbClient = dynamoDbInstance.getClient();

export const getDriverTips = async (
  driverId: string
): Promise<DriverReceivedTips | null> => {
  try {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfCurrentWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay()
    );

    // query for items with the given driverId and eventTime within today
    const paramsToday = {
      TableName: DRIVER_TIPS_TABLE_NAME,
      KeyConditionExpression: "driverId = :id AND eventTime >= :startOfToday",
      ExpressionAttributeValues: {
        ":id": { S: driverId },
        ":startOfToday": { S: startOfToday.toISOString() }
      },
      ProjectionExpression: "amount"
    };

    // query for items with the given driverId and eventTime within the current week
    const paramsCurrentWeek = {
      TableName: DRIVER_TIPS_TABLE_NAME,
      KeyConditionExpression:
        "driverId = :id AND eventTime >= :startOfCurrentWeek",
      ExpressionAttributeValues: {
        ":id": { S: driverId },
        ":startOfCurrentWeek": { S: startOfCurrentWeek.toISOString() }
      },
      ProjectionExpression: "amount"
    };

    // perform both queries in parallel using Promise.all
    const [dataToday, dataCurrentWeek] = await Promise.all([
      dynamodbClient.query(paramsToday).promise(),
      dynamodbClient.query(paramsCurrentWeek).promise()
    ]);

    // calculate the aggregated amounts for today and current week
    const todayTips =
      dataToday.Items?.reduce(
        (acc, item) => acc + Number(item.amount?.S || 0),
        0
      ) ?? 0;
    const weeklyTips =
      dataCurrentWeek.Items?.reduce(
        (acc, item) => acc + Number(item.amount?.S || 0),
        0
      ) ?? 0;

    return { driverId, todayTips, weeklyTips };
  } catch (err) {
    logger.error(
      `Error occured while get driver tip for driverId ${driverId}`,
      err
    );
    throw err;
  }
};

export const storeDriverTip = async (driverTip: DriverTip): Promise<void> => {
  const { driverId, amount, eventTime } = driverTip;

  try {
    await dynamodbClient
      .put({
        TableName: DRIVER_TIPS_TABLE_NAME,
        Item: {
          driverId,
          amount,
          eventTime
        }
      })
      .promise();
  } catch (err) {
    logger.error(
      `Error occured while storing driver tip for driverId ${driverId}`,
      err
    );
    throw err;
  }
};
