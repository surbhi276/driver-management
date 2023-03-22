/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { DynamoDB } from "aws-sdk";

import { DRIVER_TABLE_NAME } from "../../config";
import type { Driver } from "../../models/driver";

const dynamo = new DynamoDB.DocumentClient();

export const createDriver = async (driver: Driver): Promise<Driver> => {
  const { id, firstname, lastname, driverLicenseId } = driver;

  await dynamo
    .put({
      TableName: DRIVER_TABLE_NAME,
      Item: {
        id,
        firstname,
        lastname,
        driverLicenseId
      }
    })
    .promise();

  return driver;
};

export const getDriver = async (driverId: string): Promise<Driver | null> => {
  const { Item } = await dynamo
    .get({
      TableName: DRIVER_TABLE_NAME,
      Key: {
        id: driverId
      }
    })
    .promise();

  if (!Item) {
    return null;
  }

  const { id, firstname, lastname, driverLicenseId } = Item;

  return {
    id,
    firstname,
    lastname,
    driverLicenseId
  };
};

export const getDrivers = async (): Promise<Driver[]> => {
  const { Items } = await dynamo
    .scan({
      TableName: DRIVER_TABLE_NAME
    })
    .promise();

  return Items
    ? Items.map((item) => ({
        id: item.id,
        firstname: item.firstname,
        lastname: item.lastname,
        driverLicenseId: item.driverLicenseId
      }))
    : [];
};