import { z } from "zod";

// Contact validation
export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  phone: z.string().optional().refine((val) => {
    if (!val || val.trim() === "") return true;
    const phoneRegex = /^[+]?[1-9]\d{1,14}$/;
    return phoneRegex.test(val.replace(/[\s-()]/g, ""));
  }, "Invalid phone number format"),
  email: z.string().optional().refine((val) => {
    if (!val || val.trim() === "") return true;
    return z.string().email().safeParse(val).success;
  }, "Invalid email format"),
}).refine((data) => {
  return (data.phone && data.phone.trim()) || (data.email && data.email.trim());
}, {
  message: "Phone or email is required",
  path: ["contact"],
});

// Message validation
export const messageSchema = z.object({
  content: z.string().min(1, "Message content is required").max(1600, "Message too long"),
  to: z.string().min(1, "Recipient is required"),
  threadId: z.string().optional(),
  scheduledFor: z.date().optional(),
});

// Note validation
export const noteSchema = z.object({
  content: z.string().min(1, "Note content is required").max(1000, "Note too long"),
  threadId: z.string().min(1, "Thread ID is required"),
});

// User validation
export const userUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").trim(),
  lastName: z.string().min(1, "Last name is required").trim(),
  email: z.string().email("Invalid email format"),
});

// Auth validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required").trim(),
  lastName: z.string().min(1, "Last name is required").trim(),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// API validation helpers
export type ContactInput = z.infer<typeof contactSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;