import path from "path";

import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Duration } from "aws-cdk-lib/core/lib/duration";
import type { Construct } from "constructs/lib/construct";

import {
  lambdaConfig,
  environmentConfig,
  LAMBDA_PREFIX,
  LAMBDA_HANDLER_DEFAULT_PATH,
} from "../config";

export const createLambda = (
  scope: Construct,
  id: string,
  specificHandlerPath: string,
  handler: string,
  additionalEnvironment: { [key: string]: string } = {}
): NodejsFunction =>
  new NodejsFunction(scope, id, {
    entry: path.join(
      __dirname,
      `${LAMBDA_HANDLER_DEFAULT_PATH}/${specificHandlerPath}.ts`
    ),
    handler,
    functionName: `${LAMBDA_PREFIX}-${id}`,
    bundling: {
      forceDockerBundling: false,
      minify: true,
      sourceMap: true,
      // Remember to keep ci, cdk lambda function, codebuild and tsconfig in sync
      target: lambdaConfig.target,
      tsconfig: lambdaConfig.tsconfig,
    },
    runtime: Runtime.NODEJS_16_X,
    memorySize: 1024,
    timeout: Duration.seconds(30),
    environment: {
      STAGE: environmentConfig.stage,
      NODE_OPTIONS: environmentConfig.nodeOptions,
      ...additionalEnvironment,
    },
  });
