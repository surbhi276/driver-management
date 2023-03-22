import {
  AttributeType,
  BillingMode,
  Table,
  TableEncryption
} from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib/core/lib/removal-policy";
import type { Construct } from "constructs/lib/construct";

export const createDynamodb = (
  scope: Construct,
  id: string,
  tableName: string,
  partitionKey: string
) =>
  new Table(scope, id, {
    tableName,
    partitionKey: {
      name: partitionKey,
      type: AttributeType.STRING
    },
    pointInTimeRecovery: true,
    billingMode: BillingMode.PAY_PER_REQUEST,
    removalPolicy: RemovalPolicy.DESTROY,
    encryption: TableEncryption.DEFAULT
  });
