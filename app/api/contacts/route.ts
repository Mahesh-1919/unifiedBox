import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/prisma/db";
import { hasPermission } from "@/lib/roles";

/**
 * GET /api/contacts
 * Retrieves all contacts with their message statistics
 * @param {NextRequest} req - The request object
 * @returns {Promise<NextResponse>} List of contacts with stats
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        threads: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      take: 100, // Limit results
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Get contacts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contacts
 * Creates a new contact with validation
 * @param {NextRequest} req - The request object containing contact data
 * @returns {Promise<NextResponse>} Created contact or error
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    const userRole = session.user.role as import("@/lib/roles").UserRole;
    if (!hasPermission(userRole, "canEdit")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, phone, email } = body;

    // Validation
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!phone?.trim() && !email?.trim()) {
      return NextResponse.json(
        { error: "Phone and email are required" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData: any = {
      name: name.trim().substring(0, 100),
    };

    if (phone) {
      const sanitizedPhone = phone.replace(/[^+\d]/g, "");
      if (sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
        return NextResponse.json(
          { error: "Invalid phone number" },
          { status: 400 }
        );
      }
      sanitizedData.phone = sanitizedPhone;
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
      sanitizedData.email = email.toLowerCase().trim();
    }

    // Check for duplicates
    const existing = await prisma.contact.findFirst({
      where: {
        OR: [
          ...(sanitizedData.phone ? [{ phone: sanitizedData.phone }] : []),
          ...(sanitizedData.email ? [{ email: sanitizedData.email }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Contact already exists" },
        { status: 409 }
      );
    }

    const contact = await prisma.contact.create({
      data: sanitizedData,
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Create contact error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
