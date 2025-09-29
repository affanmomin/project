import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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

  // Clear username and error when dialog opens or platform changes
  useEffect(() => {
    if (isOpen) {
      setUsername("");
      setError("");
    }
  }, [isOpen, platform]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError(
        platform.toLowerCase() === "website"
          ? "Website URL is required"
          : "Username is required"
      );
      return;
    }

    // Basic validation based on platform
    const trimmedUsername = username.trim();

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
      case "website":
        return "https://example.com";
      case "twitter":
        return "Username";
      case "reddit":
        return "Username";
      case "google playstore":
        return "App Name";
      case "google maps":
        return "Business Name";
      case "g2":
        return "Company Name";
      case "hackernews":
        return "Username";
      case "producthunt":
        return "Product Name";
      default:
        return "username";
    }
  };

  const getDescription = () => {
    switch (platform.toLowerCase()) {
      case "website":
        return "Enter the website URL you want to monitor (must include http:// or https://)";
      case "twitter":
        return "Enter the Twitter handle you want to monitor (e.g. tesla)";
      case "reddit":
        return "Enter the Reddit username or subreddit to monitor";
      case "g2":
        return "Enter the company name as it appears on G2";
      case "hackernews":
        return "Enter the business to monitor on Hacker News";
      case "producthunt":
        return "Enter the product name as it appears on Product Hunt";
      case "google playstore":
        return "Enter the app name as it appears on Google Play Store";
      case "google maps":
        return "Enter the business name as it appears on Google Maps";
      default:
        return `Enter the username to monitor on ${platform}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            Enable{" "}
            {platform &&
              platform[0].toUpperCase() + platform.slice(1).toLowerCase()}{" "}
            Monitoring
            <DialogDescription>{getDescription()}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                {platform.toLowerCase() === "website"
                  ? "Website URL"
                  : `${platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase()}`}
              </Label>
              <Input
                id="username"
                placeholder={getPlaceholder()}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError("");
                }}
                className={
                  error ? "border-destructive focus:border-destructive" : ""
                }
                disabled={isLoading}
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
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
