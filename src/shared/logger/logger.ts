/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable class-methods-use-this */
type ILogger = {
  info(message: string): void;
  error(message: string, error?: any): void;
};

export class Logger implements ILogger {
  public info(message: string): void {
    console.log(`INFO: ${message}`);
  }

  public error(message: string, error?: any): void {
    console.error(`ERROR: ${message}`, error);
  }
}
