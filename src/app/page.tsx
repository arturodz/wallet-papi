import Link from "next/link";
import { db } from "@/db";
import { aircraft } from "@/db/schema";
import { getCurrentProfile } from "@/lib/auth/guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";

export const dynamic = "force-dynamic";

export default async function Home() {
  const profile = await getCurrentProfile();
  const [plane] = await db.select().from(aircraft).limit(1);

  if (!profile) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">Please sign in to continue.</p>
        <Button render={<Link href="/sign-in" />}>Go to sign in</Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-2xl">{plane?.tailNumber ?? "No aircraft"}</h1>
        <div className="flex items-center gap-3">
          <Badge>{profile.role}</Badge>
          <SignOutButton />
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Aircraft</CardTitle></CardHeader>
        <CardContent className="font-mono text-sm space-y-1">
          <div>{plane?.make} {plane?.model}</div>
          <div>Tach: {plane?.currentTach}</div>
          <div>Hobbs: {plane?.currentHobbs}</div>
        </CardContent>
      </Card>
    </main>
  );
}
