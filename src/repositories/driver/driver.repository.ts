/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { DynamoDBClient } from "../../client/dynamodb.client";
import { DRIVER_TABLE_NAME } from "../../config";
import type { Driver } from "../../models/driver";

const dynamoDbInstance = DynamoDBClient.getInstance();
console.log(dynamoDbInstance, "lll");
const dynamodbClient = dynamoDbInstance.getClient();

export const createDriver = async (driver: Driver): Promise<Driver> => {
  const { id, firstname, lastname, driverLicenseId } = driver;

  await dynamodbClient
    .put({
      TableName: DRIVER_TABLE_NAME,
      Item: {
        id,
        firstname,
        lastname,
        driverLicenseId,
      },
    })
    .promise();

  return driver;
};

export const getDriver = async (driverId: string): Promise<Driver | null> => {
  const { Item } = await dynamodbClient
    .get({
      TableName: DRIVER_TABLE_NAME,
      Key: {
        id: driverId,
      },
    })
    .promise();
  console.log(Item, "ppp");
  console.log(Item, "ppp");
  if (!Item) {
    return null;
  }

  const { id, firstname, lastname, driverLicenseId } = Item;

  return {
    id,
    firstname,
    lastname,
    driverLicenseId,
  };
};

export const getDrivers = async (): Promise<Driver[]> => {
  const { Items } = await dynamodbClient
    .scan({
      TableName: DRIVER_TABLE_NAME,
    })
    .promise();

  return Items
    ? Items.map((item) => ({
        id: item.id,
        firstname: item.firstname,
        lastname: item.lastname,
        driverLicenseId: item.driverLicenseId,
      }))
    : [];
};
