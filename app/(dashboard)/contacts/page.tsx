import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
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
import { ChannelBadge } from "@/components/channel-badge";

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
    socialHandle: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: contacts, isLoading } = useQuery<ContactWithStats[]>({
    queryKey: ["/api/contacts/with-stats"],
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/contacts", newContact);
    },
    onSuccess: () => {
      setIsDialogOpen(false);
      setNewContact({ name: "", phone: "", email: "", socialHandle: "" });
      toast.success({
        title: "Contact created",
        description: "New contact has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts/with-stats"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast.error({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast.error({
        title: "Failed to create contact",
        description: error.message,
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

  if (authLoading) {
    return null;
  }

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
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newContact.name}
                    onChange={(e) =>
                      setNewContact({ ...newContact, name: e.target.value })
                    }
                    placeholder="John Doe"
                    data-testid="input-contact-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) =>
                      setNewContact({ ...newContact, phone: e.target.value })
                    }
                    placeholder="+1234567890"
                    data-testid="input-contact-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) =>
                      setNewContact({ ...newContact, email: e.target.value })
                    }
                    placeholder="john@example.com"
                    data-testid="input-contact-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social">Social Handle</Label>
                  <Input
                    id="social"
                    value={newContact.socialHandle}
                    onChange={(e) =>
                      setNewContact({
                        ...newContact,
                        socialHandle: e.target.value,
                      })
                    }
                    placeholder="@johndoe"
                    data-testid="input-contact-social"
                  />
                </div>
                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || !newContact.name}
                  className="w-full"
                  data-testid="button-save-contact"
                >
                  Create Contact
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
        {isLoading ? (
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
        ) : filteredContacts && filteredContacts.length > 0 ? (
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
                      <span className="text-sm">{contact.email || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{contact.messageCount}</span>
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
                        <a href="/inbox">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          View
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <p className="text-muted-foreground mb-2">No contacts found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? "Try a different search term"
                : "Create your first contact to get started"}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setIsDialogOpen(true)}
                data-testid="button-create-first"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
