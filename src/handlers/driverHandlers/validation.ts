/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Joi from "joi";

import { DriverEvent } from "../../models/driver";

export const driverSchema = Joi.object<DriverEvent>({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  driverLicenseId: Joi.string().required(),
});
