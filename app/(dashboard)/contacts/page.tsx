"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ContactWithStats } from "@/shared/schema";
import { RoleGuard } from "@/components/role-guard";
import { contactSchema } from "@/lib/validations";

export default function Contacts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Validates the contact form using Zod schema
   * @returns {boolean} True if validation passes, otherwise false
   */
  const validateForm = () => {
    const result = contactSchema.safeParse(newContact);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        const path = error.path[0] as string;
        newErrors[path] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: contacts, isLoading } = useQuery<ContactWithStats[]>({
    queryKey: ["/api/contacts"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!validateForm()) {
        throw new Error("Validation failed");
      }
      await apiRequest("POST", "/api/contacts", newContact);
    },
    onSuccess: () => {
      setIsDialogOpen(false);
      setNewContact({ name: "", phone: "", email: "" });
      setErrors({});
      toast.success({
        title: "Contact created",
        description: "New contact has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
    onError: (error: Error) => {
      if (error.message === "Validation failed") {
        return; // Validation errors already shown in form
      }

      if (isUnauthorizedError(error)) {
        toast.error({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }

      toast.error({
        title: "Error",
        description: error.message || "Failed to create contact.",
      });
    },
  });

  const filteredContacts = contacts?.filter((contact) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(searchLower) ||
      contact.phone?.includes(searchQuery) ||
      contact.email?.toLowerCase().includes(searchLower)
    );
  });

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
            <p className="text-muted-foreground mt-1">
              Manage your customer contacts and communication history
            </p>
          </div>
          <RoleGuard permission="canEdit">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-contact">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-add-contact">
                <DialogHeader>
                  <DialogTitle>Add New Contact</DialogTitle>
                  <DialogDescription>
                    Create a new contact to start managing conversations
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={newContact.name}
                      onChange={(e) => {
                        setNewContact({ ...newContact, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: "" });
                      }}
                      placeholder="John Doe"
                      className={errors.name ? "border-red-500" : ""}
                      data-testid="input-contact-name"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newContact.phone}
                      onChange={(e) => {
                        setNewContact({ ...newContact, phone: e.target.value });
                        if (errors.phone || errors.contact) {
                          setErrors({ ...errors, phone: "", contact: "" });
                        }
                      }}
                      placeholder="+1234567890"
                      className={errors.phone ? "border-red-500" : ""}
                      data-testid="input-contact-phone"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newContact.email}
                      onChange={(e) => {
                        setNewContact({ ...newContact, email: e.target.value });
                        if (errors.email || errors.contact) {
                          setErrors({ ...errors, email: "", contact: "" });
                        }
                      }}
                      placeholder="john@example.com"
                      className={errors.email ? "border-red-500" : ""}
                      data-testid="input-contact-email"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                  {errors.contact && (
                    <p className="text-sm text-red-500">{errors.contact}</p>
                  )}

                  <Button
                    onClick={() => createMutation.mutate()}
                    disabled={createMutation.isPending}
                    className="w-full"
                    data-testid="button-save-contact"
                  >
                    {createMutation.isPending
                      ? "Creating..."
                      : "Create Contact"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </RoleGuard>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 lg:px-8 py-6">
        {(() => {
          if (isLoading) {
            return (
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 h-14">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            );
          }

          if (filteredContacts && filteredContacts.length > 0) {
            return (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead>Last Contact</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow
                        key={contact.id}
                        data-testid={`row-contact-${contact.id}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9">
                              <AvatarImage
                                src={undefined}
                                alt={contact.name || "Contact"}
                              />
                              <AvatarFallback className="text-xs">
                                {getInitials(contact.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {contact.name || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {contact.phone || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {contact.email || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {contact.messageCount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {contact.lastMessageAt
                              ? formatDistanceToNow(
                                  new Date(contact.lastMessageAt),
                                  { addSuffix: true }
                                )
                              : "Never"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            data-testid={`button-view-messages-${contact.id}`}
                          >
                            <Link href="/inbox">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          }

          return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <p className="text-muted-foreground mb-2">No contacts found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {(() => {
                  if (searchQuery) {
                    return "Try a different search term";
                  }
                  return "Create your first contact to get started";
                })()}
              </p>
              {!searchQuery && (
                <RoleGuard permission="canEdit">
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    data-testid="button-create-first"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </RoleGuard>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
