export const SERVICE_NAME = "coding-challenge";
export const INFRA_STACK = "infra-stack";

export const LAMBDA_PREFIX = "challenge-cloud-native";

export const lambdaConfig = {
  target: "node16",
  tsconfig: "tsconfig.json",
};

export const environmentConfig = {
  stage: "dev",
  nodeOptions: "--enable-source-maps",
};

export const LAMBDA_HANDLER_DEFAULT_PATH = "../../../src/handlers";

const DRIVER_HANDLER_PATH = "driverHandlers";

export const createDriverLambdaConfig = {
  id: "create-driver-handler",
  path: `${DRIVER_HANDLER_PATH}/createDriver.handler`,
  handler: "handleCreateDriver",
};

export const getDriverLambdaConfig = {
  id: "get-driver-handler",
  path: `${DRIVER_HANDLER_PATH}/getDriver.handler`,
  handler: "handleGetDriver",
};

const DRIVER_TIPS_HANDLER_PATH = "driverTipsHandlers";

export const storeDriverTipsLambdaConfig = {
  id: "store-driver-tip-handler",
  path: `${DRIVER_TIPS_HANDLER_PATH}/storeDriverTip.handler`,
  handler: "handleStoreDriverTip",
};

export const getDriverTipsLambdaConfig = {
  id: "get-driver-tips-handler",
  path: `${DRIVER_TIPS_HANDLER_PATH}/getDriverTips.handler`,
  handler: "handleGetDriverTips",
};

const TEST_HANDLER_PATH = "testHandlers";

export const createDriversTestLambdaConfig = {
  id: "create-driver-test-data-handler",
  path: `${TEST_HANDLER_PATH}/testData.handler`,
  handler: "handleCreateDriversTestData",
};

export const createDriverTipsTestLambdaConfig = {
  id: "create-driver-tip-test-data-handler",
  path: `${TEST_HANDLER_PATH}/testData.handler`,
  handler: "handleSampleDriverTippingEvent",
};

export const driverTipsQueueConfig = {
  queueName: "driver-tips-event-queue-ts",
  deadLetterQueueName: "driver-tips-dead-letter-queue-ts",
};

export const driverTableConfig = {
  id: "Driver-mgmt-table",
  tableName: "challenge-cloud-native-driver-mgmt-ts",
  partitionKey: "id",
};

export const driverTipsTableConfig = {
  id: "Driver-Tipping-mgmt-table",
  tableName: "challenge-cloud-native-driver-tip-mgmt-ts",
  partitionKey: "driverId",
};

export const driverTestEventsConfig = {
  id: "test-data-driver-rule",
  ruleName: "driver-test-data-scheduler-rule",
  enabled: false,
};

export const driverTipsTestEventsConfig = {
  id: "test-data-tips-rule",
  ruleName: "tips-test-data-scheduler-rule",
  enabled: false,
};

export const driverApiConfig = {
  id: "DriverRestApiGw",
  restApiName: "DriverApiGw",
  drivers: "drivers",
  driverId: "{id}",
  tips: "tips",
};

export const sqsConfig = {
  id: "driverTipsQueueEventSourceMapping",
  batchSize: 10,
};
