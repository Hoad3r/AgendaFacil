const { Resend } = require('resend');

const FROM = process.env.EMAIL_FROM || 'AgendaFácil <noreply@agendafacil.app>';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

async function sendEmail({ to, subject, html }) {
  if (process.env.NODE_ENV === 'development' && !process.env.RESEND_API_KEY) {
    console.log(`[EMAIL DEV] To: ${to} | Subject: ${subject}`);
    return;
  }
  const resend = getResend();
  const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) {
    console.error(`[EMAIL] Falha Resend (from=${FROM}, to=${to}):`, error);
    throw new Error(`Falha ao enviar email: ${error.message || JSON.stringify(error)}`);
  }
  console.log(`[EMAIL] Enviado (id=${data?.id}, from=${FROM}, to=${to})`);
}

module.exports = { sendEmail };
