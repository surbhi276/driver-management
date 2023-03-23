import { Stack, App } from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { HttpMethod } from "aws-cdk-lib/aws-events";

import { createApiGateway } from "./apiGateway/createApiGateway.infra";
import {
  SERVICE_NAME,
  INFRA_STACK,
  createDriverLambdaConfig,
  storeDriverTipsLambdaConfig,
  getDriverLambdaConfig,
  createDriversTestLambdaConfig,
  createDriverTipsTestLambdaConfig,
  getDriverTipsLambdaConfig,
  driverTestEventsConfig,
  driverTipsTestEventsConfig,
  driverApiConfig,
  sqsConfig,
  driverTipsQueueConfig,
  driverTableConfig,
  driverTipsTableConfig,
} from "./config";
import { createDynamodb } from "./dynamodb/createDynamodb.infra";
import { createEvents } from "./events/createEvents.infra";
import { createLambda } from "./lambda/createLambda.infra";
import { createQueue } from "./sqs/createSqs.infra";

const app = new App();

export class InfraStack extends Stack {
  constructor() {
    const infraId = `${SERVICE_NAME}-${INFRA_STACK}`;
    super(app, infraId);

    const { queueName, deadLetterQueueName } = driverTipsQueueConfig;
    const driverTipsQueue = createQueue(this, queueName, deadLetterQueueName);

    const table = createDynamodb(
      this,
      driverTableConfig.id,
      driverTableConfig.tableName,
      driverTableConfig.partitionKey
    );

    const driverTipingTable = createDynamodb(
      this,
      driverTipsTableConfig.id,
      driverTipsTableConfig.tableName,
      driverTipsTableConfig.partitionKey
    );

    // handler to handle POST request
    const createDriverLambda = createLambda(
      this,
      createDriverLambdaConfig.id,
      createDriverLambdaConfig.path,
      createDriverLambdaConfig.handler
    );
    table.grantReadWriteData(createDriverLambda);

    // handler to handle POST request for tipping the driver
    const storeDriverTipLambda = createLambda(
      this,
      storeDriverTipsLambdaConfig.id,
      storeDriverTipsLambdaConfig.path,
      storeDriverTipsLambdaConfig.handler
    );
    table.grantReadWriteData(storeDriverTipLambda);
    driverTipingTable.grantReadWriteData(storeDriverTipLambda);
    driverTipsQueue.grantConsumeMessages(storeDriverTipLambda);

    // handler to proccess GET request
    const getDriverLambda = createLambda(
      this,
      getDriverLambdaConfig.id,
      getDriverLambdaConfig.path,
      getDriverLambdaConfig.handler
    );
    table.grantReadWriteData(getDriverLambda);

    // handler responsible to generate driver and tip test data
    const createDriverTestDataLambda = createLambda(
      this,
      createDriversTestLambdaConfig.id,
      createDriversTestLambdaConfig.path,
      createDriversTestLambdaConfig.handler
    );
    table.grantReadWriteData(createDriverTestDataLambda);

    // handler responsible to generate tip test data
    const createDriverTipTestDataLambda = createLambda(
      this,
      createDriverTipsTestLambdaConfig.id,
      createDriverTipsTestLambdaConfig.path,
      createDriverTipsTestLambdaConfig.handler,
      { DRIVER_TIPS_QUEUE_URL: driverTipsQueue.queueUrl }
    );
    driverTipsQueue.grantSendMessages(createDriverTipTestDataLambda);
    table.grantReadWriteData(createDriverTipTestDataLambda);

    const getDriverTipsLambda = createLambda(
      this,
      getDriverTipsLambdaConfig.id,
      getDriverTipsLambdaConfig.path,
      getDriverTipsLambdaConfig.handler
    );
    table.grantReadData(getDriverTipsLambda);
    driverTipingTable.grantReadData(getDriverTipsLambda);

    // Schedule Rules use to trigger test data creation for easier integration testing
    // change enabled to true to switch on test data creation
    createEvents(
      this,
      driverTestEventsConfig.id,
      driverTestEventsConfig.ruleName,
      driverTestEventsConfig.enabled,
      createDriverTestDataLambda
    );

    createEvents(
      this,
      driverTipsTestEventsConfig.id,
      driverTipsTestEventsConfig.ruleName,
      driverTipsTestEventsConfig.enabled, // set to true when needed to generate tips
      createDriverTipTestDataLambda
    );

    // API Gateway
    const restApiGw = createApiGateway(
      this,
      driverApiConfig.id,
      driverApiConfig.restApiName
    );
    const { root } = restApiGw.restApi;
    const drivers = root.addResource(driverApiConfig.drivers);

    drivers.addMethod(
      HttpMethod.POST,
      new LambdaIntegration(createDriverLambda)
    );

    const driver = drivers.addResource(driverApiConfig.driverId);
    driver.addMethod(HttpMethod.GET, new LambdaIntegration(getDriverLambda));

    const driverTips = driver.addResource(driverApiConfig.tips);
    driverTips.addMethod(
      HttpMethod.GET,
      new LambdaIntegration(getDriverTipsLambda)
    );

    // SQS integration with lambda
    storeDriverTipLambda.addEventSourceMapping(sqsConfig.id, {
      eventSourceArn: driverTipsQueue.queueArn,
      batchSize: sqsConfig.batchSize, // number of messages to retrieve from the queue per invocation
    });
  }
}
