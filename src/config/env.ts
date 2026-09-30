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
  //dbPassword: requiredEnv("DB_PASS"),
  dbName: requiredEnv("DB_NAME"),
  awsAccessKeyId: requiredEnv("AWS_ACCESS_KEY_ID"),
  awsSecretAccessKey: requiredEnv("AWS_SECRET_ACCESS_KEY"),
  awsRegion: requiredEnv("AWS_REGION"),
  awsSesEmail: requiredEnv("AWS_SES_EMAIL"),
  emailFrom: requiredEnv("EMAIL_FROM"),
  mailHost: requiredEnv("MAIL_HOST"),
  mailPort: Number(process.env.MAIL_PORT ?? 25),
  mailUser: requiredEnv("MAIL_USER"),
  mailPass: requiredEnv("MAIL_PASS"),

  jwtSecret: requiredEnv("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"],

};

export default env;