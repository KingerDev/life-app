import { currentUser } from '@clerk/nextjs/server';
import { WheelCard } from '@/components/dashboard/WheelCard';
import { BeliefsCard } from '@/components/dashboard/BeliefsCard';
import { HabitsCard } from '@/components/dashboard/HabitsCard';
import { ExperimentsCard } from '@/components/dashboard/ExperimentsCard';
import { QuestsCard } from '@/components/dashboard/QuestsCard';
import { TodosCard } from '@/components/dashboard/TodosCard';

export default async function DashboardPage() {
  const user = await currentUser();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Dobré ráno';
    if (hour < 18) return 'Dobrý deň';
    return 'Dobrý večer';
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {greeting()}, {user?.firstName ?? 'priateľu'}!
        </h2>
        <p className="text-muted-foreground mt-1">Ako sa dnes máš? Tu je tvoj prehľad.</p>
      </div>

      {/* Dashboard cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WheelCard />
        <BeliefsCard />
        <HabitsCard />
        <TodosCard />
        <ExperimentsCard />
        <QuestsCard />
      </div>
    </div>
  );
}
