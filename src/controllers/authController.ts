import { Request, Response } from "express";
import landlordPrisma from "../config/landlordDatabase";
import codes from "../utils/statusCode";
import { upload } from "../services/file";
import { generateSecureRandomString, getFrontendUrl } from "../utils/function";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs";
import use from "../utils/use";
import ErrorWithCode from "../utils/ErrorWithCode";
import jwt from "jsonwebtoken";
import env from "../config/env";
import path from "path";
import { sendEmail } from "../services/emailService";



export const registerEmail = use(async (req: Request, res: Response) => {
  const { email } = req.body;

  const existingUser = await landlordPrisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new ErrorWithCode(
      "Email is already registered",
      codes.conflict,
    );
  }

  const otp = generateSecureRandomString(6);
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const existingRegistration =
    await landlordPrisma.registration.findUnique({
      where: {
        email,
      },
    });

  if (existingRegistration) {
    await landlordPrisma.registration.update({
      where: {
        id: existingRegistration.id,
      },
      data: {
        otpHash,
        expiresAt,
        verifiedAt: null,
      },
    });
  } else {
    await landlordPrisma.registration.create({
      data: {
        email,
        otpHash,
        expiresAt,
      },
    });
  }

  const templatePath = path.resolve(
    process.cwd(),
    "templates",
    "otpVerification.html",
  );

  const htmlTemplate = await fs.promises.readFile(
    templatePath,
    "utf8",
  );

  const html = htmlTemplate
    .replace("{{otp}}", otp);

  await sendEmail({
    to: email,
    subject: "Email Verification OTP",
    html,
  });

  res.status(codes.success).json({
    success: true,
    message: "Verification OTP sent to your email",
  });

  return;
});

export const verifyEmail = use(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const registration = await landlordPrisma.registration.findUnique({
    where: {
      email,
    },
  });

  if (
    !registration ||
    registration.verifiedAt ||
    registration.expiresAt <= new Date()
  ) {
    throw new ErrorWithCode(
      "Invalid or expired verification code",
      codes.badRequest,
    );
  }

  const isValidOtp = await bcrypt.compare(
    otp,
    registration.otpHash,
  );

  if (!isValidOtp) {
    throw new ErrorWithCode(
      "Invalid or expired verification code",
      codes.badRequest,
    );
  }

  await landlordPrisma.registration.update({
    where: {
      id: registration.id,
    },
    data: {
      verifiedAt: new Date(),
    },
  });

  res.status(codes.success).json({
    success: true,
    message: "Email verified successfully",
  });

  return;
});

export const registerProfile = use(async (
  req: Request,
  res: Response,
) => {
  const {
    registrationId,
    fullName,
    phoneNumber,
    homeAddress,
    occupation,
    password,
  } = req.body;

  const registration =
    await landlordPrisma.registration.findUnique({
      where: {
        id: registrationId,
      },
    });

  if (!registration || !registration.verifiedAt) {
    throw new ErrorWithCode(
      "Please verify your email before completing registration",
      codes.badRequest,
    );
  }

  const existingUser = await landlordPrisma.user.findUnique({
    where: {
      email: registration.email,
    },
  });

  if (existingUser) {
    throw new ErrorWithCode(
      "Email is already registered",
      codes.conflict,
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await landlordPrisma.user.create({
    data: {
      fullName,
      email: registration.email,
      phoneNumber,
      homeAddress,
      occupation,
      password: hashedPassword,
      profileImage: req.file?.path,
      isVerified: true,
    },
  });

  await landlordPrisma.registration.delete({
    where: {
      id: registration.id,
    },
  });

  res.status(codes.created).json({
    success: true,
    message: "Profile created successfully",
    data: {
      userId: result.id,
      fullName: result.fullName,
      email: result.email,
      phoneNumber: result.phoneNumber,
      homeAddress: result.homeAddress,
      occupation: result.occupation,
      profileImage: result.profileImage,
    },
  });

  return;
});

export const login = use(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await landlordPrisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new ErrorWithCode("Invalid email or password", codes.unAuthorized);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new ErrorWithCode("Invalid email or password", codes.unAuthorized);
  }

  if (user.isDeleted) {
    throw new ErrorWithCode(
      "This account is no longer available",
      codes.forbidden,
    );
  }

  if (!user.isActive) {
    throw new ErrorWithCode(
      "This account has been deactivated",
      codes.forbidden,
    );
  }

  if (!user.isVerified) {
    throw new ErrorWithCode(
      "Please verify your email before logging in",
      codes.forbidden,
    );
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    },
  );

  res.status(codes.success).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
      },
    },
  });

  return;
});
