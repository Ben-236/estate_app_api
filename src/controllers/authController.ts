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


export const registerProfile = use (async (
  req: Request,
  res: Response
) => {
  const {
    fullName,
    phoneNumber,
    homeAddress,
    occupation,
    password,
  } = req.body;

  const result = await landlordPrisma.user.create({
    data: {
      fullName,
      phoneNumber,
      homeAddress,
      occupation,
      password,
      profileImage: req.file?.path,
    },
  });

   res.status(codes.created).json({
    success: true,
    message: "Profile created successfully",
    data: result,
  });
});

// export const registerEmail = use (async (
//   req: Request,
//   res: Response
// ) => {
//   const {
//     userId,
//     email,
//   } = req.body;

//   const user = await landlordPrisma.user.findUnique({
//     where: {
//       id: userId,
//     },
//   });

//   if (!user) {
//     throw new ErrorWithCode("User not found", codes.notFound);
//   }

//   if (user.isVerified) {
//     throw new ErrorWithCode(
//       "User email is already verified",
//       codes.badRequest
//     );
//   }

//   const existingEmail = await landlordPrisma.user.findUnique({
//     where: {
//       email,
//     },
//   });

//   if (existingEmail && existingEmail.id !== userId) {
//     throw new ErrorWithCode(
//       "Email is already registered",
//       codes.conflict
//     );
//   }

//    const otp =  generateSecureRandomString(6)
//    const otpHash = await bcrypt.hash(otp, 10);

//   await landlordPrisma.user.update({
//     where: {
//       id: userId,
//     },
//     data: {
//       email,
//     },
//   });

//   await landlordPrisma.emailVerification.create({
//     data: {
//       userId,
//       otpHash,
//       otp: generateSecureRandomString(6),
//       expiresAt: new Date(Date.now() + 10 * 60 * 1000),
//     },
//   });

//   // Send OTP email here.
//   // await sendEmail(...);

//       // const orgName =
//       //       req.orgCode.charAt(0).toUpperCase() + req.orgCode.slice(1).toLowerCase();
//       //   const resetLink = getFrontendUrl(
//       //       `/${orgName.toLocaleLowerCase()}/admin/reset-password/${resetToken}`,
//       //   );
        
//         const templatePath = path.resolve(
//             process.cwd(),
//             "templates",
//             "otpPassword.html",
//         );

//         const htmlTemplate = await fs.promises.readFile(templatePath, "utf8");
//         const html = htmlTemplate
//             .replace("{{name}}", email)
//             .replace("{{reset_link}}", resetLink)
//             .replace("{{orgName}}", orgName);

//         await sendEmail({
//             to: email,
//             subject: `Password reset for ${orgName}`,
//             html,
//         });

        

//    res.status(codes.success).json({
//     success: true,
//     message: "Verification OTP sent to your email",
//   });
//   return;
// });


export const registerEmail = use(async (
  req: Request,
  res: Response
) => {
  const {
    userId,
    email,
  } = req.body;

  const user = await landlordPrisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new ErrorWithCode("User not found", codes.notFound);
  }

  if (user.isVerified) {
    throw new ErrorWithCode(
      "User email is already verified",
      codes.badRequest
    );
  }

  const existingEmail = await landlordPrisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingEmail && existingEmail.id !== userId) {
    throw new ErrorWithCode(
      "Email is already registered",
      codes.conflict
    );
  }

  // Generate one OTP and hash the same OTP for storage
  const otp = generateSecureRandomString(6);
  const otpHash = await bcrypt.hash(otp, 10);

  await landlordPrisma.user.update({
    where: {
      id: userId,
    },
    data: {
      email,
    },
  });

  await landlordPrisma.emailVerification.create({
    data: {
      userId,
      otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  // Load OTP email template
  const templatePath = path.resolve(
    process.cwd(),
    "templates",
    "otpPassword.html"
  );

  const htmlTemplate = await fs.promises.readFile(
    templatePath,
    "utf8"
  );

  // Replace template variables
  const html = htmlTemplate
    .replace("{{name}}", email)
    .replace("{{otp}}", otp)


  // Send OTP email
  await sendEmail({
    to: email,
    subject: `Email verification OTP for ${email}`,
    html,
  });

  res.status(codes.success).json({
    success: true,
    message: "Verification OTP sent to your email",
  });

  return;
});


export const verifyEmail = use (async (
  req: Request,
  res: Response
) => {
  const {
    userId,
    otp,
  } = req.body;

  const verification = await landlordPrisma.emailVerification.findFirst({
    where: {
      userId,
      verifiedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!verification) {
    throw new ErrorWithCode(
      "Invalid or expired verification code",
      codes.badRequest
    );
  }

  const isValidOtp = await bcrypt.compare(
    otp,
    verification.otpHash
  );

  if (!isValidOtp) {
    throw new ErrorWithCode(
      "Invalid or expired verification code",
      codes.badRequest
    );
  }

  await landlordPrisma.$transaction([
    landlordPrisma.emailVerification.update({
      where: {
        id: verification.id,
      },
      data: {
        verifiedAt: new Date(),
      },
    }),

    landlordPrisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isVerified: true,
      },
    }),
  ]);

  res.status(codes.success).json({
    success: true,
    message: "Email verified successfully",
  });
   return;
});



export const login = use (async (
  req: Request,
  res: Response
) => {
  const {
    email,
    password,
  } = req.body;

  const user = await landlordPrisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new ErrorWithCode(
      "Invalid email or password",
      codes.unAuthorized
    );
  }

  const passwordMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatch) {
    throw new ErrorWithCode(
      "Invalid email or password",
      codes.unAuthorized
    );
  }

  if (user.isDeleted) {
    throw new ErrorWithCode(
      "This account is no longer available",
      codes.forbidden
    );
  }

  if (!user.isActive) {
    throw new ErrorWithCode(
      "This account has been deactivated",
      codes.forbidden
    );
  }

  if (!user.isVerified) {
    throw new ErrorWithCode(
      "Please verify your email before logging in",
      codes.forbidden
    );
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    }
  );

   res.status(codes.success).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
      },
    },
  });
  return;
});


function sendEmail(arg0: { to: any; subject: string; html: string; }) {
  throw new Error("Function not implemented.");
}

