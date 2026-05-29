function resendApiKey() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY belum dikonfigurasi.");
  }

  return apiKey;
}

export async function sendPasswordResetEmail(email: string, resetLink: string, username: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Alumni SYP-33-6 <onboarding@resend.dev>",
      to: email,
      subject: "Reset Password Akun Alumni SYP-33-6",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          <h1 style="font-size: 20px;">Reset Password Akun Alumni SYP-33-6</h1>
          <p>Halo ${username},</p>
          <p>Kami menerima permintaan reset password untuk akun Alumni SYP-33-6 Anda.</p>
          <p>
            Klik tautan berikut untuk membuat password baru:
            <br />
            <a href="${resetLink}" style="color: #b45309;">Reset password sekarang</a>
          </p>
          <p>Tautan ini berlaku selama 1 jam. Abaikan email ini jika Anda tidak merasa meminta reset password.</p>
          <p>Salam hangat,<br />Admin Alumni SYP-33-6</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    throw new Error("Email reset password gagal dikirim.");
  }
}
