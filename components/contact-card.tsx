import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, User, StickyNote } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Contact, Note } from "@/shared/schema";

interface ContactCardProps {
  contactId: string;
}

export function ContactCard({ contactId }: ContactCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [noteContent, setNoteContent] = useState("");

  const { data: contact, isLoading: contactLoading } = useQuery<Contact>({
    queryKey: ["/api/contacts", contactId],
    retry: false,
  });

  const { data: notes, isLoading: notesLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes", contactId],
    retry: false,
  });

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notes", {
        contactId,
        content: noteContent,
        isPrivate: false,
      });
    },
    onSuccess: () => {
      setNoteContent("");
      toast.success({
        title: "Note added",
        description: "Your note has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notes", contactId] });
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
        title: "Failed to add note",
        description: error.message,
      });
    },
  });

  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name.substring(0, 2).toUpperCase();
  };

  if (contactLoading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center mb-6">
          <Skeleton className="w-16 h-16 rounded-full mb-4" />
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Contact not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="w-16 h-16 mb-4">
            <AvatarImage src={undefined} alt={contact.name || "Contact"} />
            <AvatarFallback className="text-lg">
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold" data-testid="contact-name">
            {contact.name || "Unknown Contact"}
          </h3>
          <p className="text-sm text-muted-foreground">Contact Details</p>
        </div>

        <div className="space-y-3">
          {contact.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span data-testid="contact-phone">{contact.phone}</span>
            </div>
          )}
          {contact.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span data-testid="contact-email">{contact.email}</span>
            </div>
          )}
          {contact.socialHandle && (
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span data-testid="contact-social">{contact.socialHandle}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center gap-2 mb-4">
          <StickyNote className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-semibold text-sm">Team Notes</h4>
        </div>

        <ScrollArea className="flex-1 -mx-2 px-2 mb-4">
          {notesLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-muted rounded-lg p-3">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          ) : notes && notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-muted rounded-lg p-3"
                  data-testid={`note-${note.id}`}
                >
                  <p className="text-sm mb-2">{note.content}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(note.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                    {note.isPrivate && (
                      <Badge variant="outline" className="text-xs">
                        Private
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No notes yet
            </p>
          )}
        </ScrollArea>

        <div className="space-y-2">
          <Textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Add a note about this contact..."
            className="min-h-[80px] resize-none"
            data-testid="input-note"
          />
          <Button
            onClick={() => addNoteMutation.mutate()}
            disabled={!noteContent.trim() || addNoteMutation.isPending}
            className="w-full"
            data-testid="button-add-note"
          >
            Add Note
          </Button>
        </div>
      </div>
    </div>
  );
}
