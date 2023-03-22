/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
type ILogger = {
  info(message: string): void;
  error(message: string, error?: Error): void;
};

export class Logger implements ILogger {
  info(message: string): void {
    console.log(`INFO: ${message}`);
  }

  error(message: string, error?: Error): void {
    console.error(`ERROR: ${message}`, error);
  }
}
