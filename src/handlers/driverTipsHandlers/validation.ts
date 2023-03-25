import Joi from "joi";

import { DriverTip } from "../../models/driverTips";

export const driverTipSchema = Joi.object<DriverTip>({
  driverId: Joi.string().uuid().required(),
  amount: Joi.string()
    .required()
    .regex(/^[0-9]+(\.[0-9]{1,2})?$/),
  eventTime: Joi.date().iso().required(),
});
