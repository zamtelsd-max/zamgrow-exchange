// Mock Africa's Talking SMS service
export async function sendSms(phone: string, message: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SMS Mock] To: ${phone}\nMessage: ${message}`)
    return true
  }
  try {
    // In production, integrate with Africa's Talking SDK
    // const AfricasTalking = require('africastalking')
    // const at = AfricasTalking({ apiKey: process.env.AFRICAS_TALKING_API_KEY, username: process.env.AFRICAS_TALKING_USERNAME })
    // await at.SMS.send({ to: [phone], message, from: 'Zamgrow' })
    return true
  } catch (err) {
    console.error('SMS error:', err)
    return false
  }
}

export async function sendOtpSms(phone: string, otp: string): Promise<boolean> {
  const message = `Your Zamgrow Exchange OTP is: ${otp}. Valid for 5 minutes. Do not share this code.`
  return sendSms(phone, message)
}
