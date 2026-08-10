export function validateEnv(config: Record<string, unknown>) {
  const envValues = [config['JWT_ACCESS_SECRET'], config['DATABASE_URL']];
  const port = Number(config['PORT']);

  envValues.forEach((value) => {
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`Некорректный ${value}`);
    }
  });

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Некорректный порт');
  }

  return config;
}
