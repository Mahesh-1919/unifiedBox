import {
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth-client";
import { usePathname } from "next/navigation";
import { type UserRole } from "@/lib/roles";
import { useEffect, useState } from "react";
import Link from "next/link";

const menuItems = [
  {
    title: "Inbox",
    url: "/inbox",
    icon: MessageSquare,
    testId: "nav-inbox",
    roles: ["VIEWER", "EDITOR", "ADMIN"] as UserRole[],
  },
  {
    title: "Contacts",
    url: "/contacts",
    icon: Users,
    testId: "nav-contacts",
    roles: ["VIEWER", "EDITOR", "ADMIN"] as UserRole[],
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    testId: "nav-analytics",
    roles: ["EDITOR", "ADMIN"] as UserRole[],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    testId: "nav-settings",
    roles: ["ADMIN"] as UserRole[],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to avoid synchronous setState warning
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const getInitials = () => {
    if (!mounted) return "U";
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    if (!mounted) return "User";
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.email) {
      return user.email;
    }
    return "User";
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              <span className="text-lg font-semibold">Unified Inbox</span>
            </div>
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter(
                  (item) =>
                    !mounted || item.roles.includes(user?.role as UserRole)
                )
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      data-testid={item.testId}
                    >
                      <Link href={item.url}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-4 py-3">
              <Avatar className="w-9 h-9">
                <AvatarImage
                  src={user?.profileImageUrl || undefined}
                  alt={getDisplayName()}
                />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  data-testid="text-user-name"
                >
                  {getDisplayName()}
                </p>
                <p
                  className="text-xs text-muted-foreground truncate"
                  data-testid="text-user-role"
                >
                  {mounted ? user?.role || "Viewer" : "Viewer"}
                </p>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut()}
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
