import Joi from "joi";

import { DriverEvent } from "../../models/driver";

export const driverSchema = Joi.object<DriverEvent>({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  driverLicenseId: Joi.string().required(),
});
