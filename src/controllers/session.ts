import { Hono } from "hono";
import { requestValidator } from "../middlewares/validation.middleware";
import { z } from "zod";
import { bearerAuthMiddleware } from "../middlewares/key.middleware";
import { toDataURL } from "qrcode";
import { HTTPException } from "hono/http-exception";
import { whatsapp, whatsappStatuses } from "../whatsapp";
import { env } from "../env";
export const createSessionController = () => {
  const startSessionSchema = z.object({
    session: z.string(),
  });

  const app = new Hono()
    .basePath("/session")
    .use("/*", bearerAuthMiddleware(env.KEY))

    /**
     *
     * GET /session
     *
     */
    .get("/", async (c) => {
      return c.json({
        data: Array.from(whatsappStatuses.entries()).map(
          ([session, status]) => ({
            session,
            ...status,
          })
        ),
      });
    })

    /**
     *
     * GET /session/:session
     * Mendapatkan detail session berdasarkan session ID
     *
     */
    .get("/:session", async (c) => {
      const sessionId = c.req.param("session");

      if (!sessionId) {
        throw new HTTPException(400, {
          message: "Session ID is required",
        });
      }

      // Get session from whatsapp instance
      const session = await whatsapp.getSessionById(sessionId);
      
      if (!session) {
        throw new HTTPException(404, {
          message: `Session '${sessionId}' not found`,
        });
      }

      // Get status from whatsappStatuses map
      const statusInfo = whatsappStatuses.get(sessionId);

      // Get user information from session
      const user = session.sock?.user;

      return c.json({
        success: true,
        data: {
          session: sessionId,
          status: statusInfo?.status || "unknown",
          details: {
            name: statusInfo?.details?.name || user?.name || "",
            phoneNumber: statusInfo?.details?.phoneNumber || user?.id?.split(":")[0] || "",
          },
          connection: {
            isConnected: statusInfo?.status === "connected",
            lastUpdate: new Date().toISOString(),
          },
          metadata: {
            platform: (session.sock?.user as any)?.platform || "unknown",
            deviceManufacturer: (session.sock?.user as any)?.deviceManufacturer || "unknown",
            deviceModel: (session.sock?.user as any)?.deviceModel || "unknown",
          },
        },
      });
    })

    /**
     *
     * POST /session/start
     *
     */
    .post(
      "/start",
      requestValidator("json", startSessionSchema),
      async (c) => {
        const payload = c.req.valid("json");

        const isExist = await whatsapp.getSessionById(payload.session);
        if (isExist) {
          throw new HTTPException(400, {
            message: "Session already exist",
          });
        }

        const qr = await new Promise<string | null>(async (r) => {
          await whatsapp.startSession(payload.session, {
            onConnected() {
              r(null);
            },
            onQRUpdated(qr) {
              r(qr);
            },
          });
        });

        if (qr) {
          return c.json({
            qr: qr,
          });
        }

        return c.json({
          data: {
            message: "Connected",
          },
        });
      }
    )

    /**
     *
     * GET /session/start
     *
     */
    .get(
      "/start",
      requestValidator("query", startSessionSchema),
      async (c) => {
        const payload = c.req.valid("query");

        const isExist = await whatsapp.getSessionById(payload.session);
        if (isExist) {
          throw new HTTPException(400, {
            message: "Session already exist",
          });
        }

        const qr = await new Promise<string | null>(async (r) => {
          await whatsapp.startSession(payload.session, {
            onConnected() {
              r(null);
            },
            onQRUpdated(qr) {
              r(qr);
            },
          });
        });

        if (qr) {
          return c.render(`
            <div id="qrcode"></div>

            <script type="text/javascript">
                let qr = '${await toDataURL(qr)}'
                let image = new Image()
                image.src = qr
                document.body.appendChild(image)
            </script>
            `);
        }

        return c.json({
          data: {
            message: "Connected",
          },
        });
      }
    )
    /**
     *
     * GET/POST /session/logout?session=SESSION_NAME
     *
     */
    .all("/logout", async (c) => {
      let sessionName = c.req.query().session;
      if (!sessionName && c.req.header("content-type")?.includes("application/json")) {
        const body = await c.req.json().catch(() => ({}));
        sessionName = body.session;
      }
      if (!sessionName) {
        throw new HTTPException(400, { message: "Session name required" });
      }
      await whatsapp.deleteSession(sessionName);
      whatsappStatuses.delete(sessionName);
      // Notify webhook
      try {
        const { createWebhookSession } = await import("../webhooks/session");
        const webhookSession = createWebhookSession({ baseUrl: env.WEBHOOK_BASE_URL });
        webhookSession({ session: sessionName, status: "disconnected" });
      } catch {}
      return c.json({ data: "success" });
    })

    /**
     *
     * POST /session/getsession
     * Get session status by session name
     *
     */
    .post("/getsession", async (c) => {
      const { session_name } = await c.req.json().catch(() => ({}));
      if (!session_name) {
        throw new HTTPException(400, { message: "session_name required" });
      }
      const statusInfo = whatsappStatuses.get(session_name);
      const status = statusInfo?.status || "logout";
      return c.json({ session: session_name, status });
    })

    /**
     *
     * DELETE /session/:session
     * Menghapus session berdasarkan session ID
     *
     */
    .delete("/:session", async (c) => {
      const sessionId = c.req.param("session");

      if (!sessionId) {
        throw new HTTPException(400, {
          message: "Session ID is required",
        });
      }

      // Check if session exists
      const session = await whatsapp.getSessionById(sessionId);
      if (!session) {
        throw new HTTPException(404, {
          message: `Session '${sessionId}' not found`,
        });
      }

      try {
        // Delete the session
        await whatsapp.deleteSession(sessionId);

        // Remove from status map
        whatsappStatuses.delete(sessionId);

        return c.json({
          success: true,
          message: `Session '${sessionId}' deleted successfully`,
          data: {
            session: sessionId,
            deletedAt: new Date().toISOString(),
          },
        });
      } catch (error) {
        throw new HTTPException(500, {
          message: `Failed to delete session: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    });

  return app;
};
