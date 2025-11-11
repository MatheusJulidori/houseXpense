import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('RequestInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl, ip, headers } = request;
    const userAgent = headers['user-agent'] ?? '';
    const startTime = Date.now();

    // Log request details
    this.logger.debug(
      `Request started: ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          const duration = Date.now() - startTime;
          this.logger.debug(
            `Request completed: ${method} ${originalUrl} - ${duration}ms`,
          );

          if (this.isLoggableObject(data)) {
            const sanitizedData = this.sanitizeData(data);
            this.logger.debug(
              `Response data: ${JSON.stringify(sanitizedData)}`,
            );
          }
        },
        error: (error: unknown) => {
          const duration = Date.now() - startTime;
          if (error instanceof Error) {
            this.logger.error(
              `Request failed: ${method} ${originalUrl} - ${duration}ms - Error: ${error.message}`,
              error.stack,
            );
          } else {
            this.logger.error(
              `Request failed: ${method} ${originalUrl} - ${duration}ms - Unknown error`,
            );
          }
        },
      }),
    );
  }

  private isLoggableObject(data: unknown): data is Record<string, unknown> {
    return typeof data === 'object' && data !== null;
  }

  private sanitizeData(data: unknown): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item));
    }

    if (!this.isLoggableObject(data)) {
      return data;
    }

    const sanitized: Record<string, unknown> = { ...data };

    // Remove sensitive fields
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'authorization',
      'cookie',
    ];
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Recursively sanitize nested objects
    Object.entries(sanitized).forEach(([key, value]) => {
      if (this.isLoggableObject(value) || Array.isArray(value)) {
        sanitized[key] = this.sanitizeData(value);
      }
    });

    return sanitized;
  }
}
