import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const startTime = Date.now();

    // Log request start
    this.logger.log(`→ ${method} ${originalUrl}`);

    // Log request body for POST/PUT/PATCH (excluding sensitive data)
    if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
      const body = { ...req.body };
      // Remove sensitive fields
      if (body.password) body.password = '[REDACTED]';
      if (body.token) body.token = '[REDACTED]';
      if (body.secret) body.secret = '[REDACTED]';

      this.logger.debug(`Request Body: ${JSON.stringify(body)}`);
    }

    // Log query parameters
    if (Object.keys(req.query).length > 0) {
      this.logger.debug(`Query: ${JSON.stringify(req.query)}`);
    }

    // Override res.end to log response
    const originalEnd = res.end;
    const logger = this.logger;

    res.end = function (chunk?: any, encoding?: any): any {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      // Determine log level based on status code
      if (statusCode >= 500) {
        logger.error(
          `✗ ${method} ${originalUrl} - ${statusCode} - ${duration}ms`,
        );
      } else if (statusCode >= 400) {
        logger.warn(
          `⚠ ${method} ${originalUrl} - ${statusCode} - ${duration}ms`,
        );
      } else {
        logger.log(
          `✓ ${method} ${originalUrl} - ${statusCode} - ${duration}ms`,
        );
      }

      // Log response body for errors
      if (statusCode >= 400 && chunk) {
        try {
          const responseBody = JSON.parse(chunk.toString());
          logger.error(`Error: ${JSON.stringify(responseBody)}`);
        } catch {
          logger.error(`Error: ${chunk.toString()}`);
        }
      }

      // Call original end method
      return originalEnd.call(res, chunk, encoding);
    };

    next();
  }
}
