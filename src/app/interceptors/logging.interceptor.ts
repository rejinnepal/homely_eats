import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  constructor(private logger: LoggerService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const startTime = Date.now();
    
    // Log the request
    this.logger.debug(`HTTP Request: ${request.method} ${request.url}`, {
      headers: request.headers.keys().reduce((obj, key) => {
        obj[key] = request.headers.get(key);
        return obj;
      }, {} as Record<string, string | null>),
      body: request.body
    });

    return next.handle(request).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Log the response
            this.logger.debug(`HTTP Response: ${request.method} ${request.url} (${duration}ms)`, {
              status: event.status,
              statusText: event.statusText,
              headers: event.headers.keys().reduce((obj, key) => {
                obj[key] = event.headers.get(key);
                return obj;
              }, {} as Record<string, string | null>),
              body: event.body
            });
          }
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Log the error
          this.logger.error(`HTTP Error: ${request.method} ${request.url} (${duration}ms)`, error);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }
} 