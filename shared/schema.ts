import { z } from "zod";
import type {
  User,
  Contact,
  Message,
  Note,
  Role,
  Channel,
  Direction,
} from "@prisma/client";

// Zod schemas for validation
export const insertUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional(),
  role: z.enum(["VIEWER", "EDITOR", "ADMIN"]).default("VIEWER"),
});

export const selectUserSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  profileImageUrl: z.string().nullable(),
  role: z.enum(["VIEWER", "EDITOR", "ADMIN"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertContactSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  socialHandle: z.string().optional(),
});

export const selectContactSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  socialHandle: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertMessageSchema = z.object({
  content: z.string(),
  mediaUrl: z.string().optional(),
  channel: z.enum(["SMS", "WHATSAPP", "EMAIL", "TWITTER", "FACEBOOK"]),
  direction: z.enum(["INBOUND", "OUTBOUND"]),
  status: z.string().default("sent"),
  contactId: z.string(),
  userId: z.string().optional(),
  twilioSid: z.string().optional(),
});

export const selectMessageSchema = z.object({
  id: z.string(),
  content: z.string(),
  mediaUrl: z.string().nullable(),
  channel: z.enum(["SMS", "WHATSAPP", "EMAIL", "TWITTER", "FACEBOOK"]),
  direction: z.enum(["INBOUND", "OUTBOUND"]),
  status: z.string(),
  contactId: z.string(),
  userId: z.string().nullable(),
  twilioSid: z.string().nullable(),
  createdAt: z.date(),
});

export const insertNoteSchema = z.object({
  content: z.string(),
  isPrivate: z.boolean().default(false),
  contactId: z.string(),
  userId: z.string(),
});

export const selectNoteSchema = z.object({
  id: z.string(),
  content: z.string(),
  isPrivate: z.boolean(),
  contactId: z.string(),
  userId: z.string(),
  createdAt: z.date(),
});

// Base types from Prisma
export type { User, Contact, Message, Note, Role, Channel, Direction };

// Input types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertNote = z.infer<typeof insertNoteSchema>;

// Extended types for API responses
export type MessageWithRelations = Message & {
  contact: Contact;
  user: User | null;
};

export type ContactWithStats = Contact & {
  messageCount: number;
  lastMessageAt: Date | null;
  unreadCount: number;
};

export type AnalyticsData = {
  totalMessages: number;
  totalContacts: number;
  averageResponseTime: number;
  messagesByChannel: {
    channel: string;
    count: number;
  }[];
  messagesOverTime: {
    date: string;
    count: number;
  }[];
};
