import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UsernameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (username: string) => void;
  platform: string;
  isLoading?: boolean;
}

export function UsernameDialog({
  isOpen,
  onClose,
  onConfirm,
  platform,
  isLoading = false,
}: UsernameDialogProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    // Basic validation based on platform
    const trimmedUsername = username.trim();
    
    if (platform.toLowerCase() === "twitter" && !trimmedUsername.startsWith("@")) {
      setError("Twitter username should start with @");
      return;
    }
    
    if (platform.toLowerCase() === "reddit" && trimmedUsername.startsWith("/u/")) {
      setError("Reddit username should not include /u/ prefix");
      return;
    }

    setError("");
    onConfirm(trimmedUsername);
  };

  const handleClose = () => {
    setUsername("");
    setError("");
    onClose();
  };

  const getPlaceholder = () => {
    switch (platform.toLowerCase()) {
      case "twitter":
        return "@username";
      case "reddit":
        return "username";
      case "g2":
        return "company-name";
      case "hackernews":
        return "username";
      case "producthunt":
        return "product-name";
      default:
        return "username";
    }
  };

  const getDescription = () => {
    switch (platform.toLowerCase()) {
      case "twitter":
        return "Enter the Twitter handle you want to monitor (e.g., @tesla)";
      case "reddit":
        return "Enter the Reddit username or subreddit to monitor";
      case "g2":
        return "Enter the company name as it appears on G2";
      case "hackernews":
        return "Enter the username to monitor on Hacker News";
      case "producthunt":
        return "Enter the product name as it appears on Product Hunt";
      default:
        return `Enter the username to monitor on ${platform}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Enable {platform} Monitoring</DialogTitle>
            <DialogDescription>
              {getDescription()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                {platform} Username
              </Label>
              <Input
                id="username"
                placeholder={getPlaceholder()}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError("");
                }}
                className={error ? "border-destructive focus:border-destructive" : ""}
                disabled={isLoading}
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !username.trim()}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Enabling...
                </>
              ) : (
                "Enable Monitoring"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}