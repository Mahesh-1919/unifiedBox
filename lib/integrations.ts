// lib/integrations.ts
import { sendSms } from "./twilio";

export function createSender(channel: string) {
  switch (channel) {
    case "SMS":
      if (!process.env.TWILIO_PHONE_NUMBER) {
        throw new Error(
          "TWILIO_PHONE_NUMBER environment variable is required for SMS messages"
        );
      }
      return {
        send: (p: { to: string; body?: string; mediaUrls?: string[] }) =>
          sendSms({
            from: process.env.TWILIO_PHONE_NUMBER!,
            to: p.to,
            body: p.body,
            mediaUrls: p.mediaUrls,
          }),
      };
    case "WHATSAPP":
      if (!process.env.TWILIO_WHATSAPP_NUMBER) {
        throw new Error(
          "TWILIO_WHATSAPP_NUMBER environment variable is required for WhatsApp messages"
        );
      }
      return {
        send: (p: { to: string; body?: string; mediaUrls?: string[] }) =>
          sendSms({
            from: process.env.TWILIO_WHATSAPP_NUMBER!,
            to: p.to,
            body: p.body,
            mediaUrls: p.mediaUrls,
          }),
      };
    default:
      throw new Error(`Channel "${channel}" is not implemented`);
  }
}
