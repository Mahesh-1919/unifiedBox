import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/db";
import { canEditContacts } from "@/lib/roles";

/**
 * GET /api/notes
 * Retrieves notes for a specific thread
 * @param {NextRequest} req - The request object with threadId query parameter
 * @returns {Promise<NextResponse>} List of notes or error
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
      return NextResponse.json(
        { error: "Thread ID required" },
        { status: 400 }
      );
    }

    const notes = await prisma.note.findMany({
      where: { threadId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });


    return NextResponse.json(notes);
  } catch (error) {
    console.error(
      "Get notes error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notes
 * Creates a new note for a thread
 * @param {NextRequest} req - The request object containing note data
 * @returns {Promise<NextResponse>} Created note or error
 */
export async function POST(req: NextRequest) {
  try {
    const session: any = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canEditContacts(session?.user?.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { threadId, content, isPrivate = false } = body;

    // Validation
    if (!threadId || typeof threadId !== "string") {
      return NextResponse.json(
        { error: "Valid thread   ID required" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Note content required" },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "Note content too long (max 2000 characters)" },
        { status: 400 }
      );
    }

    // Create note
    const note = await prisma.note.create({
      data: {
        threadId: threadId,
        authorId: session.user.id,
        body: content.trim(),
        isPrivate: Boolean(isPrivate),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error(
      "Create note error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
