"use client";

import Link from "next/link";
import { useActionState } from "react";
import { MailIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/actions";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, {});

  return (
    <Card className="w-full max-w-md rounded-lg shadow-sm">
      <CardHeader>
        <CardTitle>Lupa Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.success ? <p className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">{state.success}</p> : null}
          {state.error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p> : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email terdaftar</Label>
            <Input id="email" name="email" type="email" required />
            {state.fieldErrors?.email ? <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p> : null}
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            <MailIcon className="size-4" aria-hidden="true" />
            {pending ? "Mengirim..." : "Kirim Link Reset"}
          </Button>
        </form>
        <Link href="/login" className="mt-5 block text-center text-sm text-primary hover:underline">
          Kembali ke login
        </Link>
      </CardContent>
    </Card>
  );
}
