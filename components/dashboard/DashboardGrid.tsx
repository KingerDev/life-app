'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useModulesStore, ModuleId, DEFAULT_MODULE_ORDER } from '@/lib/store';
import { WheelCard } from './WheelCard';
import { BeliefsCard } from './BeliefsCard';
import { HabitsCard } from './HabitsCard';
import { TodosCard } from './TodosCard';
import { ExperimentsCard } from './ExperimentsCard';
import { NotesCard } from './NotesCard';
import { QuestsCard } from './QuestsCard';
import { Button } from '@/components/ui/button';
import { GripVertical, LayoutGrid, Check } from 'lucide-react';

const CARD_COMPONENTS: Record<ModuleId, React.ComponentType> = {
  wheel: WheelCard,
  beliefs: BeliefsCard,
  habits: HabitsCard,
  todos: TodosCard,
  experiments: ExperimentsCard,
  notes: NotesCard,
  quests: QuestsCard,
};

function SortableCard({ id, editMode }: { id: ModuleId; editMode: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const CardComponent = CARD_COMPONENTS[id];

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative h-[400px]">
      {editMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-md bg-background/80 border border-border cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="size-4" />
        </div>
      )}
      <div className="h-full">
        <CardComponent />
      </div>
    </div>
  );
}

export function DashboardGrid() {
  const { moduleOrder, setModuleOrder } = useModulesStore();
  const [editMode, setEditMode] = useState(false);

  // Ensure all modules are present (handles new modules added after initial store save)
  const order = [
    ...moduleOrder.filter((id) => DEFAULT_MODULE_ORDER.includes(id)),
    ...DEFAULT_MODULE_ORDER.filter((id) => !moduleOrder.includes(id)),
  ] as ModuleId[];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = order.indexOf(active.id as ModuleId);
      const newIndex = order.indexOf(over.id as ModuleId);
      setModuleOrder(arrayMove(order, oldIndex, newIndex));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant={editMode ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => setEditMode(v => !v)}
        >
          {editMode ? (
            <><Check className="size-4" /> Hotovo</>
          ) : (
            <><LayoutGrid className="size-4" /> Upraviť rozloženie</>
          )}
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {order.map((id) => (
              <SortableCard key={id} id={id} editMode={editMode} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
