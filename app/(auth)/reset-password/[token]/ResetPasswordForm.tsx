"use client";

import { useActionState } from "react";
import { KeyRoundIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormNotice } from "@/components/shared/FormNotice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const action = resetPassword.bind(null, token);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error ? <FormNotice variant="error">{state.error}</FormNotice> : null}
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
