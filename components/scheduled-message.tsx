import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ScheduledMessage {
  id: string;
  body: string;
  scheduledAt: string;
  channel: string;
}

interface ScheduledMessageProps {
  message: ScheduledMessage;
  onCancel?: (id: string) => void;
}

export function ScheduledMessage({ message, onCancel }: ScheduledMessageProps) {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
        <Clock className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 bg-accent border rounded-2xl p-3 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">
            Scheduled
          </Badge>
          <Badge variant="outline" className="text-xs">
            {message.channel}
          </Badge>
        </div>
        <p className="text-sm mb-2">{message.body}</p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.scheduledAt), { addSuffix: true })}
          </p>
          {onCancel && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onCancel(message.id)}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
