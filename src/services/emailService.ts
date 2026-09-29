import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import nodemailer from "nodemailer";
import 'dotenv/config';

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  try {
    const sourceEmail = process.env.EMAIL_FROM;
    if (!sourceEmail) throw new Error("EMAIL_FROM environment variable is not set");


    const params = {
      Source: sourceEmail,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: {
          Html: { Data: html },
        },
      },
    };

    if (process.env.NODE_ENV === "development") {
      // Mailtrap or other SMTP for dev
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: sourceEmail,
        to,
        subject,
        html,
      });

      console.log("Email sent (development):", info.messageId);
    } else {
      // Production SES
      const command = new SendEmailCommand(params);
      const response = await sesClient.send(command);
      console.log("Email sent (SES):", response.MessageId);
    }

  } catch (error) {
    console.error("Email SEND ERROR:", error);
    throw error;
  }
};