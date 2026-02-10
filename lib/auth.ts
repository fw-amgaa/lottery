import { betterAuth } from "better-auth";
import { pool } from "@/lib/db";

const baseURL =
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);

export const auth = betterAuth({
  database: pool,
  baseURL,
  trustedOrigins: baseURL ? [baseURL] : [],
  emailAndPassword: {
    enabled: true,
  },
});
