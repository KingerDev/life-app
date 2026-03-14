import { currentUser } from '@clerk/nextjs/server';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';

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
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {greeting()}, {user?.firstName ?? 'priateľu'}!
        </h2>
        <p className="text-muted-foreground mt-1">Ako sa dnes máš? Tu je tvoj prehľad.</p>
      </div>

      <DashboardGrid />
    </div>
  );
}
