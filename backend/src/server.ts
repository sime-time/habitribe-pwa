import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import { CloudflareBindings } from "./config/bindings";
import { createDailyHabitEntries } from "./lib/cron";
import habitRoute from "./routes/habit-route";
import uploadRoute from "./routes/upload-route";
import { authMiddleware } from "./middleware/auth-middleware";

const app = new Hono<{ Bindings: CloudflareBindings }>();

// cors middleware
app.use('*', async (c, next) => {
  const originUrl = c.env.CLIENT_ORIGIN_URL;
  const corsMiddleware = cors({
    origin: originUrl,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  });
  return corsMiddleware(c, next);
});

// catch-all route for better-auth
app.on(["GET", "POST"], "/api/auth/*", (c) => {
  return auth(c.env).handler(c.req.raw);
});

// middleware auth guard
app.use("/api/*", authMiddleware);

// habit route
app.route("/api/habit", habitRoute);

// upload images route
app.route("/api/upload", uploadRoute);


// public routes
app.get("/", (c) => {
  return c.text("Hello Habitribe");
});

app.get("/client", (c) => {
  return c.json({ success: c.env.CLIENT_ORIGIN_URL })
});


// cron job
export default {
  fetch: app.fetch,
  async scheduled(
    controller: ScheduledController,
    env: CloudflareBindings,
    ctx: ExecutionContext,
  ) {
    await createDailyHabitEntries(env)
  }
}
