"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, Key, Shield, Info } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || !mounted) {
    return (
      <div className="h-full flex flex-col overflow-auto">
        <div className="border-b px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and integration settings
          </p>
        </div>
        <div className="flex-1 px-6 lg:px-8 py-6">
          <div className="max-w-4xl space-y-6">
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-auto">
      <div className="border-b px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and integration settings
        </p>
      </div>

      <div className="flex-1 px-6 lg:px-8 py-6">
        <div className="max-w-4xl space-y-6">
          {/* User Profile */}
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>
                Your account information and role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name"
                    value={mounted ? (user?.firstName || "") : ""}
                    disabled
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    value={mounted ? (user?.lastName || "") : ""}
                    disabled
                    data-testid="input-last-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={mounted ? (user?.email || "") : ""}
                  disabled
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="role"
                    value={mounted ? (user?.role || "VIEWER") : "VIEWER"}
                    disabled
                    className="flex-1"
                    data-testid="input-role"
                  />
                  <Badge variant="outline" className="capitalize">
                    {mounted ? (user?.role?.toLowerCase() || "viewer") : "viewer"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Contact an admin to change your role
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Twilio Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Twilio Integration
              </CardTitle>
              <CardDescription>
                Configure SMS and WhatsApp messaging settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 border border-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Twilio Configuration</p>
                    <p className="text-sm text-muted-foreground">
                      Twilio credentials are configured via environment
                      variables for security. Contact your system administrator
                      to update these settings.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="twilio-sid">Account SID</Label>
                <Input
                  id="twilio-sid"
                  type="password"
                  value="••••••••••••••••••••••••••••"
                  disabled
                  data-testid="input-twilio-sid"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twilio-auth">Auth Token</Label>
                <Input
                  id="twilio-auth"
                  type="password"
                  value="••••••••••••••••••••••••••••"
                  disabled
                  data-testid="input-twilio-auth"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twilio-phone">Phone Number</Label>
                <Input
                  id="twilio-phone"
                  value="Not configured"
                  disabled
                  data-testid="input-twilio-phone"
                />
                <p className="text-xs text-muted-foreground">
                  Your Twilio phone number in E.164 format
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Roles & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Roles & Permissions
              </CardTitle>
              <CardDescription>
                Understanding user roles in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">
                    VIEWER
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">Viewer</p>
                    <p className="text-sm text-muted-foreground">
                      Can view messages and contacts, but cannot send messages
                      or make changes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">
                    EDITOR
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">Editor</p>
                    <p className="text-sm text-muted-foreground">
                      Can send messages, create contacts, and add notes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">
                    ADMIN
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">Admin</p>
                    <p className="text-sm text-muted-foreground">
                      Full access to all features including user management and
                      settings
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage API keys for third-party integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 border border-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Coming Soon</p>
                    <p className="text-sm text-muted-foreground">
                      API key management for integrations will be available in a
                      future update.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
