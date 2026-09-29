// import "dotenv/config";
// import { PrismaClient } from "../generated/landlord";
// import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// const adapter = new PrismaMariaDb({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   port: Number(process.env.DB_PORT),
//   password: process.env.DB_PASS,
//   database: "estate_app",
//   connectionLimit: 5,
// });

// const landlordPrisma = new PrismaClient({ adapter });

// export default landlordPrisma;

import { PrismaClient } from "../generated/landlord";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import env from "./env";

const adapter = new PrismaMariaDb({
  host: env.dbHost,
  user: env.dbUser,
  port: env.dbPort,
  password: env.dbPassword,
  database: env.dbName,
  connectionLimit: 5,
});

const landlordPrisma = new PrismaClient({ adapter });

export default landlordPrisma;