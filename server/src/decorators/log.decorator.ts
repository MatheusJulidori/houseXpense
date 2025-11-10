import { Logger } from '@nestjs/common';

export function LogMethod(
  level: 'debug' | 'info' | 'warn' | 'error' | 'verbose' | 'silly' = 'debug',
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;
    const logger = new Logger(target.constructor.name);

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();

      // Map Winston levels to NestJS Logger methods
      const logMethod =
        level === 'debug'
          ? 'debug'
          : level === 'info'
            ? 'log'
            : level === 'warn'
              ? 'warn'
              : level === 'error'
                ? 'error'
                : level === 'verbose'
                  ? 'verbose'
                  : 'log';

      // Log method entry
      logger[logMethod](`${propertyName} called`);

      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;

        // Log method success
        logger[logMethod](`${propertyName} completed in ${duration}ms`);

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        // Log method error
        logger.error(
          `${propertyName} failed after ${duration}ms: ${error.message}`,
        );

        throw error;
      }
    };
  };
}

export function LogController(
  level: 'debug' | 'info' | 'warn' | 'error' | 'verbose' | 'silly' = 'debug',
) {
  return function (target: any) {
    const logger = new Logger(target.name);

    // Map Winston levels to NestJS Logger methods
    const logMethod =
      level === 'debug'
        ? 'debug'
        : level === 'info'
          ? 'log'
          : level === 'warn'
            ? 'warn'
            : level === 'error'
              ? 'error'
              : level === 'verbose'
                ? 'verbose'
                : 'log';

    // Log controller initialization
    logger[logMethod](`Controller ${target.name} initialized`);
  };
}
