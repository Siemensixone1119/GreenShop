export function validateEnv(config: Record<string, unknown>) {
  const port = Number(config['PORT']);

  const requiredEnvNames = ['JWT_ACCESS_SECRET', 'DATABASE_URL'] as const;
  requiredEnvNames.forEach((name) => {
    const value = config[name];
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`Некорректная переменная окружения: ${name}`);
    }
  });

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Некорректный порт');
  }

  return config;
}
