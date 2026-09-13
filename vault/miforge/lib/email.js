import { Resend } from 'resend';
export async function sendWelcomeEmail({ toEmail, fullName, planType, mlyAmount }) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes('placeholder')) {
    return { success: true, simulated: true };
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'MiForge <support@milyfe.fun>',
      to: toEmail,
      subject: `Welcome to MiForge (${mlyAmount} $MLY Matched)`,
      html: `<h2>Welcome, ${fullName}!</h2><p>Your ${planType.toUpperCase()} membership is active with ${mlyAmount} $MLY credits.</p>`
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
