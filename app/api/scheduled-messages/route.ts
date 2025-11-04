import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/db";

/**
 * GET /api/scheduled-messages
 * Retrieves scheduled messages for a specific thread
 * @param {NextRequest} req - The request object with threadId query parameter
 * @returns {Promise<NextResponse>} List of scheduled messages or error
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get("threadId");

    if (!threadId) {
      return NextResponse.json({ error: "Thread ID required" }, { status: 400 });
    }

    const scheduledMessages = await prisma.scheduledMessage.findMany({
      where: { threadId },
      orderBy: { scheduledAt: "asc" },
    });

    return NextResponse.json(scheduledMessages);
  } catch (error) {
    console.error("Get scheduled messages error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}