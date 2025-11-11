import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { validateEnvironment } from '../src/config/env.validation';

const loadEnvFile = (filePath: string): Record<string, unknown> => {
  const absolutePath = resolve(process.cwd(), filePath);
  const env: Record<string, unknown> = { ...process.env };

  if (!existsSync(absolutePath)) {
    console.warn(`⚠️  Environment file not found: ${absolutePath}`);
    return env;
  }

  const content = readFileSync(absolutePath, 'utf8');

  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) {
      continue;
    }

    const [rawKey, ...rawValue] = line.split('=');
    if (!rawKey) {
      continue;
    }

    const key = rawKey.trim();
    const value = rawValue.join('=').trim();
    env[key] = value;
  }

  return env;
};

const envFileArg = process.argv[2] ?? '.env';
const variables = loadEnvFile(envFileArg);

try {
  validateEnvironment(variables);
  console.log(`✅ Environment validation passed for ${envFileArg}`);
  process.exit(0);
} catch (error) {
  console.error(
    `❌ Environment validation failed for ${envFileArg}:`,
    (error as Error).message,
  );
  process.exit(1);
}
