"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { MessageSquare, Users, Clock, TrendingUp } from "lucide-react";

export default function Analytics() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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

  const { data: analytics, isLoading } = useQuery<any>({
    queryKey: ["/api/analytics"],
  });

  const CHANNEL_COLORS = {
    SMS: "#3b82f6",
    WHATSAPP: "#10b981",
    EMAIL: "#f59e0b",
    TWITTER: "#8b5cf6",
    FACEBOOK: "#ef4444",
  };

  return (
    <div className="h-full flex flex-col overflow-auto">
      <div className="border-b px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track engagement metrics and communication performance
        </p>
      </div>

      <div className="flex-1 px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Messages
              </CardTitle>
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </>
              ) : (
                <>
                  <div
                    className="text-2xl font-bold"
                    data-testid="stat-total-messages"
                  >
                    {analytics?.totalMessages.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all channels
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Contacts
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </>
              ) : (
                <>
                  <div
                    className="text-2xl font-bold"
                    data-testid="stat-total-contacts"
                  >
                    {analytics?.totalContacts.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active conversations
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Response Time
              </CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </>
              ) : (
                <>
                  <div
                    className="text-2xl font-bold"
                    data-testid="stat-response-time"
                  >
                    {analytics?.averageResponseTime
                      ? `${Math.round(analytics.averageResponseTime)}m`
                      : "—"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Time to first reply
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </>
              ) : (
                <>
                  <div
                    className="text-2xl font-bold"
                    data-testid="stat-engagement"
                  >
                    {analytics?.totalMessages && analytics?.totalContacts
                      ? (
                          analytics.totalMessages / analytics.totalContacts
                        ).toFixed(1)
                      : "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Messages per contact
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Messages by Channel</CardTitle>
              <CardDescription>
                Distribution of messages across communication channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && <Skeleton className="h-64 w-full" />}
              {!isLoading &&
                analytics?.messagesByChannel &&
                analytics.messagesByChannel.length > 0 && (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={analytics.messagesByChannel}
                        dataKey="count"
                        nameKey="channel"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry) => `${entry.channel}: ${entry.count}`}
                      >
                        {analytics.messagesByChannel.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              CHANNEL_COLORS[
                                entry.channel as keyof typeof CHANNEL_COLORS
                              ] || "#3b82f6"
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              {!isLoading &&
                (!analytics?.messagesByChannel ||
                  analytics.messagesByChannel.length === 0) && (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No channel data available
                  </div>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Messages Over Time</CardTitle>
              <CardDescription>Daily message volume trends</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && <Skeleton className="h-64 w-full" />}
              {!isLoading &&
                analytics?.messagesOverTime &&
                analytics.messagesOverTime.length > 0 && (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics.messagesOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          color: "black",
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              {!isLoading &&
                (!analytics?.messagesOverTime ||
                  analytics.messagesOverTime.length === 0) && (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No time series data available
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
