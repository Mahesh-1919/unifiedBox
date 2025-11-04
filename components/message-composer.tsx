"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { canSendMessages, type UserRole } from "@/lib/roles";

interface MessageComposerProps {
  selectedContactId: string;
  number: string;
  threadId: string;
  onSent?: () => void;
}

export function MessageComposer({
  selectedContactId,
  number,
  threadId,
  onSent,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState<"SMS" | "WHATSAPP">("SMS");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const canSend = canSendMessages(user?.role as UserRole);

  const sendMutation = useMutation({
    mutationFn: async (scheduled?: boolean) => {
      await apiRequest("POST", "/api/messages", {
        threadId,
        to: number,
        channel,
        text: content,
        ...(scheduled && scheduledAt ? { scheduledAt } : {}),
      });
    },
    onSuccess: (data, variables) => {
      setContent("");
      setScheduledAt("");
      setIsScheduling(false);
      toast.success({
        title: variables ? "Message scheduled" : "Message sent",
        description: variables 
          ? `Your ${channel} message has been scheduled successfully.`
          : `Your ${channel} message has been sent successfully.`,
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/contacts", selectedContactId],
      });
      if (variables) {
        queryClient.invalidateQueries({
          queryKey: ["/api/scheduled-messages", threadId],
        });
      }
      onSent?.();
    },
    onError: (error: Error) => {
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
        title: "Failed to send message",
        description: error.message,
      });
    },
  });

  if (!canSend) {
    return (
      <div className="border-t p-4 bg-muted/50 text-center">
        <p className="text-sm text-muted-foreground">
          You don&apos;t have permission to send messages. Contact an admin to
          upgrade your role.
        </p>
      </div>
    );
  }

  const handleSend = (scheduled = false) => {
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    if (!textContent) return;
    if (scheduled && !scheduledAt) {
      toast.error({ title: "Please select a date and time" });
      return;
    }
    sendMutation.mutate(scheduled);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
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
          <RichTextEditor
            value={content}
            onChange={setContent}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className=""
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={channel}
            onValueChange={(value) => setChannel(value as "SMS" | "WHATSAPP")}
          >
            <SelectTrigger className="w-[130px]" data-testid="select-channel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SMS">SMS</SelectItem>
              <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Popover open={isScheduling} onOpenChange={setIsScheduling}>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  disabled={!content.replace(/<[^>]*>/g, '').trim() || sendMutation.isPending || !canSend}
                  data-testid="button-schedule"
                >
                  <Clock className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-time">Schedule for</Label>
                    <Input
                      id="schedule-time"
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      min={getMinDateTime()}
                    />
                  </div>
                  <Button
                    onClick={() => handleSend(true)}
                    disabled={!scheduledAt || sendMutation.isPending}
                    className="w-full"
                  >
                    Schedule Message
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              size="icon"
              onClick={() => handleSend(false)}
              disabled={!content.replace(/<[^>]*>/g, '').trim() || sendMutation.isPending || !canSend}
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
