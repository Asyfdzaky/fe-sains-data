"use client";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronUp,
  User2,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Upload Data",
    icon: Upload,
    href: "/dashboard/upload",
  },
  {
    title: "RFM Analysis",
    icon: BarChart3,
    href: "/dashboard/analysis",
  },
  {
    title: "Customer Segments",
    icon: Users,
    href: "/dashboard/segments",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full bg-background">
        {/* Floating Sidebar Container */}
        <div className="fixed inset-y-4 left-4 z-50 hidden md:flex flex-col">
          <Sidebar
            collapsible="icon"
            className="h-full rounded-2xl border border-border/50 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          >
            <SidebarHeader className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div className="flex flex-col overflow-hidden transition-all group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
                  <span className="font-bold truncate text-foreground">
                    RFM Analysis
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    Dashboard
                  </span>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="px-2">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          className="h-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Link
                            href={item.href}
                            className="flex items-center gap-3"
                          >
                            <item.icon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-3 mt-auto">
              <SidebarMenu>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton className="h-12 w-full justify-start gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <User2 className="h-5 w-5" />
                        <div className="flex flex-col items-start transition-all group-data-[collapsible=icon]:hidden">
                          <span className="text-sm font-semibold truncate max-w-[120px]">
                            {user.username}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                            {user.email}
                          </span>
                        </div>
                        <ChevronUp className="ml-auto h-4 w-4 opacity-50 transition-all group-data-[collapsible=icon]:hidden" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="right"
                      align="end"
                      className="w-56 rounded-xl shadow-lg border-border/50"
                    >
                      <DropdownMenuItem
                        onClick={logout}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-lg px-3 py-2"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
        </div>

        {/* Mobile Header & Trigger */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background/80 backdrop-blur border-b">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="font-bold">RFM Analysis</span>
          </div>
          <SidebarTrigger />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 w-full md:pl-[280px] pt-16 md:pt-4 p-4 md:p-6 transition-all duration-300 ease-in-out">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
