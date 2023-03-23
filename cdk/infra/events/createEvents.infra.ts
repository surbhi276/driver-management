import { Duration } from "aws-cdk-lib";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction as LambdaFunctionTarget } from "aws-cdk-lib/aws-events-targets";
import type { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import type { Construct } from "constructs";

export const createEvents = (
  scope: Construct,
  id: string,
  ruleName: string,
  enabled: boolean,
  lambdaFunction: NodejsFunction
) =>
  new Rule(scope, id, {
    ruleName,
    enabled,
    targets: [new LambdaFunctionTarget(lambdaFunction)],
    schedule: Schedule.rate(Duration.minutes(2)),
  });
