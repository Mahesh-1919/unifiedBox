import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChannelBadge } from "./channel-badge";
import type { MessageWithRelations } from "@/shared/schema";

interface MessageBubbleProps {
  message: MessageWithRelations;
  isOutbound: boolean;
}

export function MessageBubble({ message, isOutbound }: MessageBubbleProps) {
  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={`flex gap-3 ${isOutbound ? "flex-row-reverse" : "flex-row"}`}
      data-testid={`message-${message.id}`}
    >
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage
          src={isOutbound ? message.user?.profileImageUrl || undefined : undefined}
          alt={isOutbound ? message.user?.firstName || "User" : message.contact.name || "Contact"}
        />
        <AvatarFallback className="text-xs">
          {isOutbound
            ? getInitials(message.user?.firstName)
            : getInitials(message.contact.name)}
        </AvatarFallback>
      </Avatar>

      <div className={`flex flex-col max-w-md ${isOutbound ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isOutbound
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          {message.mediaUrl && (
            <div className="mt-2">
              <img
                src={message.mediaUrl}
                alt="Attachment"
                className="rounded-lg max-w-full h-auto"
                data-testid="message-media"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 px-1">
          <ChannelBadge channel={message.channel} className="text-xs" />
          <span className="text-xs text-muted-foreground" data-testid="message-timestamp">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
          {message.status && (
            <span className="text-xs text-muted-foreground">· {message.status}</span>
          )}
        </div>
      </div>
    </div>
  );
}
