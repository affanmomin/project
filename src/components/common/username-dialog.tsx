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

    // Strict website URL validation
    if (platform.toLowerCase() === "website") {
      // Check if URL starts with protocol
      if (!trimmedUsername.startsWith('http://') && !trimmedUsername.startsWith('https://')) {
        setError("Website URL must start with http:// or https://");
        return;
      }

      try {
        const url = new URL(trimmedUsername);
        
        // Validate protocol
        if (!['http:', 'https:'].includes(url.protocol)) {
          setError("Website URL must use http:// or https:// protocol");
          return;
        }
        
        // Validate hostname exists
        if (!url.hostname) {
          setError("Website URL must include a valid hostname");
          return;
        }
        
        // Special case for localhost (development)
        if (url.hostname === 'localhost') {
          // Allow localhost with optional port
          if (url.port && !/^\d{1,5}$/.test(url.port)) {
            setError("Invalid port number in localhost URL");
            return;
          }
        } else {
          // For non-localhost URLs, enforce strict domain validation
          const hostname = url.hostname;
          
          // Check for valid domain format
          if (!hostname.includes('.')) {
            setError("Website URL must include a valid domain with extension (e.g., .com, .org)");
            return;
          }
          
          // Validate domain extension (at least 2 characters)
          if (!/\.[a-zA-Z]{2,}$/.test(hostname)) {
            setError("Website URL must have a valid domain extension (e.g., .com, .org, .net)");
            return;
          }
          
          // Check for invalid characters in hostname
          if (!/^[a-zA-Z0-9.-]+$/.test(hostname)) {
            setError("Website URL contains invalid characters in domain");
            return;
          }
          
          // Ensure no double dots or invalid patterns
          if (hostname.includes('..') || hostname.startsWith('.') || hostname.endsWith('.')) {
            setError("Website URL has invalid domain format");
            return;
          }
          
          // Check for minimum domain length
          if (hostname.length < 4) { // Minimum: a.co
            setError("Website URL domain is too short");
            return;
          }
        }
        
        // Additional URL structure validation
        if (url.pathname === '' || url.pathname === '/') {
          // This is fine - root path
        } else {
          // Validate path characters
          if (!/^[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]*$/.test(url.pathname + url.search + url.hash)) {
            setError("Website URL contains invalid characters in path");
            return;
          }
        }
        
      } catch (error) {
        setError("Please enter a valid website URL (e.g., https://example.com)");
        return;
      }
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
        return "Enter the complete website URL including protocol (e.g., https://www.example.com). Invalid URLs will cause system errors.";
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
