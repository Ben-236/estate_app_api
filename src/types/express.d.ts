import { PrismaClient as LandlordPrismaClient } from "../generated/landlord";
import { PrismaClient as TenantPrismaClient } from "../generated/tenant";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        email: string;
        fullName: string;
      };

      estate?: {
        id: string;
        name: string;
        orgCode: string;
        dbName: string;
        dbUrl: string;
      };

      landlordPrisma?: LandlordPrismaClient;
      tenantPrisma?: TenantPrismaClient;

      orgCode?: string;
    }
  }
}

export {};
