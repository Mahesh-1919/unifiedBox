import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import { createSender } from "@/lib/integrations";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/roles";
import { z } from "zod";

const messageRequestSchema = z.object({
  threadId: z.string().min(1),
  to: z.string().min(1),
  channel: z.enum(["SMS", "WHATSAPP"]),
  text: z.string().min(1).max(1600),
  scheduledAt: z.string().optional(),
  mediaUrls: z.array(z.string()).optional(),
});

/**
 * POST /api/messages
 * Sends a message or schedules it for later delivery
 * @param {NextRequest} req - The request object containing message data
 * @returns {Promise<NextResponse>} Success response or error
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role as import("@/lib/roles").UserRole;
    if (!hasPermission(userRole, "canSendMessages")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const result = messageRequestSchema.safeParse(body);
    if (!result.success) {
      const error = result.error.errors[0];
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { threadId, to, channel, text, scheduledAt, mediaUrls } = result.data;

    if (scheduledAt) {
      const job = await prisma.scheduledMessage.create({
        data: {
          threadId,
          contactId: to,
          channel,
          body: text,
          media: mediaUrls || [],
          scheduledAt: new Date(scheduledAt),
        },
      });
      return NextResponse.json({ ok: true, scheduledId: job.id });
    }

    const sender = createSender(channel);

    const res = await sender.send({
      to: channel === "WHATSAPP" ? `whatsapp:${to}` : to,
      body: text,
      mediaUrls,
    });

    if (!res.errorMessage) {
      await prisma.message.create({
        data: {
          threadId,
          direction: "OUTBOUND",
          channel,
          body: text,
          media: mediaUrls || [],
          from:
            channel === "WHATSAPP"
              ? process.env.TWILIO_WHATSAPP_NUMBER
              : process.env.TWILIO_PHONE_NUMBER,
          to,
          status: "SENT",
          channelMeta: { sid: res.sid },
        },
      });
      return NextResponse.json({ ok: true });
    } else {
      console.error("Message sending failed:", res.errorMessage);
      return NextResponse.json(
        { ok: false, error: res.errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Message API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
