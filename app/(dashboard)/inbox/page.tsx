"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MessageBubble } from "@/components/message-bubble";
import { MessageComposer } from "@/components/message-composer";
import { ContactCard } from "@/components/contact-card";
import { ScheduledMessage } from "@/components/scheduled-message";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

export default function Inbox() {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [filterBy, setFilterBy] = useState("all");
  const [mounted, setMounted] = useState(false);
  const [recentThreshold] = useState(() => Date.now() - 24 * 60 * 60 * 1000);

  useEffect(() => {
    // Use requestAnimationFrame to avoid synchronous setState warning
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const { data: contacts, isLoading: contactsLoading } = useQuery<any>({
    queryKey: ["/api/contacts"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<any>({
    queryKey: ["/api/contacts", selectedContactId],
    enabled: !!selectedContactId,
  });

  const threadId = messages?.threads?.[0]?.id;

  const { data: scheduledMessages, isLoading: scheduledLoading } = useQuery<
    any[]
  >({
    queryKey: ["/api/scheduled-messages", threadId],
    queryFn: async () => {
      if (!threadId) return [];
      const response = await apiRequest(
        "GET",
        `/api/scheduled-messages?threadId=${threadId}`
      );
      const data = await response.json();
      return data;
    },
    enabled: !!threadId,
  });

  const selectedContact = useMemo(
    () => contacts?.find((c) => c.id === selectedContactId),
    [contacts, selectedContactId]
  );

  const filteredContacts = useMemo(() => {
    if (!contacts) return [];

    return contacts.filter((contact) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        contact.name?.toLowerCase().includes(searchLower) ||
        contact.phone?.includes(searchQuery) ||
        contact.email?.toLowerCase().includes(searchLower);

      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "unread" && contact.unreadCount > 0) ||
        (filterBy === "recent" &&
          contact.lastMessageAt &&
          mounted &&
          new Date(contact.lastMessageAt) > new Date(recentThreshold)) ||
        (filterBy === "sms" && contact.phone) ||
        (filterBy === "whatsapp" && contact.phone);

      return matchesSearch && matchesFilter;
    });
  }, [contacts, searchQuery, filterBy, mounted, recentThreshold]);

  const getContactInitials = useCallback((name?: string | null) => {
    if (!name) return "?";
    return name.substring(0, 2).toUpperCase();
  }, []);

  return (
    <div className="h-full flex">
      {/* Contact List */}
      <div className="w-80 border-r flex flex-col bg-background">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-contacts"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                data-testid="button-clear-search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="mt-3">
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter contacts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contacts</SelectItem>
                <SelectItem value="unread">Unread Messages</SelectItem>
                <SelectItem value="recent">Recent (24h)</SelectItem>
                <SelectItem value="sms">SMS Contacts</SelectItem>
                <SelectItem value="whatsapp">WhatsApp Contacts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {contactsLoading && (
            <div className="p-4 space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!contactsLoading &&
            filteredContacts &&
            filteredContacts.length > 0 && (
              <div className="p-2">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => {
                      setSelectedContactId(contact.id);
                      setShowContactDetails(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg hover-elevate active-elevate-2 text-left ${
                      selectedContactId === contact.id ? "bg-muted" : ""
                    }`}
                    data-testid={`contact-item-${contact.id}`}
                  >
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage
                        src={undefined}
                        alt={contact.name || "Contact"}
                      />
                      <AvatarFallback>
                        {getContactInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate text-sm">
                          {contact.name ||
                            contact.phone ||
                            contact.email ||
                            "Unknown"}
                        </p>
                        {contact.unreadCount > 0 && (
                          <Badge
                            variant="default"
                            className="ml-2 h-5 min-w-5 px-1.5 text-xs"
                          >
                            {contact.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground truncate">
                          {contact.messageCount} message
                          {contact.messageCount !== 1 ? "s" : ""}
                        </p>
                        {contact.lastMessageAt && (
                          <p className="text-xs text-muted-foreground">
                            {mounted
                              ? formatDistanceToNow(
                                  new Date(contact.lastMessageAt),
                                  { addSuffix: true }
                                )
                              : "Loading..."}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          {!contactsLoading &&
            (!filteredContacts || filteredContacts.length === 0) && (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <p className="text-muted-foreground mb-2">No contacts found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try a different search term"
                    : "Contacts will appear here"}
                </p>
              </div>
            )}
        </ScrollArea>
      </div>

      {/* Message Thread */}
      <div className="flex-1 flex flex-col ">
        {selectedContact ? (
          <>
            <div className="h-16 border-b px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9">
                  <AvatarImage
                    src={undefined}
                    alt={selectedContact.name || "Contact"}
                  />
                  <AvatarFallback>
                    {getContactInitials(selectedContact.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold" data-testid="text-contact-name">
                    {selectedContact.name ||
                      selectedContact.phone ||
                      selectedContact.email ||
                      "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedContact.phone && `${selectedContact.phone} • `}
                    {selectedContact.messageCount} messages
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowContactDetails(!showContactDetails)}
                data-testid="button-toggle-details"
              >
                {showContactDetails ? "Hide Details" : "Show Details"}
              </Button>
            </div>

            <ScrollArea className="flex-1 p-6">
              {messagesLoading && (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 ${
                        i % 2 === 0 ? "" : "flex-row-reverse"
                      }`}
                    >
                      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div
                        className={`flex flex-col ${
                          i % 2 === 0 ? "items-start" : "items-end"
                        }`}
                      >
                        <Skeleton className="h-20 w-64 rounded-2xl" />
                        <Skeleton className="h-3 w-32 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!messagesLoading && messages && (
                <div className="space-y-4">
                  {!scheduledLoading && scheduledMessages && (
                    <div className="space-y-2">
                      {scheduledMessages?.map((scheduledMsg) => (
                        <ScheduledMessage
                          key={scheduledMsg.id}
                          message={scheduledMsg}
                        />
                      ))}
                    </div>
                  )}
                  {messages.threads[0]?.messages?.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOutbound={message.direction === "OUTBOUND"}
                    />
                  ))}
                </div>
              )}
              {!messagesLoading && !messages && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-muted-foreground mb-2">No messages yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start a conversation below
                  </p>
                </div>
              )}
            </ScrollArea>

            <MessageComposer
              number={selectedContact.phone || ""}
              threadId={messages?.threads[0]?.id}
              selectedContactId={selectedContact.id}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <p className="text-muted-foreground mb-2">
              Select a contact to view messages
            </p>
            <p className="text-sm text-muted-foreground">
              Choose a contact from the list to start messaging
            </p>
          </div>
        )}
      </div>

      {/* Contact Details Panel */}
      {showContactDetails && selectedContact && (
        <div className="w-96 border-l bg-background">
          <ContactCard
            threadId={selectedContact?.threads[0]?.id || null}
            selectedContact={selectedContact}
          />
        </div>
      )}
    </div>
  );
}
