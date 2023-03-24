export interface DriverTip {
  driverId: string;
  amount: string;
  eventTime: string;
}

export interface DriverReceivedTips {
  driverId: string;
  todayTips: number;
  weeklyTips: number;
}
