import { Resend } from "resend";

/**
 * Kirim email reset password dengan template Bahasa Indonesia.
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
  username: string,
): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY); // ← pindah ke sini

  await resend.emails.send({
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
  });
}