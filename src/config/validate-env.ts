export function validateEnv(config: Record<string, unknown>) {
  const port = Number(config['PORT']);
  const jwtSecret = config['JWT_ACCESS_SECRET'];
  const nodeEnv = config['NODE_ENV'];
  const allowedEnvironments = ['development', 'test', 'production'];

  const requiredEnvNames = ['JWT_ACCESS_SECRET', 'DATABASE_URL'] as const;
  requiredEnvNames.forEach((name) => {
    const value = config[name];
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`Некорректная переменная окружения: ${name}`);
    }
  });

  if (typeof jwtSecret !== 'string' || jwtSecret.length < 32) {
    throw new Error('JWT_ACCESS_SECRET должен содержать минимум 32 символа');
  }

  if (typeof nodeEnv !== 'string' || !allowedEnvironments.includes(nodeEnv)) {
    throw new Error('Некорректная переменная окружения: NODE_ENV');
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Некорректный порт');
  }

  return config;
}
