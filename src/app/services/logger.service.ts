import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private logLevel: LogLevel = environment.production ? LogLevel.INFO : LogLevel.DEBUG;
  private logToConsole: boolean = !environment.production;
  private logToFile: boolean = !environment.production;
  private logs: string[] = [];
  private maxLogs: number = 1000;

  constructor() {
    // Initialize logger
    this.info('Logger initialized');
  }

  /**
   * Set the minimum log level
   * @param level The minimum log level to display
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    this.info(`Log level set to ${LogLevel[level]}`);
  }

  /**
   * Enable or disable console logging
   * @param enable Whether to enable console logging
   */
  setConsoleLogging(enable: boolean): void {
    this.logToConsole = enable;
    this.info(`Console logging ${enable ? 'enabled' : 'disabled'}`);
  }

  /**
   * Enable or disable file logging
   * @param enable Whether to enable file logging
   */
  setFileLogging(enable: boolean): void {
    this.logToFile = enable;
    this.info(`File logging ${enable ? 'enabled' : 'disabled'}`);
  }

  /**
   * Log a debug message
   * @param message The message to log
   * @param data Optional data to include with the log
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log an info message
   * @param message The message to log
   * @param data Optional data to include with the log
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log a warning message
   * @param message The message to log
   * @param data Optional data to include with the log
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log an error message
   * @param message The message to log
   * @param error Optional error object to include with the log
   */
  error(message: string, error?: any): void {
    this.log(LogLevel.ERROR, message, error);
  }

  /**
   * Get all logs
   * @returns Array of log strings
   */
  getLogs(): string[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    this.info('Logs cleared');
  }

  /**
   * Export logs to a file
   */
  exportLogs(): void {
    if (!this.logToFile) return;
    
    const logText = this.logs.join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `homely-eats-logs-${new Date().toISOString().replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.info('Logs exported to file');
  }

  /**
   * Internal logging method
   * @param level The log level
   * @param message The message to log
   * @param data Optional data to include with the log
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (level < this.logLevel) return;
    
    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level];
    let logMessage = `[${timestamp}] [${levelStr}] ${message}`;
    
    if (data) {
      try {
        const dataStr = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
        logMessage += `\n${dataStr}`;
      } catch (e) {
        logMessage += `\n[Error stringifying data: ${e}]`;
      }
    }
    
    // Add to logs array
    this.logs.push(logMessage);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    // Log to console if enabled
    if (this.logToConsole) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(message, data);
          break;
        case LogLevel.INFO:
          console.info(message, data);
          break;
        case LogLevel.WARN:
          console.warn(message, data);
          break;
        case LogLevel.ERROR:
          console.error(message, data);
          break;
      }
    }
  }
} 