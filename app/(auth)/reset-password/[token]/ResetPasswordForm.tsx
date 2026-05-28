"use client";

import { useActionState } from "react";
import { KeyRoundIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const action = resetPassword.bind(null, token);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <Card className="w-full max-w-md rounded-lg shadow-sm">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p> : null}
          <div className="space-y-2">
            <Label htmlFor="password">Password baru</Label>
            <Input id="password" name="password" type="password" required />
            {state.fieldErrors?.password ? <p className="text-xs text-destructive">{state.fieldErrors.password[0]}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required />
            {state.fieldErrors?.confirmPassword ? <p className="text-xs text-destructive">{state.fieldErrors.confirmPassword[0]}</p> : null}
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            <KeyRoundIcon className="size-4" aria-hidden="true" />
            {pending ? "Menyimpan..." : "Simpan Password Baru"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
