import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/db";
import { z } from "zod";

const contactParamsSchema = z.object({
  id: z.string().min(1, "Contact ID is required"),
});

/**
 * GET /api/contacts/[id]
 * Retrieves a specific contact by ID with threads and messages
 * @param {NextRequest} req - The request object
 * @param {Object} params - Route parameters containing contact ID
 * @returns {Promise<NextResponse>} Contact details or error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paramsData = await params;
    const result = contactParamsSchema.safeParse(paramsData);
    if (!result.success) {
      const error = result.error.errors[0];
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    const { id } = result.data;

    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        threads: {
          include: {
            messages: true,
          },
        },
      },
    });

    console.log("Fetched contact:", contact);

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Get contact error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
