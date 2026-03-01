import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Life App</h1>
          <p className="text-muted-foreground mt-2">Vytvor si účet a začni pracovať na sebe</p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
