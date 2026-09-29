// import "dotenv/config";

// const requiredEnv = (name: string): string => {
//   const value = process.env[name];

//   if (!value) {
//     throw new Error(`Missing required environment variable: ${name}`);
//   }

//   return value;
// };

// const env = {
//   nodeEnv: process.env.NODE_ENV ?? "development",
//   port: Number(process.env.PORT ?? 5003),

//   appName: requiredEnv("APP_NAME"),

//   landlordDatabaseUrl: requiredEnv("LANDLORD_DATABASE_URL"),

//   dbHost: requiredEnv("DB_HOST"),
//   dbPort: Number(process.env.DB_PORT ?? 3306),
//   dbUser: requiredEnv("DB_USER"),
//   dbPassword: requiredEnv("DB_PASS"),
//   dbName: requiredEnv("DB_NAME"),

//   jwtSecret: requiredEnv("JWT_SECRET"),
//   jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
// };

// export default env;

import "dotenv/config";
import { SignOptions } from "jsonwebtoken";

const requiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5003),

  appName: requiredEnv("APP_NAME"),

  landlordDatabaseUrl: requiredEnv("LANDLORD_DATABASE_URL"),

  dbHost: requiredEnv("DB_HOST"),
  dbPort: Number(process.env.DB_PORT ?? 3306),
  dbUser: requiredEnv("DB_USER"),
  dbPassword: requiredEnv("DB_PASS"),
  dbName: requiredEnv("DB_NAME"),

  jwtSecret: requiredEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
};

export default env;