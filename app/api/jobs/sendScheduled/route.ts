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
  const secret = req.headers.get("x-cron-secret") || "";
  if (secret !== process.env.CRON_SECRET)
    return NextResponse.json({ ok: false }, { status: 403 });

  const now = new Date();
  const jobs = await prisma.scheduledMessage.findMany({
    where: { status: "PENDING", scheduledAt: { lte: now } },
    take: 50,
  });

  for (const job of jobs) {
    try {
      // Check if scheduled time has passed
      if (new Date(job.scheduledAt) > now) {
        continue; // Skip if not yet time to send
      }

      await prisma.scheduledMessage.update({
        where: { id: job.id },
        data: { status: "RUNNING" },
      });
      const sender = createSender(job.channel);
      const result = await sender.send({
        to: job.channel === "SMS" ? job.contactId : `whatsapp:${job.contactId}`,
        body: job.body,
        mediaUrls: job.media,
      });
      if (job.threadId) {
        await prisma.message.create({
          data: {
            threadId: job.threadId,
            direction: "OUTBOUND",
            channel: job.channel,
            body: job.body,
            media: job.media,
            from:
              job.channel === "SMS"
                ? process.env.TWILIO_PHONE_NUMBER!
                : process.env.TWILIO_WHATSAPP_NUMBER!,
            to:
              job.channel === "SMS"
                ? job.contactId
                : `whatsapp:${job.contactId}`,
            status: "SENT",
            channelMeta: { sentJobId: job.id, sid: result.sid },
          },
        });
      }
      await prisma.scheduledMessage.delete({
        where: { id: job.id },
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
