import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mail, Twitter, Facebook, Phone } from "lucide-react";

type Channel = "SMS" | "WHATSAPP" | "EMAIL" | "TWITTER" | "FACEBOOK" | "OTHER";

interface ChannelBadgeProps {
  channel: Channel;
  className?: string;
}

const channelConfig = {
  SMS: {
    icon: MessageSquare,
    label: "SMS",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  WHATSAPP: {
    icon: Phone,
    label: "WhatsApp",
    className: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  },
  EMAIL: {
    icon: Mail,
    label: "Email",
    className: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  },
  TWITTER: {
    icon: Twitter,
    label: "Twitter",
    className: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  },
  FACEBOOK: {
    icon: Facebook,
    label: "Facebook",
    className: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  },
  OTHER: {
    icon: Facebook,
    label: "Facebook",
    className: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  },
};

export function ChannelBadge({ channel, className }: ChannelBadgeProps) {
  const config = channelConfig[channel];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${className || ""}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
}
