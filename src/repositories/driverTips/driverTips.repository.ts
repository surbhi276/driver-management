/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { DynamoDBClient } from "../../client/dynamodb.client";
import { DRIVER_TIPS_TABLE_NAME } from "../../config";
import type { DriverTotalTips } from "../../models/drivertips";
import type { DriverTipEvent } from "../../models/shared/driverTipEvent";

const dynamoDbInstance = DynamoDBClient.getInstance();
const dynamodbClient = dynamoDbInstance.getClient();

export const getDriverTips = async (
  driverIdParam: string
): Promise<DriverTotalTips> => {
  try {
    const driverTipsData = await dynamodbClient
      .get({
        TableName: DRIVER_TIPS_TABLE_NAME,
        Key: {
          driverIdParam,
        },
      })
      .promise();

    if (!driverTipsData.Item) {
      throw new Error(
        `No tipping information found for driver id ${driverIdParam}`
      );
    }

    const { driverId, todayTips, weeklyTips } = driverTipsData.Item;

    return {
      driverId,
      todayTips: todayTips || 0,
      weeklyTips: weeklyTips || 0,
    };
  } catch (err) {
    console.error(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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
      ExpressionAttributeValues: {},
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

    await dynamodbClient.update(updateParams).promise();
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.error(`Failed to update tip for driver ${driverId}: ${err}`);
    throw err;
  }
};
