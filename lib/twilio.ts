// lib/twilio.ts
import Twilio from "twilio";

// Validate Twilio credentials at module level
if (!process.env.TWILIO_ACCOUNT_SID) {
  throw new Error("TWILIO_ACCOUNT_SID environment variable is required");
}

if (!process.env.TWILIO_AUTH_TOKEN) {
  throw new Error("TWILIO_AUTH_TOKEN environment variable is required");
}

const client = Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSms({
  from,
  to,
  body,
  mediaUrls,
}: {
  from: string;
  to: string;
  body?: string;
  mediaUrls?: string[];
}) {
  // Validate required parameters
  if (!from || from.trim() === "") {
    throw new Error(
      'Twilio "from" number is required. Please set TWILIO_PHONE_NUMBER or TWILIO_WHATSAPP_NUMBER in your environment variables.'
    );
  }

  if (!to || to.trim() === "") {
    throw new Error('Recipient "to" number is required.');
  }



  const opts: {
    from: string;
    to: string;
    body?: string;
    mediaUrl?: string[];
  } = { from, to };

  if (body) opts.body = body;
  if (mediaUrls?.length) opts.mediaUrl = mediaUrls;

  try {
    return await client.messages.create(opts);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Twilio API Error:", error);
    throw new Error(`Failed to send message: ${errorMessage}`);
  }
}
