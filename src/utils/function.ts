import crypto, { randomBytes } from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";
import { PrismaClient } from "../generated/tenant/prisma/client";
import { v4 as uuid } from "uuid";

interface AccessTokenPayload {
  id: string;
  userType: "ADMIN" | "STAFF" | "USER";
  roleId?: string | null;
}

export function generateAccessToken(payload: AccessTokenPayload): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not defined");
  }

  const options: SignOptions = {
    expiresIn: (process.env.JWT_TOKEN_EXPIRES as StringValue) || "10m",
  };

  return jwt.sign(
    {
      sub: payload.id,
      userType: payload.userType,
      roleId: payload.roleId ?? null,
      tokenType: "access",
    },
    secret,
    options
  );
}

export function generateRefreshToken(): string {
  const token = crypto.randomBytes(64).toString("hex");
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

}


export function exclude<T extends Record<string, any>, K extends keyof T>(user: T, keys: K[]): Omit<T, K> {
  return Object.fromEntries(
    Object.entries(user).filter(([key]) => !keys.includes(key as K))
  ) as Omit<T, K>;
}

export function show<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => keys.includes(key as K))
  ) as Pick<T, K>;
}

export const generatePaginationQuery = ({ page = 1, perPage = 15 }: { page?: number, perPage?: number }) => ({
  take: perPage,
  skip: (page - 1) * perPage
})

export const generatePaginationMeta = (currentPage: number = 1, itemsPerPage: number = 15, totalCount: number) => ({
  meta: {
    currentPage,
    itemsPerPage,
    totalItems: totalCount,
    totalPages: Math.ceil(totalCount / itemsPerPage),
  }
})

export const getFrontendUrl = (
  path: string,
  queryParams?: Record<string, string | number | boolean>
) => {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const url = new URL(baseUrl);

  url.pathname = path.startsWith("/") ? path : `/${path}`;

  Object.entries(queryParams ?? {}).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  return url.toString();
};


export const generatePassword = async (): Promise<string> => {
  const length: number = 8;
  const byteLength = Math.ceil(length / 2);
  return randomBytes(byteLength).toString("hex").slice(0, length);
};

export const generateSecureRandomString = (length: number): string => {
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte: number) => ('0' + (byte % 36).toString(36)).slice(-1)).join('');
}


/**
 * Convert a date string or Date object to a human-readable format
 * Example output: "Thursday, December 25, 2025, 2:45 PM"
 * @param date - string (ISO) or Date object
 * @returns formatted date string or "N/A" if invalid
 */
export const formatDateTime = (date?: string | Date): string => {
  if (!date) return "N/A";

  const dt = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dt.getTime())) return "N/A"; // invalid date check

  return dt.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}


export const resolveVisitToUser = async (
  prisma: PrismaClient,
  visit_to: string,
  userType: "staff" | "patient"
) => {
  if (userType === "staff") {
    const staff = await prisma.staff.findUnique({
      where: { id: visit_to },
    });

    if (!staff) {
      throw new Error("Staff not found");
    }
  }

  if (userType === "patient") {
    const patient = await prisma.user.findUnique({
      where: { id: visit_to },
    });

    if (!patient) {
      throw new Error("Patient not found");
    }
  }
};

export function parseVisitDateTime(visitDate?: string, time?: string): Date | undefined {
  if (!visitDate || !time) return undefined;
  const dt = new Date(`${visitDate}T${time}Z`);
  if (isNaN(dt.getTime())) throw new Error("Invalid visitDate or time format");
  return dt;
}

export function isUserType(value: any): value is "staff" | "patient" {
  return value === "staff" || value === "patient";
}

export function generateRandomNumber(): number {
  return Math.floor(10000 + Math.random() * 90000);
}
