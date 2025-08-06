export interface CloudflareBindings {
  DB: D1Database;
  BUCKET: R2Bucket;
  BETTER_AUTH_SECRET: string;
  RESEND_API_KEY: string;
  CLIENT_ORIGIN_URL: string;
  SERVER_BASE_URL: string;
}
