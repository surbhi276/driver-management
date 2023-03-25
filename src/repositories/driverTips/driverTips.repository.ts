import { DynamoDBClient } from "../../client/dynamodb.client";
import { DRIVER_TIPS_TABLE_NAME } from "../../config";
import { DriverTip } from "../../models/driverTips";
import { Logger } from "../../shared/logger/logger";

const logger = new Logger();

const dynamoDbInstance = DynamoDBClient.getInstance();
const dynamodbClient = dynamoDbInstance.getClient();

export const getDriverTipsWithinRange = async (
  id: string,
  dateValue: string
): Promise<Array<DriverTip> | null> => {
  try {
    const params = {
      TableName: DRIVER_TIPS_TABLE_NAME,
      FilterExpression: "driverId = :id AND eventTime >= :dateValue",
      ExpressionAttributeValues: {
        ":id": id,
        ":dateValue": dateValue
      },
      ProjectionExpression: "amount"
    };

    const { Items } = await dynamodbClient.scan(params).promise();

    if (!Items) return null;

    return Items as Array<DriverTip>;
  } catch (err) {
    logger.error(
      `Error occurred while getting driver tips for driverId ${id}`,
      err
    );
    throw err;
  }
};

export const storeDriverTip = async (driverTip: DriverTip): Promise<void> => {
  const { id, driverId, amount, eventTime } = driverTip;

  try {
    await dynamodbClient
      .put({
        TableName: DRIVER_TIPS_TABLE_NAME,
        Item: {
          id,
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
