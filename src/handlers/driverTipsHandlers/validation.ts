/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Joi from "joi";

import { DriverTipEvent } from "../../models/driverTips";

export const driverTipSchema = Joi.object<DriverTipEvent>({
  driverId: Joi.string().uuid().required(),
  amount: Joi.string()
    .required()
    .regex(/^[0-9]+(\.[0-9]{1,2})?$/),
  eventTime: Joi.date().iso().required(),
});
