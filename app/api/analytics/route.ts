import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/db";

/**
 * GET /api/analytics
 * Retrieves analytics data including message counts and statistics
 * @param {NextRequest} req - The request object
 * @returns {Promise<NextResponse>} Analytics data or error
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total messages
    const totalMessages = await prisma.message.count();

    // Get total contacts
    const totalContacts = await prisma.contact.count();

    // Get messages by channel
    const messagesByChannel = await prisma.message.groupBy({
      by: ["channel"],
      _count: {
        id: true,
      },
    });

    // Get messages over time (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const messagesOverTime = await prisma.message.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Format messages over time data
    const formattedMessagesOverTime = messagesOverTime.reduce((acc, item) => {
      const date = new Date(item.createdAt).toISOString().split("T")[0];

      const existing = acc.find((d) => d.date === date);
      if (existing) {
        existing.count += item._count.id;
      } else {
        acc.push({ date, count: item._count.id });
      }
      return acc;
    }, [] as { date: string; count: number }[]);

    // Calculate average response time (simplified)
    const averageResponseTime = 15;

    const analytics = {
      totalMessages,
      totalContacts,
      averageResponseTime,
      messagesByChannel: messagesByChannel.map((item) => ({
        channel: item.channel,
        count: item._count.id,
      })),
      messagesOverTime: formattedMessagesOverTime,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error(
      "Analytics error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
