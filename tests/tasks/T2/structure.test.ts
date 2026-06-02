import fs from 'fs';
import path from 'path';

describe('Project Structure', () => {
  const projectRoot = path.resolve(__dirname, '../..');

  test('should have a src/ directory', () => {
    const srcPath = path.join(projectRoot, 'src');
    expect(fs.existsSync(srcPath)).toBe(true);
    expect(fs.statSync(srcPath).isDirectory()).toBe(true);
  });

  test('should have a src/server.ts file', () => {
    const serverPath = path.join(projectRoot, 'src', 'server.ts');
    expect(fs.existsSync(serverPath)).toBe(true);
  });

  test('should have a src/config.ts file', () => {
    const configPath = path.join(projectRoot, 'src', 'config.ts');
    expect(fs.existsSync(configPath)).toBe(true);
  });

  test('should have a shared types directory or file', () => {
    const typesDir = path.join(projectRoot, 'src', 'types');
    const typesFile = path.join(projectRoot, 'src', 'types.ts');
    const hasTypesDir = fs.existsSync(typesDir) && fs.statSync(typesDir).isDirectory();
    const hasTypesFile = fs.existsSync(typesFile);
    expect(hasTypesDir || hasTypesFile).toBe(true);
  });

  test('should have a Dockerfile', () => {
    const dockerfilePath = path.join(projectRoot, 'Dockerfile');
    expect(fs.existsSync(dockerfilePath)).toBe(true);
  });

  test('should have a .env.example or .env file', () => {
    const envExamplePath = path.join(projectRoot, '.env.example');
    const envPath = path.join(projectRoot, '.env');
    const hasEnvExample = fs.existsSync(envExamplePath);
    const hasEnv = fs.existsSync(envPath);
    expect(hasEnvExample || hasEnv).toBe(true);
  });

  test('should use TypeScript (tsconfig.json exists)', () => {
    const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
    expect(fs.existsSync(tsconfigPath)).toBe(true);
  });

  test('should have package.json with dependencies', () => {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    expect(fs.existsSync(packageJsonPath)).toBe(true);

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.dependencies).toBeDefined();
    expect(packageJson.devDependencies).toBeDefined();
  });

  test('should have express in dependencies', () => {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.dependencies.express).toBeDefined();
  });

  test('should have ws (WebSocket) in dependencies', () => {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.dependencies.ws).toBeDefined();
  });

  test('should have TypeScript in devDependencies', () => {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.devDependencies.typescript).toBeDefined();
  });
});
