// Mock Mobile Money payment service
export interface PaymentResult {
  success: boolean
  reference: string
  message: string
}

export async function initiateMobileMoneyPayment(
  phone: string,
  amount: number,
  description: string,
  provider: 'mtn' | 'airtel' | 'zamtel' = 'mtn'
): Promise<PaymentResult> {
  // Mock payment - in production integrate with actual payment gateway
  console.log(`[Payment Mock] ${provider.toUpperCase()} K${amount} from ${phone}: ${description}`)
  await new Promise(r => setTimeout(r, 500))
  return {
    success: true,
    reference: 'PAY' + Date.now(),
    message: `Payment of K${amount} initiated via ${provider.toUpperCase()} Mobile Money`,
  }
}

export async function verifyPayment(reference: string): Promise<boolean> {
  console.log(`[Payment Mock] Verifying payment: ${reference}`)
  return true
}
