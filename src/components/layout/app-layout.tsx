import { cn } from '@/lib/utils';
import { PropsWithChildren } from 'react';
import Sidebar from './sidebar';
import Header from './header';

type AppLayoutProps = PropsWithChildren<{
  className?: string;
}>;

export default function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div 
            className={cn(
              "flex-1 overflow-auto p-6 md:p-8", 
              className
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}