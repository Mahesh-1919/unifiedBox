import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MentionEditor } from "@/components/mention-editor";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, StickyNote } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Contact, Note } from "@/shared/schema";
import { RoleGuard } from "@/components/role-guard";
import { supabase } from "@/lib/supabase";

interface ContactCardProps {
  threadId: string;
  selectedContact: Contact | null;
}

export function ContactCard({ threadId, selectedContact }: ContactCardProps) {
  const { toast } = useToast();

  const queryClient = useQueryClient();
  const [noteContent, setNoteContent] = useState("");

  const { data: notes, isLoading: notesLoading } = useQuery<any>({
    queryKey: ["/api/notes", threadId],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/notes?threadId=${threadId}`
      );
      return await response.json();
    },
    retry: false,
  });

  // Subscribe to real-time notes updates
  useEffect(() => {
    const channel = supabase
      .channel("notes-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Note",
          filter: `threadId=eq.${threadId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["/api/notes", threadId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, queryClient]);

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/notes", {
        threadId,
        content: noteContent,
        isPrivate: false,
      });
      return response;
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/notes", threadId] });

      // Snapshot previous value
      const previousNotes = queryClient.getQueryData(["/api/notes", threadId]);

      // Optimistically update
      const optimisticNote = {
        id: `temp-${Date.now()}`,
        content: noteContent,
        body: noteContent,
        createdAt: new Date().toISOString(),
        isPrivate: false,
        author: { name: "You", email: "" },
      };

      queryClient.setQueryData(["/api/notes", threadId], (old: any) => {
        if (Array.isArray(old)) {
          return [optimisticNote, ...old];
        }
        if (old?.notes) {
          return { ...old, notes: [optimisticNote, ...old.notes] };
        }
        return [optimisticNote];
      });

      return { previousNotes };
    },
    onSuccess: () => {
      setNoteContent("");
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousNotes) {
        queryClient.setQueryData(
          ["/api/notes", threadId],
          context.previousNotes
        );
      }
      toast.error({
        title: "Failed to add note",
        description: error.message,
      });
    },
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex flex-col items-center mb-6">
          {/* <Avatar className="w-16 h-16 mb-4">
            <AvatarImage
              src={undefined}
              alt={selectedContact?.name || "Contact"}
            />
            <AvatarFallback className="text-lg">
              {getInitials(selectedContact?.name)}
            </AvatarFallback>
          </Avatar> */}
          <h3 className="text-lg font-semibold" data-testid="contact-name">
            {selectedContact?.name || "Unknown Contact"}
          </h3>
          <p className="text-sm text-muted-foreground">Contact Details</p>
        </div>

        <div className="space-y-3">
          {selectedContact?.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span data-testid="contact-phone">{selectedContact?.phone}</span>
            </div>
          )}
          {selectedContact?.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span data-testid="contact-email">{selectedContact?.email}</span>
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
          {notesLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={`loading-skeleton-${i}`}
                  className="bg-muted rounded-lg p-3"
                >
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          )}
          {!notesLoading &&
            ((notes?.notes && notes.notes.length > 0) ||
              (Array.isArray(notes) && notes.length > 0)) && (
              <div className="space-y-3">
                {(notes?.notes || notes)?.map(
                  (
                    note: Note & { author: { name: string; email: string } }
                  ) => (
                    <div
                      key={note.id}
                      className="bg-muted rounded-lg p-3"
                      data-testid={`note-${note.id}`}
                    >
                      <p className="text-sm mb-2">{note.body}</p>
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
                  )
                )}
              </div>
            )}
          {!notesLoading &&
            (!notes?.notes || notes.notes.length === 0) &&
            (!Array.isArray(notes) || notes.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No notes yet
              </p>
            )}
        </ScrollArea>

        <RoleGuard permission="canEdit">
          <div className="space-y-2">
            <MentionEditor
              value={noteContent}
              onChange={setNoteContent}
              placeholder="Add a note about this contact... (use @ to mention team members)"
              className="min-h-[80px] resize-none"
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
        </RoleGuard>
      </div>
    </div>
  );
}
