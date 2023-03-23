/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { DynamoDBClient } from "../../client/dynamodb.client";
import { DRIVER_TIPS_TABLE_NAME } from "../../config";
import type { DriverTotalTips } from "../../models/driverTotalTips";
import type { DriverTipEvent } from "../../models/shared/driverTipEvent";

const dynamoDbInstance = DynamoDBClient.getInstance();
const dynamodbClient = dynamoDbInstance.getClient();

const updateFieldInDynamoDB = async (
  fieldName: string,
  value: number,
  primaryKey: string
): Promise<void> => {
  const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: DRIVER_TIPS_TABLE_NAME,
    Key: { primaryKey },
    UpdateExpression: `SET ${fieldName} = :value`,
    ExpressionAttributeValues: { ":value": value },
  };

  console.log(params, "params");
  await dynamodbClient.update(params).promise();
};

export const getDriverTips = async (
  driverIdParam: string
): Promise<DriverTotalTips> => {
  try {
    const { Item } = await dynamodbClient
      .get({
        TableName: DRIVER_TIPS_TABLE_NAME,
        Key: {
          driverIdParam,
        },
      })
      .promise();

    if (!Item) {
      throw new Error(
        `No tipping information found for driver id ${driverIdParam}`
      );
    }

    const { driverId, todayTips, weeklyTips, lastUpdatedTimestamp } = Item;

    return {
      driverId,
      todayTips,
      weeklyTips,
      lastUpdatedTimestamp,
    };
  } catch (err) {
    console.error(
      `Failed to get the tipping information of driver id ${driverIdParam}: ${err}`
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
    const dayTimestamp = new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime();
    const weekTimestamp =
      new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() -
      new Date().getUTCDay() * 24 * 60 * 60 * 1000;

    // Update daily and weekly tips for the driver in DynamoDB
    const updateParams: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: DRIVER_TIPS_TABLE_NAME,
      Key: { driverId },
      UpdateExpression: "ADD",
      ExpressionAttributeValues: {
        ":lastUpdatedTimestamp": eventTime,
      },
    };

    // If the event is from today, add the tip to dailyTips
    if (eventTimestamp >= dayTimestamp) {
      updateParams.UpdateExpression += " todayTips :todayAmount";
      updateParams.ExpressionAttributeValues = {
        ...updateParams.ExpressionAttributeValues,
        ":todayAmount": Number(amount),
      };
    }

    // If the event is from this week, add the tip to weeklyTips
    if (eventTimestamp >= weekTimestamp) {
      updateParams.UpdateExpression += ", weeklyTips :weeklyAmount";
      updateParams.ExpressionAttributeValues = {
        ...updateParams.ExpressionAttributeValues,
        ":weeklyAmount": Number(amount),
      };
    }
    console.log(updateParams);
    await dynamodbClient.update(updateParams).promise();
  } catch (err) {
    console.error(`Failed to update tip for driver ${driverId}: ${err}`);
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
      await updateFieldInDynamoDB("todayTips", 0, driverId);
    }

    if (getLastUpdatedTimestamp < startOfWeekTimestamp) {
      await updateFieldInDynamoDB("weeklyTips", 0, driverId);
    }
  } catch (err) {
    console.error(`Failed to update tip for driver ${driverId}: ${err}`);
    throw err;
  }
};
