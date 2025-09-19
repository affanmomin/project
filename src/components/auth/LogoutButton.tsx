import { useState } from "react";
import { authService } from "../../services/auth.service";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function LogoutButton({ variant = "outline", size = "default", className }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
    } catch (error: unknown) {
      console.error("Logout error:", error instanceof Error ? error.message : "Unknown error");
      // Even if signout fails on the server, we should still redirect
      // to ensure the user experience is not broken
    } finally {
      setIsLoading(false);
      // Always redirect to login, regardless of server response
      // This ensures user is logged out from the frontend perspective
      window.location.href = "/login";
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
    >
      <LogOut className="w-4 h-4 mr-2" />
      {isLoading ? "Signing out..." : "Sign Out"}
    </Button>
  );
}