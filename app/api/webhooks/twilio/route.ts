import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import crypto from "crypto";
import { z } from "zod";

const twilioWebhookSchema = z.object({
  From: z.string().min(1, "From field is required"),
  To: z.string().min(1, "To field is required"),
  Body: z.string().optional().default(""),
  MessageSid: z.string().min(1, "MessageSid is required"),
});

/**
 * Validates Twilio webhook signature for security
 * @param {string} signature - The Twilio signature from headers
 * @param {string} url - The webhook URL
 * @param {Record<string, string>} params - The form parameters
 * @returns {boolean} True if signature is valid
 */
function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return false;

  const data =
    url +
    Object.keys(params)
      .sort()
      .reduce((acc, key) => acc + key + params[key], "");

  const expectedSignature = crypto
    .createHmac("sha1", authToken)
    .update(data, "utf-8")
    .digest("base64");

  return signature === expectedSignature;
}

/**
 * POST /api/webhooks/twilio
 * Handles incoming messages from Twilio (SMS/WhatsApp)
 * @param {NextRequest} req - The request object containing webhook data
 * @returns {Promise<NextResponse>} Success response or error
 */
export async function POST(req: NextRequest) {
  try {
    // Verify Twilio signature
    const signature = req.headers.get("x-twilio-signature");
    
    if (!signature) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const params: Record<string, string> = {};
    for (const [key, value] of form.entries()) {
      params[key] = value.toString();
    }

    // Get the full URL that Twilio used
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("host") || req.headers.get("x-forwarded-host");
    
    if (!host) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    
    const url = `${protocol}://${host}/api/webhooks/twilio`;

    if (!validateTwilioSignature(signature, url, params)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const webhookData = {
      From: form.get("From")?.toString() || "",
      To: form.get("To")?.toString() || "",
      Body: form.get("Body")?.toString() || "",
      MessageSid: form.get("MessageSid")?.toString() || "",
    };

    const result = twilioWebhookSchema.safeParse(webhookData);
    if (!result.success) {
      const error = result.error.errors[0];
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { From, To, Body, MessageSid } = result.data;

    // Check for duplicate messages
    const existingMessage = await prisma.message.findFirst({
      where: {
        channelMeta: {
          path: ["messageSid"],
          equals: MessageSid,
        },
      },
    });

    if (existingMessage) {
      return NextResponse.json({ ok: true, messageId: existingMessage.id });
    }

    // Sanitize phone number and message body
    const sanitizedFrom = From.replace(/[^+\d]/g, "");
    const sanitizedBody = Body.substring(0, 1600).trim();

    // Find or create contact
    let contact = await prisma.contact.findUnique({
      where: { phone: sanitizedFrom },
    });
    if (!contact) {
      contact = await prisma.contact.create({ data: { phone: sanitizedFrom } });
    }

    // Find or create thread
    const channel = To?.includes("whatsapp:") ? "WHATSAPP" : "SMS";
    let thread = await prisma.thread.findFirst({
      where: { contactId: contact.id, channel },
    });
    if (!thread) {
      thread = await prisma.thread.create({
        data: { contactId: contact.id, channel },
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        threadId: thread.id,
        direction: "INBOUND",
        channel,
        body: sanitizedBody,
        from: sanitizedFrom,
        to: To,
        channelMeta: { messageSid: MessageSid },
        receivedAt: new Date(),
      },
    });

    // Update thread
    await prisma.thread.update({
      where: { id: thread.id },
      data: { unread: true, lastMessageAt: new Date() },
    });

    return NextResponse.json({ ok: true, messageId: message.id });
  } catch (error) {
    console.error("Webhook error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
