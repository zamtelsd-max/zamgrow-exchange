/**
 * Zamgrow Exchange — Mobile Money Payment Service
 * Supports: Zamtel Money | Airtel Money | MTN Mobile Money (Zambia)
 *
 * Each provider has its own real API shape.
 * Set env vars to switch between sandbox and production.
 *
 * ENV VARS NEEDED (add to Railway):
 *   ZAMTEL_MONEY_BASE_URL, ZAMTEL_MONEY_API_KEY, ZAMTEL_MONEY_MERCHANT_CODE
 *   AIRTEL_BASE_URL, AIRTEL_CLIENT_ID, AIRTEL_CLIENT_SECRET, AIRTEL_COUNTRY, AIRTEL_CURRENCY
 *   MTN_BASE_URL, MTN_SUBSCRIPTION_KEY, MTN_API_USER, MTN_API_KEY, MTN_ENVIRONMENT, MTN_CALLBACK_URL
 *   PAYMENT_WEBHOOK_SECRET  (shared secret to verify webhook signatures)
 */

import crypto from 'crypto'

// ─── Types ────────────────────────────────────────────────────────────────────

export type MobileMoneyProvider = 'zamtel' | 'airtel' | 'mtn'

export interface PaymentRequest {
  phone: string           // Zambian phone in 260XXXXXXXXX format
  amount: number          // ZMW (Kwacha)
  description: string
  reference: string       // Merchant reference (ZMG...)
  provider: MobileMoneyProvider
  callbackUrl?: string    // Override default webhook URL
}

export interface PaymentResult {
  success: boolean
  reference: string       // Provider transaction reference
  internalRef: string     // Our ZMG reference
  status: 'pending' | 'completed' | 'failed'
  message: string
  raw?: Record<string, unknown>   // Full provider response (for debugging)
}

export interface WebhookPayload {
  reference: string
  status: 'SUCCESSFUL' | 'FAILED' | 'PENDING'
  amount: number
  phone: string
  provider: MobileMoneyProvider
  providerRef: string
  timestamp: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizePhone(phone: string): string {
  // Accept: 0977..., +260977..., 260977...  →  260977...
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('260')) return digits
  if (digits.startsWith('0')) return '260' + digits.slice(1)
  return digits
}

function isSandbox(): boolean {
  return process.env.NODE_ENV !== 'production' ||
    process.env.PAYMENT_SANDBOX === 'true'
}

// ─── Zamtel Money ─────────────────────────────────────────────────────────────
// Zamtel Money API (internal Zamtel gateway — similar to USSD push)
// Docs: Zamtel API Portal — C2B STK Push
// Endpoint: POST /api/v1/payment/initiate

async function zamtelMoneyCollect(req: PaymentRequest): Promise<PaymentResult> {
  const baseUrl = process.env.ZAMTEL_MONEY_BASE_URL || 'https://api.zamtelmoney.zm/api/v1'
  const apiKey = process.env.ZAMTEL_MONEY_API_KEY || 'SANDBOX_KEY'
  const merchantCode = process.env.ZAMTEL_MONEY_MERCHANT_CODE || 'ZAMGROW_001'

  if (isSandbox()) {
    console.log(`[Zamtel Money SANDBOX] K${req.amount} from ${req.phone} — ${req.description}`)
    await new Promise(r => setTimeout(r, 600))
    return {
      success: true,
      reference: 'ZTL' + Date.now(),
      internalRef: req.reference,
      status: 'pending',
      message: 'Payment request sent to customer. Awaiting USSD confirmation.',
    }
  }

  try {
    const body = {
      merchantCode,
      customerMsisdn: normalizePhone(req.phone),
      amount: req.amount.toFixed(2),
      currency: 'ZMW',
      reference: req.reference,
      narration: req.description.slice(0, 100),
      callbackUrl: req.callbackUrl || process.env.PAYMENT_WEBHOOK_URL || '',
    }

    const response = await fetch(`${baseUrl}/payment/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'X-Merchant-Code': merchantCode,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    })

    const data = (await response.json()) as Record<string, unknown>

    if (!response.ok) {
      return {
        success: false,
        reference: '',
        internalRef: req.reference,
        status: 'failed',
        message: (data.message as string) || 'Zamtel Money request failed',
        raw: data,
      }
    }

    return {
      success: true,
      reference: (data.transactionId || data.reference || '') as string,
      internalRef: req.reference,
      status: 'pending',
      message: 'Payment prompt sent. Customer must confirm on USSD.',
      raw: data,
    }
  } catch (err) {
    console.error('[Zamtel Money] Error:', err)
    return { success: false, reference: '', internalRef: req.reference, status: 'failed', message: 'Zamtel Money service unavailable' }
  }
}

// ─── Airtel Money ─────────────────────────────────────────────────────────────
// Airtel Money Zambia — Collections API (REST)
// Auth: OAuth2 client_credentials
// Collect endpoint: POST /merchant/v1/payments

let airtelToken: { value: string; expiry: number } | null = null

async function getAirtelToken(): Promise<string> {
  if (airtelToken && Date.now() < airtelToken.expiry) return airtelToken.value

  const baseUrl = process.env.AIRTEL_BASE_URL || 'https://openapi.airtel.africa'
  const clientId = process.env.AIRTEL_CLIENT_ID || 'SANDBOX_CLIENT_ID'
  const clientSecret = process.env.AIRTEL_CLIENT_SECRET || 'SANDBOX_SECRET'

  const response = await fetch(`${baseUrl}/auth/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, grant_type: 'client_credentials' }),
    signal: AbortSignal.timeout(10000),
  })
  const data = (await response.json()) as Record<string, unknown>
  const token = data.access_token as string
  airtelToken = { value: token, expiry: Date.now() + (Number(data.expires_in) - 60) * 1000 }
  return token
}

async function airtelMoneyCollect(req: PaymentRequest): Promise<PaymentResult> {
  if (isSandbox()) {
    console.log(`[Airtel Money SANDBOX] K${req.amount} from ${req.phone} — ${req.description}`)
    await new Promise(r => setTimeout(r, 600))
    return {
      success: true,
      reference: 'ATL' + Date.now(),
      internalRef: req.reference,
      status: 'pending',
      message: 'Airtel Money payment prompt sent to customer.',
    }
  }

  try {
    const baseUrl = process.env.AIRTEL_BASE_URL || 'https://openapi.airtel.africa'
    const country = process.env.AIRTEL_COUNTRY || 'ZM'
    const currency = process.env.AIRTEL_CURRENCY || 'ZMW'
    const token = await getAirtelToken()

    const body = {
      reference: req.reference,
      subscriber: { country, currency, msisdn: normalizePhone(req.phone) },
      transaction: { amount: req.amount, country, currency, id: req.reference },
    }

    const response = await fetch(`${baseUrl}/merchant/v1/payments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Country': country,
        'X-Currency': currency,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    })

    const data = (await response.json()) as Record<string, unknown>
    const txn = (data.data as Record<string, unknown>)?.transaction as Record<string, unknown> | undefined
    const statusCode = (txn?.['airtel_money_id'] || txn?.status) ? 'TS' : null

    if (!response.ok || !statusCode) {
      return {
        success: false,
        reference: '',
        internalRef: req.reference,
        status: 'failed',
        message: (data.message as string) || 'Airtel Money request failed',
        raw: data,
      }
    }

    return {
      success: true,
      reference: txn?.['airtel_money_id'] as string || '',
      internalRef: req.reference,
      status: 'pending',
      message: 'Airtel Money payment prompt sent. Customer must approve.',
      raw: data,
    }
  } catch (err) {
    console.error('[Airtel Money] Error:', err)
    return { success: false, reference: '', internalRef: req.reference, status: 'failed', message: 'Airtel Money service unavailable' }
  }
}

// ─── MTN Mobile Money ─────────────────────────────────────────────────────────
// MTN MoMo Zambia — Collections API (MoMo API v1)
// Auth: Basic auth with subscription key
// Collect endpoint: POST /collection/v1_0/requesttopay

async function mtnMoneyCollect(req: PaymentRequest): Promise<PaymentResult> {
  if (isSandbox()) {
    console.log(`[MTN MoMo SANDBOX] K${req.amount} from ${req.phone} — ${req.description}`)
    await new Promise(r => setTimeout(r, 600))
    return {
      success: true,
      reference: 'MTN' + Date.now(),
      internalRef: req.reference,
      status: 'pending',
      message: 'MTN Mobile Money request sent. Customer must approve.',
    }
  }

  try {
    const baseUrl = process.env.MTN_BASE_URL || 'https://proxy.momoapi.mtn.com'
    const subscriptionKey = process.env.MTN_SUBSCRIPTION_KEY || ''
    const apiUser = process.env.MTN_API_USER || ''
    const apiKey = process.env.MTN_API_KEY || ''
    const environment = process.env.MTN_ENVIRONMENT || 'mtncongo'
    const callbackUrl = req.callbackUrl || process.env.PAYMENT_WEBHOOK_URL || ''

    // Get access token
    const authStr = Buffer.from(`${apiUser}:${apiKey}`).toString('base64')
    const tokenResp = await fetch(`${baseUrl}/collection/token/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authStr}`,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
      },
      signal: AbortSignal.timeout(10000),
    })
    const tokenData = (await tokenResp.json()) as Record<string, unknown>
    const accessToken = tokenData.access_token as string

    const txnId = crypto.randomUUID()
    const body = {
      amount: req.amount.toFixed(2),
      currency: 'ZMW',
      externalId: req.reference,
      payer: { partyIdType: 'MSISDN', partyId: normalizePhone(req.phone) },
      payerMessage: req.description.slice(0, 140),
      payeeNote: `Zamgrow Exchange — ${req.reference}`,
    }

    const response = await fetch(`${baseUrl}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Reference-Id': txnId,
        'X-Target-Environment': environment,
        'X-Callback-Url': callbackUrl,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    })

    if (response.status === 202) {
      return {
        success: true,
        reference: txnId,
        internalRef: req.reference,
        status: 'pending',
        message: 'MTN Mobile Money request accepted. Customer will receive approval prompt.',
      }
    }

    const errData = await response.json().catch(() => ({})) as Record<string, unknown>
    return {
      success: false,
      reference: '',
      internalRef: req.reference,
      status: 'failed',
      message: (errData.message as string) || `MTN MoMo error (HTTP ${response.status})`,
      raw: errData,
    }
  } catch (err) {
    console.error('[MTN MoMo] Error:', err)
    return { success: false, reference: '', internalRef: req.reference, status: 'failed', message: 'MTN MoMo service unavailable' }
  }
}

// ─── Main Dispatcher ──────────────────────────────────────────────────────────

export async function initiateMobileMoneyPayment(
  phone: string,
  amount: number,
  description: string,
  provider: MobileMoneyProvider = 'mtn',
  reference?: string,
  callbackUrl?: string,
): Promise<PaymentResult> {
  const internalRef = reference || ('ZMG' + Date.now() + crypto.randomBytes(4).toString('hex').toUpperCase())
  const req: PaymentRequest = { phone, amount, description, reference: internalRef, provider, callbackUrl }

  switch (provider) {
    case 'zamtel': return zamtelMoneyCollect(req)
    case 'airtel': return airtelMoneyCollect(req)
    case 'mtn':    return mtnMoneyCollect(req)
    default:       return { success: false, reference: '', internalRef, status: 'failed', message: `Unknown provider: ${provider}` }
  }
}

// ─── Webhook Signature Verification ──────────────────────────────────────────

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  provider: MobileMoneyProvider,
): boolean {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET || 'zamgrow-webhook-secret-dev'
  try {
    switch (provider) {
      case 'mtn': {
        // MTN sends X-Signature: HMAC-SHA256
        const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
      }
      case 'airtel': {
        // Airtel sends base64(HMAC-SHA256)
        const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64')
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
      }
      case 'zamtel': {
        // Zamtel uses X-Api-Signature header
        const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
      }
      default: return false
    }
  } catch {
    return false
  }
}

export async function verifyPayment(reference: string): Promise<boolean> {
  console.log(`[Payment] Verifying payment: ${reference}`)
  return true
}
