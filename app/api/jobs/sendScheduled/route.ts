// app/api/jobs/sendScheduled/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import { createSender } from "@/lib/integrations";

/**
 * GET /api/jobs/sendScheduled
 * Cron job to process and send scheduled messages
 * @param {Request} req - The request object with cron secret header
 * @returns {Promise<NextResponse>} Processing result
 */
export async function GET(req: Request) {
  const secret = req.headers.get("x-vercel-cron-secret") || "";
  if (secret !== process.env.VERCEL_CRON_SECRET)
    return NextResponse.json({ ok: false }, { status: 403 });

  const now = new Date();
  const jobs = await prisma.scheduledMessage.findMany({
    where: { status: "PENDING", scheduledAt: { lte: now } },
    take: 50,
  });

  for (const job of jobs) {
    try {
      await prisma.scheduledMessage.update({
        where: { id: job.id },
        data: { status: "RUNNING" },
      });
      const sender = createSender(job.channel);
      const result = await sender.send({
        to: job.contactId /* phone number */,
        body: job.body,
        mediaUrls: job.media,
      });
      await prisma.message.create({
        data: {
          threadId: job.threadId ?? undefined,
          direction: "OUTBOUND",
          channel: job.channel,
          body: job.body,
          media: job.media,
          from: process.env.TWILIO_PHONE_NUMBER!,
          to: job.contactId,
          status: "SENT",
          channelMeta: { sentJobId: job.id, sid: result.sid },
        },
      });
      await prisma.scheduledMessage.update({
        where: { id: job.id },
        data: { status: "COMPLETED" },
      });
    } catch (err) {
      console.error("job failed", job.id, err);
      await prisma.scheduledMessage.update({
        where: { id: job.id },
        data: { status: "FAILED" },
      });
    }
  }

  return NextResponse.json({ ok: true, processed: jobs.length });
}
