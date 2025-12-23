function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  DB_HOST: required("DB_HOST"),
  DB_PORT: Number(process.env.DB_PORT ?? 3306),
  DB_USER: required("DB_USER"),
  DB_PASSWORD: required("DB_PASSWORD"),
  DB_NAME: required("DB_NAME"),
  DB_CONN_LIMIT: Number(process.env.DB_CONN_LIMIT ?? 5),
  API_PORT: Number(process.env.API_PORT ?? 3000),
  ONTIME_HOST: required("ONTIME_HOST"),
  ONTIME_PORT: Number(process.env.ONTIME_PORT ?? 4001),
};