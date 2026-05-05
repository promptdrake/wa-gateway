import { Hono } from "hono";
import { bearerAuthMiddleware } from "../middlewares/key.middleware";
import { requestValidator } from "../middlewares/validation.middleware";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { whatsapp, whatsappStatuses } from "../whatsapp";
import { env } from "../env";

export const createMessageController = () => {
  const sendMessageSchema = z.object({
    session: z.string(),
    to: z.string(),
    text: z.string(),
    is_group: z.boolean().optional(),
  });

  const app = new Hono()
    .basePath("/message")
    .use("/*", bearerAuthMiddleware(env.KEY))
    /**
     *
     * POST /message/send-text
     *
     */
    .post(
      "/send-text",
      requestValidator("json", sendMessageSchema),
      async (c) => {
        const payload = c.req.valid("json");
        const isExist = await whatsapp.getSessionById(payload.session);
        if (!isExist) {
          whatsappStatuses.delete(payload.session);
          throw new HTTPException(400, {
            message: "Session is logged out",
          });
        }

        await whatsapp.sendTypingIndicator({
          sessionId: payload.session,
          to: payload.to,
          duration: Math.min(5000, payload.text.length * 100),
          isGroup: payload.is_group,
        });

        const response = await whatsapp.sendText({
          sessionId: payload.session,
          to: payload.to,
          text: payload.text,
          isGroup: payload.is_group,
        });

        return c.json({
          data: response,
        });
      }
    )
    /**
     *
     * POST /message/send-text
     *
     * @deprecated
     * This endpoint is deprecated, use POST /send-text instead
     */
    .get(
      "/send-text",
      requestValidator("query", sendMessageSchema),
      async (c) => {
        const payload = c.req.valid("query");
        const isExist = await whatsapp.getSessionById(payload.session);
        if (!isExist) {
          whatsappStatuses.delete(payload.session);
          throw new HTTPException(400, {
            message: "Session is logged out",
          });
        }

        const response = await whatsapp.sendText({
          sessionId: payload.session,
          to: payload.to,
          text: payload.text,
        });

        return c.json({
          data: response,
        });
      }
    )
    /**
     *
     * POST /message/send-image
     *
     */
    .post(
      "/send-image",
      requestValidator(
        "json",
        sendMessageSchema.merge(
          z.object({
            image_url: z.string(),
          })
        )
      ),
      async (c) => {
        const payload = c.req.valid("json");
        const isExist = await whatsapp.getSessionById(payload.session);
        if (!isExist) {
          whatsappStatuses.delete(payload.session);
          throw new HTTPException(400, {
            message: "Session is logged out",
          });
        }

        await whatsapp.sendTypingIndicator({
          sessionId: payload.session,
          to: payload.to,
          duration: Math.min(5000, payload.text.length * 100),
          isGroup: payload.is_group,
        });

        const response = await whatsapp.sendImage({
          sessionId: payload.session,
          to: payload.to,
          text: payload.text,
          media: payload.image_url,
          isGroup: payload.is_group,
        });

        return c.json({
          data: response,
        });
      }
    )
    /**
     *
     * POST /message/send-document
     *
     */
    .post(
      "/send-document",
      requestValidator(
        "json",
        sendMessageSchema.merge(
          z.object({
            document_url: z.string(),
            document_name: z.string(),
          })
        )
      ),
      async (c) => {
        const payload = c.req.valid("json");
        const isExist = await whatsapp.getSessionById(payload.session);
        if (!isExist) {
          whatsappStatuses.delete(payload.session);
          throw new HTTPException(400, {
            message: "Session is logged out",
          });
        }

        await whatsapp.sendTypingIndicator({
          sessionId: payload.session,
          to: payload.to,
          duration: Math.min(5000, payload.text.length * 100),
          isGroup: payload.is_group,
        });

        const response = await whatsapp.sendDocument({
          sessionId: payload.session,
          to: payload.to,
          text: payload.text,
          media: payload.document_url,
          filename: payload.document_name,
          isGroup: payload.is_group,
        });

        return c.json({
          data: response,
        });
      }
    )
    /**
     *
     * POST /message/send-video
     *
     */
    .post(
      "/send-video",
      requestValidator(
        "json",
        z.object({
          session: z.string(),
          to: z.string(),
          text: z.string().optional(),
          video_url: z.string(),
          is_group: z.boolean().optional(),
        })
      ),
      async (c) => {
        const payload = c.req.valid("json");
        const isExist = await whatsapp.getSessionById(payload.session);
        if (!isExist) {
          whatsappStatuses.delete(payload.session);
          throw new HTTPException(400, {
            message: "Session is logged out",
          });
        }

        await whatsapp.sendTypingIndicator({
          sessionId: payload.session,
          to: payload.to,
          duration: Math.min(5000, (payload.text || "").length * 100),
          isGroup: payload.is_group,
        });

        const response = await whatsapp.sendVideo({
          sessionId: payload.session,
          to: payload.to,
          text: payload.text || "",
          media: payload.video_url,
          isGroup: payload.is_group,
        });

        return c.json({
          data: response,
        });
      }
    )
    /**
     *
     * POST /message/send-sticker
     *
     */
    .post(
      "/send-sticker",
      requestValidator(
        "json",
        sendMessageSchema.merge(
          z.object({
            image_url: z.string(),
          })
        )
      ),
      async (c) => {
        const payload = c.req.valid("json");
        const isExist = await whatsapp.getSessionById(payload.session);
        if (!isExist) {
          whatsappStatuses.delete(payload.session);
          throw new HTTPException(400, {
            message: "Session is logged out",
          });
        }

        const response = await whatsapp.sendSticker({
          sessionId: payload.session,
          to: payload.to,
          media: payload.image_url,
          isGroup: payload.is_group,
        });

        return c.json({
          data: response,
        });
      }
    );

  return app;
};
