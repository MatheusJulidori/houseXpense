import { readdirSync, readFileSync, statSync } from 'fs';
import { join, extname } from 'path';

const workspaceRoot = join(__dirname, '..');
const modulesRoot = join(workspaceRoot, 'modules');

const forbiddenImportPatterns = [
  /from ['"]@nestjs\/typeorm['"]/,
  /from ['"]typeorm['"]/,
  /from ['"][^'"]*infrastructure\/entities\/[^'"]+['"]/,
  /from ['"].*\/infrastructure\/.+['"]/,
];

const collectPresentationFiles = (dir: string): string[] => {
  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      return collectPresentationFiles(fullPath);
    }
    if (stats.isFile() && extname(fullPath) === '.ts') {
      return [fullPath];
    }
    return [];
  });
};

describe('Architecture / Presentation Layer Boundaries', () => {
  const moduleNames = readdirSync(modulesRoot).filter((entry) => {
    const fullPath = join(modulesRoot, entry);
    return statSync(fullPath).isDirectory();
  });

  const presentationFiles = moduleNames.flatMap((moduleName) => {
    const presentationDir = join(modulesRoot, moduleName, 'presentation');
    try {
      return collectPresentationFiles(presentationDir);
    } catch {
      return [];
    }
  });

  it('presentation layer does not depend on infrastructure or TypeORM', () => {
    const violations = presentationFiles
      .map((filePath) => {
        const content = readFileSync(filePath, 'utf-8');
        const matches = forbiddenImportPatterns.filter((pattern) =>
          pattern.test(content),
        );
        if (matches.length > 0) {
          return { filePath, matches };
        }
        return null;
      })
      .filter(
        (item): item is { filePath: string; matches: RegExp[] } => !!item,
      );

    const formatted = violations
      .map(
        (violation) =>
          `${violation.filePath} -> ${violation.matches
            .map((pattern) => pattern.source)
            .join(', ')}`,
      )
      .join('\n');

    expect(formatted).toBe('');
  });
});
