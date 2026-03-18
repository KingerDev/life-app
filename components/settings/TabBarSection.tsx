'use client';

import { Home, ChevronUp, ChevronDown, X, Plus, Circle, Brain, CalendarCheck, CheckSquare, FlaskConical, FileText, Target } from 'lucide-react';
import { useModulesStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ALL_NAV_ITEMS = [
  { href: '/wheel',       label: 'Koleso života', icon: Circle,       moduleKey: 'wheelEnabled'       as const, color: '#3b82f6' },
  { href: '/beliefs',     label: 'Presvedčenia',  icon: Brain,        moduleKey: 'beliefsEnabled'     as const, color: '#6366f1' },
  { href: '/habits',      label: 'Návyky',        icon: CalendarCheck,moduleKey: 'habitsEnabled'      as const, color: '#10b981' },
  { href: '/todos',       label: 'Úlohy',         icon: CheckSquare,  moduleKey: 'todosEnabled'       as const, color: '#f59e0b' },
  { href: '/experiments', label: 'Experimenty',   icon: FlaskConical, moduleKey: 'experimentsEnabled' as const, color: '#8b5cf6' },
  { href: '/notes',       label: 'Poznámky',      icon: FileText,     moduleKey: 'notesEnabled'       as const, color: '#8b5cf6' },
  { href: '/quests',      label: 'Ciele',         icon: Target,       moduleKey: 'questsEnabled'      as const, color: '#6366f1' },
];

export function TabBarSection() {
  const modules = useModulesStore();
  const { tabBarPins, setTabBarPins } = modules;

  const enabledItems = ALL_NAV_ITEMS.filter(item => modules[item.moduleKey]);

  const pinnedItems = tabBarPins
    .map(href => enabledItems.find(item => item.href === href))
    .filter((item): item is typeof ALL_NAV_ITEMS[number] => !!item);

  const availableItems = enabledItems.filter(item => !tabBarPins.includes(item.href));

  const canAddMore = pinnedItems.length < 4;

  const removePin = (href: string) => setTabBarPins(tabBarPins.filter(h => h !== href));
  const addPin    = (href: string) => { if (canAddMore) setTabBarPins([...tabBarPins, href]); };

  const moveUp = (href: string) => {
    const idx = tabBarPins.indexOf(href);
    if (idx <= 0) return;
    const next = [...tabBarPins];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setTabBarPins(next);
  };

  const moveDown = (href: string) => {
    const idx = tabBarPins.indexOf(href);
    if (idx < 0 || idx >= tabBarPins.length - 1) return;
    const next = [...tabBarPins];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setTabBarPins(next);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Tab bar</CardTitle>
        <p className="text-sm text-muted-foreground">Nastav až 4 moduly v spodnej navigačnej lište</p>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* Live preview */}
        <div className="flex items-center justify-around bg-muted/40 rounded-xl px-2 py-3 border border-border">
          {/* Home — always fixed */}
          <div className="flex flex-col items-center gap-1">
            <Home className="size-5 text-primary" />
            <span className="text-[10px] text-primary font-medium">Domov</span>
          </div>

          {pinnedItems.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.href} className="flex flex-col items-center gap-1">
                <Icon className="size-5" style={{ color: item.color }} />
                <span className="text-[10px] text-muted-foreground truncate max-w-[52px] text-center leading-tight">
                  {item.label.split(' ')[0]}
                </span>
              </div>
            );
          })}

          {/* Empty slots */}
          {Array.from({ length: 4 - pinnedItems.length }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1 opacity-25">
              <div className="size-5 rounded-full border-2 border-dashed border-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">voľné</span>
            </div>
          ))}
        </div>

        {/* Pinned items */}
        {pinnedItems.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-2">
              V tab bare
            </p>
            {pinnedItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={item.href} className="flex items-center gap-3 px-2 py-2 rounded-lg bg-muted/30">
                  <span className="text-xs font-bold text-muted-foreground w-4 text-center shrink-0">
                    {idx + 2}
                  </span>
                  <div
                    className="size-7 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <Icon className="size-4" style={{ color: item.color }} />
                  </div>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveUp(item.href)}
                      disabled={idx === 0}
                      className="p-1.5 rounded hover:bg-muted disabled:opacity-25 transition-colors"
                      aria-label="Posunúť hore"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(item.href)}
                      disabled={idx === pinnedItems.length - 1}
                      className="p-1.5 rounded hover:bg-muted disabled:opacity-25 transition-colors"
                      aria-label="Posunúť dole"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePin(item.href)}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Odstrániť z tab baru"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Available items */}
        {availableItems.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-2">
              Dostupné
            </p>
            {availableItems.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.href} className="flex items-center gap-3 px-2 py-2 rounded-lg">
                  <div
                    className="size-7 rounded-md flex items-center justify-center shrink-0 opacity-60"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <Icon className="size-4" style={{ color: item.color }} />
                  </div>
                  <span className="flex-1 text-sm text-muted-foreground">{item.label}</span>
                  <button
                    type="button"
                    onClick={() => addPin(item.href)}
                    disabled={!canAddMore}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="size-3" />
                    Pridať
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!canAddMore && availableItems.length > 0 && (
          <p className="text-xs text-muted-foreground text-center pb-1">
            Tab bar je plný (max. 4 + Domov). Najprv odober niektorú položku.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
