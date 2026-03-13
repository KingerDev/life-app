'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Home, Circle, Brain, FlaskConical, Target, CalendarCheck, CheckSquare } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useModulesStore } from '@/lib/store';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Sidebar } from './Sidebar';

interface BottomNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  moduleKey?: 'questsEnabled' | 'experimentsEnabled' | 'wheelEnabled' | 'beliefsEnabled' | 'habitsEnabled' | 'todosEnabled';
}

const BOTTOM_NAV: BottomNavItem[] = [
  { href: '/', label: 'Domov', icon: Home },
  { href: '/wheel', label: 'Koleso', icon: Circle, moduleKey: 'wheelEnabled' },
  { href: '/beliefs', label: 'Myseľ', icon: Brain, moduleKey: 'beliefsEnabled' },
  { href: '/habits', label: 'Návyky', icon: CalendarCheck, moduleKey: 'habitsEnabled' },
  { href: '/todos', label: 'Úlohy', icon: CheckSquare, moduleKey: 'todosEnabled' },
  { href: '/experiments', label: 'Exp.', icon: FlaskConical, moduleKey: 'experimentsEnabled' },
  { href: '/quests', label: 'Ciele', icon: Target, moduleKey: 'questsEnabled' },
];

export function MobileNav() {
  const pathname = usePathname();
  const modules = useModulesStore();
  const [open, setOpen] = useState(false);

  const visibleItems = BOTTOM_NAV.filter(item =>
    !item.moduleKey || modules[item.moduleKey]
  ).slice(0, 5);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 z-40">
        <h1 className="text-lg font-bold">Life App</h1>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetTitle className="sr-only">Navigácia</SheetTitle>
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-2 z-40">
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
                'flex flex-col items-center gap-1 px-3 py-1 rounded-lg min-w-0 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="size-5" />
              <span className="text-xs truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
