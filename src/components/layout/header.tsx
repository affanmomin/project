import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/providers/theme-provider';
import { Bell, Moon, Search, Sun, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getPageTitle } from '@/lib/utils';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="border-b px-6 py-3 h-16 flex items-center justify-between bg-background">
      <div className="flex items-center gap-x-3">
        <h1 className="text-xl font-semibold md:text-2xl">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-x-4">
        <div className={cn(
          "relative hidden md:flex items-center",
          "max-w-xs focus-within:max-w-sm transition-all duration-300 ease-in-out"
        )}>
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 w-full bg-background"
          />
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              {theme === 'light' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}