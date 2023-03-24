export interface DriverTipEvent {
  driverId: string;
  amount: string;
  eventTime: string;
}

export interface DriverTip {
  id: string;
  driverId: string;
  amount: string;
  eventTime: string;
}

export interface DriverReceivedTips {
  driverId: string;
  todayTips: string;
  weeklyTips: string;
}
