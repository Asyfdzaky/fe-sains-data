"use client";
import { useAuth } from "@/contexts/auth-context";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { Home, LogIn, UserPlus, LayoutDashboard, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Don't show navbar on dashboard pages (they have sidebar)
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  // Define tabs based on auth state
  const tabs = user
    ? [
        { title: "Home", icon: Home },
        { title: "Dashboard", icon: LayoutDashboard },
        { type: "separator" as const },
        { title: "Logout", icon: LogOut },
      ]
    : [
        { title: "Home", icon: Home },
        { type: "separator" as const },
        { title: "Login", icon: LogIn },
        { title: "Sign Up", icon: UserPlus },
      ];

  const handleTabChange = (index: number | null) => {
    if (index === null) return;

    if (user) {
      // Authenticated user tabs
      switch (index) {
        case 0: // Home
          router.push("/");
          break;
        case 1: // Dashboard
          router.push("/dashboard");
          break;
        case 3: // Logout (index 2 is separator)
          logout();
          break;
      }
    } else {
      // Non-authenticated user tabs
      switch (index) {
        case 0: // Home
          router.push("/");
          break;
        case 2: // Login (index 1 is separator)
          router.push("/login");
          break;
        case 3: // Sign Up
          router.push("/register");
          break;
      }
    }
  };

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-fit">
      <ExpandableTabs tabs={tabs} onChange={handleTabChange} />
    </nav>
  );
}
