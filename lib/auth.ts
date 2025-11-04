import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import prisma from "@/prisma/db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      disableImplicitSignUp: true,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "VIEWER",
        required: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
