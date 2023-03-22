import { Queue, QueueEncryption } from "aws-cdk-lib/aws-sqs";
import type { Construct } from "constructs/lib/construct";

export const createQueue = (
  scope: Construct,
  name: string,
  deadLetterQueueName: string
): Queue =>
  new Queue(scope, name, {
    queueName: name,
    encryption: QueueEncryption.KMS_MANAGED,
    deadLetterQueue: {
      maxReceiveCount: 5,
      queue: new Queue(scope, deadLetterQueueName, {
        queueName: deadLetterQueueName,
        encryption: QueueEncryption.KMS_MANAGED
      })
    }
  });
