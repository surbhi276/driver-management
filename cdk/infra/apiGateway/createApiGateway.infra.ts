import {
  EndpointType,
  MethodLoggingLevel,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { ApiGateway } from "aws-cdk-lib/aws-events-targets";
import type { Construct } from "constructs/lib/construct";

import { environmentConfig } from "../config";

export const createApiGateway = (
  scope: Construct,
  id: string,
  restApiName: string,
  stageName = environmentConfig.stage
) => {
  const restApi = new RestApi(scope, id, {
    restApiName,
    deployOptions: {
      stageName,
      metricsEnabled: true,
      loggingLevel: MethodLoggingLevel.INFO,
    },
    endpointTypes: [EndpointType.REGIONAL],
  });
  return new ApiGateway(restApi);
};
