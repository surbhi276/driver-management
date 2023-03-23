export interface DriverTipEvent {
  driverId: string;
  amount: string;
  eventTime: string;
}

export interface DriverTotalTips {
  driverId: string;
  todayTips: number;
  weeklyTips: number;
  lastUpdatedTimestamp: string;
}
