import { DynamoDBClient } from "../../client/dynamodb.client";
import {
  DRIVER_TIPS_TABLE_NAME,
  lastUpdatedTimestampFieldName,
  todayTipsFieldName,
  weeklyTipsFieldName,
} from "../../config";
import { DriverTotalTips, DriverTipEvent } from "../../models/driverTips";
import { Logger } from "../../shared/logger/logger";

const logger = new Logger();

const dynamoDbInstance = DynamoDBClient.getInstance();
const dynamodbClient = dynamoDbInstance.getClient();

const updateFieldInDynamoDB = async (
  fieldName: string,
  value: number,
  primaryKey: string
): Promise<void> => {
  const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: DRIVER_TIPS_TABLE_NAME,
    Key: { driverId: primaryKey },
    UpdateExpression: `SET ${fieldName} = :value`,
    ExpressionAttributeValues: { ":value": value },
  };

  await dynamodbClient.update(params).promise();
};

export const getDriverTips = async (
  driverIdParam: string
): Promise<DriverTotalTips | null> => {
  try {
    const { Item } = await dynamodbClient
      .get({
        TableName: DRIVER_TIPS_TABLE_NAME,
        Key: {
          driverId: driverIdParam,
        },
      })
      .promise();

    if (!Item) {
      return null;
    }

    const { driverId, todayTips, weeklyTips, lastUpdatedTimestamp } =
      Item as DriverTotalTips;

    return {
      driverId,
      todayTips,
      weeklyTips,
      lastUpdatedTimestamp,
    };
  } catch (err) {
    logger.error(
      `Error occured while get driver tip for driverId ${driverIdParam}`,
      err
    );
    throw err;
  }
};

export const storeDriverTip = async (
  driverTipEvent: DriverTipEvent
): Promise<void> => {
  const { driverId, amount, eventTime } = driverTipEvent;

  try {
    // Compute daily and weekly timestamp values based on the eventTime
    const eventTimestamp = new Date(eventTime).getTime();
    const todayTimestamp = new Date(
      new Date().setUTCHours(0, 0, 0, 0)
    ).getTime();
    const startOfWeekTimestamp =
      new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() -
      new Date().getUTCDay() * 24 * 60 * 60 * 1000;

    // Update daily and weekly tips for the driver in DynamoDB
    const updateParams: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: DRIVER_TIPS_TABLE_NAME,
      Key: { driverId },
      UpdateExpression: `SET ${lastUpdatedTimestampFieldName} = :eventTime`,
      ExpressionAttributeValues: {
        ":eventTime": eventTime,
      },
    };

    // If the event is from today, add the tip to dailyTips
    if (eventTimestamp >= todayTimestamp) {
      updateParams.UpdateExpression += `, todayTips = if_not_exists(${todayTipsFieldName}, :zero) + :todayAmount`;
      updateParams.ExpressionAttributeValues = {
        ...updateParams.ExpressionAttributeValues,
        ":todayAmount": Number(amount),
        ":zero": 0,
      };
    }

    // If the event is from this week, add the tip to weeklyTips
    if (eventTimestamp >= startOfWeekTimestamp) {
      updateParams.UpdateExpression += `, weeklyTips = if_not_exists(${weeklyTipsFieldName}, :zero) + :weeklyAmount`;
      updateParams.ExpressionAttributeValues = {
        ...updateParams.ExpressionAttributeValues,
        ":weeklyAmount": Number(amount),
        ":zero": 0,
      };
    }

    await dynamodbClient.update(updateParams).promise();
  } catch (err) {
    logger.error(
      `Error occured while storing driver tip for driverId ${driverId}`,
      err
    );
    throw err;
  }
};

export const resetDriverTip = async (
  driverId: string,
  lastUpdatedTimestamp: string
): Promise<void> => {
  try {
    const getLastUpdatedTimestamp = new Date(lastUpdatedTimestamp).getTime();
    const todayTimestamp = new Date(
      new Date().setUTCHours(0, 0, 0, 0)
    ).getTime();
    const startOfWeekTimestamp =
      new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() -
      new Date().getUTCDay() * 24 * 60 * 60 * 1000;

    if (getLastUpdatedTimestamp < todayTimestamp) {
      await updateFieldInDynamoDB(todayTipsFieldName, 0, driverId);
    }

    if (getLastUpdatedTimestamp < startOfWeekTimestamp) {
      await updateFieldInDynamoDB(weeklyTipsFieldName, 0, driverId);
    }
  } catch (err) {
    logger.error(
      `Error occured while reset driver tip for driverId ${driverId}`,
      err
    );
    throw err;
  }
};
