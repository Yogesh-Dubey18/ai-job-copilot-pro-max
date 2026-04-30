import { Resend } from 'resend';
import { env } from '../config/env';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const redactToken = (text: string) => text.replace(/[A-Za-z0-9_-]{24,}/g, '[redacted-token]');

export const sendEmail = async ({ to, subject, html, text }: { to: string; subject: string; html?: string; text: string }) => {
  if (resend) {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html: html || `<pre>${text}</pre>`,
      text
    });
    return { delivered: true, provider: 'resend' };
  }

  if (env.NODE_ENV !== 'production') {
    console.log(JSON.stringify({ level: 'info', type: 'email.safe_mode', to, subject, text: redactToken(text) }));
  }

  return {
    delivered: false,
    provider: 'safe-mode',
    message: 'Email provider not configured. Set RESEND_API_KEY or SENDGRID_API_KEY.'
  };
};
