// Africa's Talking SMS service — real integration
// Env vars required: AT_API_KEY, AT_USERNAME (set in Railway)
// Falls back to log-only if env vars are missing

export async function sendSms(phone: string, message: string): Promise<boolean> {
  const apiKey   = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;

  // Always log — visible in Railway logs as a fallback
  console.log(`[SMS] To: ${phone} | Msg: ${message}`);

  if (!apiKey || !username) {
    console.warn('[SMS] AT_API_KEY or AT_USERNAME not set — OTP logged above, not sent via SMS');
    return true; // don't throw — let OTP flow complete
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AfricasTalking = require('africastalking');
    const at  = AfricasTalking({ apiKey, username });
    const sms = at.SMS;
    await sms.send({ to: [phone], message, from: 'Zamgrow' });
    console.log(`[SMS] Sent to ${phone}`);
    return true;
  } catch (err) {
    console.error('[SMS] Send error:', err);
    return false;
  }
}

export async function sendOtpSms(phone: string, otp: string): Promise<boolean> {
  const message = `Your Zamgrow Exchange OTP is: ${otp}. Valid for 5 minutes. Do not share this code.`;
  return sendSms(phone, message);
}
