/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable no-restricted-syntax */
import type { SQSEvent } from "aws-lambda";

import type { DriverTipEvent } from "../../models/shared/driverTipEvent";
import { storeDriverTip } from "../../repositories/driverTips/driverTips.repository";

export const handleStoreDriverTip = async (event: SQSEvent): Promise<void> => {
  for (const { body: recordBody } of event.Records) {
    const driverTipEvent = JSON.parse(recordBody) as DriverTipEvent;
    await storeDriverTip(driverTipEvent);
  }
};
