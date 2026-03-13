'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClerk, useUser } from '@clerk/nextjs';
import {
  Home, Circle, Brain, FlaskConical, Target, CalendarCheck, CheckSquare,
  Settings, User, LogOut, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModulesStore } from '@/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  moduleKey?: 'questsEnabled' | 'experimentsEnabled' | 'wheelEnabled' | 'beliefsEnabled' | 'habitsEnabled' | 'todosEnabled';
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Domov', icon: Home },
  { href: '/wheel', label: 'Koleso života', icon: Circle, color: '#3b82f6', moduleKey: 'wheelEnabled' },
  { href: '/beliefs', label: 'Presvedčenia', icon: Brain, color: '#3b82f6', moduleKey: 'beliefsEnabled' },
  { href: '/habits', label: 'Návyky', icon: CalendarCheck, color: '#10b981', moduleKey: 'habitsEnabled' },
  { href: '/todos', label: 'Úlohy', icon: CheckSquare, color: '#f59e0b', moduleKey: 'todosEnabled' },
  { href: '/experiments', label: 'Experimenty', icon: FlaskConical, color: '#8b5cf6', moduleKey: 'experimentsEnabled' },
  { href: '/quests', label: 'Ciele', icon: Target, color: '#8b5cf6', moduleKey: 'questsEnabled' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();
  const modules = useModulesStore();

  const visibleItems = NAV_ITEMS.filter(item =>
    !item.moduleKey || modules[item.moduleKey]
  );

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Life App</h1>
        <p className="text-xs text-muted-foreground mt-1">Osobný rozvoj</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="size-3 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Settings + User */}
      <div className="p-4 border-t border-border space-y-1">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === '/settings'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          )}
        >
          <Settings className="size-4" />
          <span>Nastavenia</span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <Avatar className="size-6">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName ?? ''} />
                <AvatarFallback className="text-xs">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{user?.fullName ?? user?.username}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="size-4 mr-2" />
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ redirectUrl: '/sign-in' })}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="size-4 mr-2" />
              Odhlásiť sa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
