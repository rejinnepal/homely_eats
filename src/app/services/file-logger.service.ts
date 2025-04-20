import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

@Injectable({
  providedIn: 'root'
})
export class FileLoggerService {
  private apiUrl = environment.apiUrl;
  private isDevelopment = !environment.production;
  private debugEnabled = false; // Disable debug logs by default

  constructor(private http: HttpClient) {}

  log(level: LogLevel, message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };

    // Only log to console in development mode
    if (this.isDevelopment) {
      // Skip debug logs if debug is disabled
      if (level === 'debug' && !this.debugEnabled) {
        return;
      }
      console.log(`[${level.toUpperCase()}] ${message}`, data || '');
    }

    // Only attempt to send logs to server in production
    if (environment.production) {
      this.http.post(`${this.apiUrl}/logs`, logEntry).subscribe({
        error: (error) => console.error('Failed to write log:', error)
      });
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }
  
  // Enable or disable debug logs
  setDebugEnabled(enabled: boolean): void {
    this.debugEnabled = enabled;
  }
} 