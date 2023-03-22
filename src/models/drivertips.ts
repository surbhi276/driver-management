export type DriverTipEvent = {
  driverId: string;
  amount: string;
  eventTime: string;
};

export type DriverTotalTips = {
  driverId: string;
  todayTips: number;
  weeklyTips: number;
};
