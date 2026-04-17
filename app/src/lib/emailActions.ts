"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordRecoveryEmail(email: string, code: string) {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY não configurada. O e-mail não será enviado academicamente.");
    return { success: false, error: "Servidor de e-mail não configurado." };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Emerald Finance <onboarding@resend.dev>",
      to: [email],
      subject: "CUIDADO: Seu código de recuperação chegou!",
      html: `
        <div style="font-family: sans-serif; padding: 40px; background: #f9fafb; color: #111827;">
          <div style="max-width: 400px; margin: 0 auto; background: white; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb;">
            <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 8px;">Emerald Finance</h1>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 32px;">Você solicitou a recuperação de acesso à sua conta.</p>
            
            <div style="background: #f0fdf4; border: 2px solid #86efac; padding: 20px; border-radius: 12px; text-align: center;">
              <div style="font-size: 12px; color: #166534; font-weight: 700; margin-bottom: 8px; text-transform: uppercase;">Seu Código de Segurança</div>
              <div style="font-size: 32px; font-weight: 900; color: #15803d; letter-spacing: 4px;">${code}</div>
            </div>

            <p style="font-size: 12px; color: #9ca3af; margin-top: 32px; text-align: center;">
              Este código é válido por 30 minutos. Se você não solicitou este e-mail, por favor ignore-o.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
