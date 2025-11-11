import { Logger } from '@nestjs/common';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'verbose' | 'silly';

const logMessage = (
  logger: Logger,
  level: LogLevel,
  message: string,
  stack?: string,
) => {
  switch (level) {
    case 'debug':
      logger.debug(message);
      return;
    case 'info':
      logger.log(message);
      return;
    case 'warn':
      logger.warn(message);
      return;
    case 'error':
      logger.error(message, stack);
      return;
    case 'verbose':
      logger.verbose(message);
      return;
    default:
      logger.log(message);
  }
};

export function LogMethod(level: LogLevel = 'debug'): MethodDecorator {
  return function (
    target: object,
    propertyName: string | symbol,
    descriptor: PropertyDescriptor,
  ): void {
    const originalMethod = descriptor.value as
      | ((...args: unknown[]) => unknown)
      | undefined;

    if (!originalMethod) {
      return;
    }

    const logger = new Logger(
      (target.constructor as { name: string }).name ?? 'LogMethod',
    );

    descriptor.value = async function (...args: unknown[]) {
      const startTime = Date.now();
      logMessage(logger, level, `${String(propertyName)} called`);

      try {
        const result = await Promise.resolve(originalMethod.apply(this, args));
        const duration = Date.now() - startTime;
        logMessage(
          logger,
          level,
          `${String(propertyName)} completed in ${duration}ms`,
        );
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        if (error instanceof Error) {
          logger.error(
            `${String(propertyName)} failed after ${duration}ms: ${error.message}`,
            error.stack,
          );
        } else {
          logger.error(
            `${String(propertyName)} failed after ${duration}ms: ${String(
              error,
            )}`,
          );
        }
        throw error;
      }
    };
  };
}

export function LogController(level: LogLevel = 'debug') {
  return function <T extends new (...args: unknown[]) => unknown>(target: T) {
    const logger = new Logger(target.name);
    logMessage(logger, level, `Controller ${target.name} initialized`);
  };
}
