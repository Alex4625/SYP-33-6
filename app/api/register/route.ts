import { NextResponse } from "next/server";

import { createAlumniRegistration } from "@/lib/registration";

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await createAlumniRegistration(formData);

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        fieldErrors: result.fieldErrors,
        values: result.values,
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ username: result.username });
}
