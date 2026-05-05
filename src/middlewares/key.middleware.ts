import { HTTPException } from "hono/http-exception";
import { createMiddleware } from "hono/factory";
import { env } from "../env";
import { getCookie, getSignedCookie } from "hono/cookie";

export const bearerAuthMiddleware = (expectedToken: string) =>
  createMiddleware(async (c, next) => {
    const authHeader = c.req.header("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      throw new HTTPException(401, { message: "Missing Bearer token" });
    }
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token || token !== expectedToken) {
      throw new HTTPException(401, { message: "Invalid Bearer token" });
    }
    await next();
  });
export const createKeyMiddleware = () =>
  createMiddleware(async (c, next) => {
    const authorization = c.req.query().key || c.req.header().key;
    if (env.KEY && (!authorization || authorization != env.KEY)) {
      throw new HTTPException(401, {
        message: "Unauthorized",
      });
    }

    await next();
  });
export const createDashboardMiddleware = () =>
  createMiddleware(async (c, next) => {
    const authorization = await getSignedCookie(
      c,
      "14e9f106-9860-4219-ae63-d34e4f5127bd",
      "key"
    );
    if (env.KEY && (!authorization || authorization !== env.KEY)) {
      return c.redirect("/auth/login");
    }

    await next();
  });
