import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Paperclip } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface MessageComposerProps {
  contactId: string;
  onSent?: () => void;
}

export function MessageComposer({ contactId, onSent }: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState<"SMS" | "WHATSAPP">("SMS");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/messages/send", {
        contactId,
        content,
        channel,
      });
    },
    onSuccess: () => {
      setContent("");
      toast.success({
        title: "Message sent",
        description: `Your ${channel} message has been sent successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages", contactId] });
      onSent?.();
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
        title: "Failed to send message",
        description: error.message,
      });
    },
  });

  const handleSend = () => {
    if (!content.trim()) return;
    sendMutation.mutate();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-4 bg-background">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[60px] max-h-[200px] resize-none"
            data-testid="input-message"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Select value={channel} onValueChange={(value) => setChannel(value as "SMS" | "WHATSAPP")}>
            <SelectTrigger className="w-[130px]" data-testid="select-channel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SMS">SMS</SelectItem>
              <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              disabled
              data-testid="button-attach"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!content.trim() || sendMutation.isPending}
              data-testid="button-send"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
