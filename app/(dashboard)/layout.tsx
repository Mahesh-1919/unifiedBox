"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 flex flex-col w-full ">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b bg-background">
          <SidebarTrigger data-testid="button-sidebar-toggle" />
          <div className="h-4 w-px bg-border" />
          <h1 className="text-lg font-semibold">Unified Inbox</h1>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}
