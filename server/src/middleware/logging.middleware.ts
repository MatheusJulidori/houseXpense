import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

type SanitizedBody = Record<string, unknown>;

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    this.logger.log(`→ ${method} ${originalUrl}`);

    if (['POST', 'PUT', 'PATCH'].includes(method) && this.isObject(req.body)) {
      const body = this.redactSensitiveFields(req.body);
      this.logger.debug(`Request Body: ${JSON.stringify(body)}`);
    }

    if (Object.keys(req.query).length > 0) {
      this.logger.debug(`Query: ${JSON.stringify(req.query)}`);
    }

    res.once('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      if (statusCode >= 500) {
        this.logger.error(
          `✗ ${method} ${originalUrl} - ${statusCode} - ${duration}ms`,
        );
      } else if (statusCode >= 400) {
        this.logger.warn(
          `⚠ ${method} ${originalUrl} - ${statusCode} - ${duration}ms`,
        );
      } else {
        this.logger.log(
          `✓ ${method} ${originalUrl} - ${statusCode} - ${duration}ms`,
        );
      }
    });

    res.once('error', (error: Error) => {
      this.logger.error(
        `✗ ${method} ${originalUrl} - unexpected response error`,
        error.stack,
      );
    });

    next();
  }

  private isObject(value: unknown): value is SanitizedBody {
    return typeof value === 'object' && value !== null;
  }

  private redactSensitiveFields(body: unknown): SanitizedBody {
    if (!this.isObject(body)) {
      return {};
    }

    const sanitized: SanitizedBody = { ...body };
    const sensitiveFields = ['password', 'token', 'secret'];

    sensitiveFields.forEach((field) => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
