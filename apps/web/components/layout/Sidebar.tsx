'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navigation } from '@/config/navigation';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar hidden md:flex flex-col h-full text-sidebar-foreground">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-xl">P</span>
          </div>
          <span className="text-lg font-bold tracking-tight">Personal OS</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.disabled ? '#' : item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium',
                isActive 
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/70')} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border flex items-center justify-between">
        <span className="text-xs text-sidebar-foreground/50">
          Version 1.0.0
        </span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
