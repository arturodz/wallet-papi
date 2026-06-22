import { db } from "@/db";
import { aircraft } from "@/db/schema";
import { getCurrentProfile } from "@/lib/auth/guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function Home() {
  const profile = await getCurrentProfile();
  const [plane] = await db.select().from(aircraft).limit(1);

  if (!profile) {
    return <main className="p-8">Please sign in.</main>;
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-2xl">{plane?.tailNumber ?? "No aircraft"}</h1>
        <Badge>{profile.role}</Badge>
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
