'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useModulesStore } from '@/lib/store';
import { Circle, Brain, FlaskConical, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleToggleProps {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  enabled: boolean;
  onToggle: () => void;
}

function ModuleToggle({ label, description, icon: Icon, color, enabled, onToggle }: ModuleToggleProps) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div
        className="size-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="size-5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
          enabled ? 'bg-primary' : 'bg-muted'
        )}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={cn(
            'inline-block size-4 transform rounded-full bg-white shadow transition-transform',
            enabled ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const {
    wheelEnabled, beliefsEnabled, experimentsEnabled, questsEnabled,
    toggleWheel, toggleBeliefs, toggleExperiments, toggleQuests,
  } = useModulesStore();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Nastavenia</h1>
        <p className="text-muted-foreground text-sm">Prispôsob svoju Life App</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Moduly</CardTitle>
          <p className="text-sm text-muted-foreground">Zapni alebo vypni moduly v navigácii</p>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <ModuleToggle
            label="Koleso života"
            description="Hodnotenie oblastí života na radarovom grafe"
            icon={Circle}
            color="#3b82f6"
            enabled={wheelEnabled}
            onToggle={toggleWheel}
          />
          <ModuleToggle
            label="Presvedčenia"
            description="Transformácia limitujúcich presvedčení"
            icon={Brain}
            color="#3b82f6"
            enabled={beliefsEnabled}
            onToggle={toggleBeliefs}
          />
          <ModuleToggle
            label="Experimenty"
            description="Malé časovo ohraničené pokusy"
            icon={FlaskConical}
            color="#8b5cf6"
            enabled={experimentsEnabled}
            onToggle={toggleExperiments}
          />
          <ModuleToggle
            label="Ciele"
            description="Štvrťročné ciele pre prácu a život"
            icon={Target}
            color="#8b5cf6"
            enabled={questsEnabled}
            onToggle={toggleQuests}
          />
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            Life App v1.0 · Osobný rozvoj
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
