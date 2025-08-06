import { HTTPException } from "hono/http-exception";
import { auth } from "../lib/auth";
import type { MiddlewareHandler } from "hono";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  // get the session from the request headers
  const session = await auth(c.env).api.getSession({ headers: c.req.raw.headers });

  // if there is no session, block the request
  if (!session) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  // if the session is valid, add user and session to the context
  c.set("user", session.user);
  c.set("session", session.session);

  // continue to the next route
  await next();
}
