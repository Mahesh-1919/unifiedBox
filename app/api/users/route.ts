import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/db";

/**
 * GET /api/users
 * Retrieves all users for mentions and team collaboration
 * @param {NextRequest} req - The request object
 * @returns {Promise<NextResponse>} List of users or error
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: [{ name: "asc" }, { email: "asc" }],
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error(
      "Get users error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
