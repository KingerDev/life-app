'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Mail, User } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!user) {
    return <div className="h-48 flex items-center justify-center text-muted-foreground">Načítavam...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-muted-foreground text-sm">Tvoje konto a nastavenia</p>
      </div>

      {/* Avatar & Name */}
      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={user.imageUrl} alt={user.fullName ?? ''} />
            <AvatarFallback className="text-lg">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xl font-semibold">{user.fullName ?? user.username ?? 'Priateľ'}</p>
            <p className="text-sm text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardContent className="p-0 divide-y divide-border">
          <div className="flex items-center gap-3 p-4">
            <User className="size-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Celé meno</p>
              <p className="text-sm font-medium">{user.fullName ?? '–'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <Mail className="size-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user.primaryEmailAddress?.emailAddress ?? '–'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Button
        variant="destructive"
        className="w-full"
        onClick={() => signOut({ redirectUrl: '/sign-in' })}
      >
        <LogOut className="size-4 mr-2" />
        Odhlásiť sa
      </Button>
    </div>
  );
}
