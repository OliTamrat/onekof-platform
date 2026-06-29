/**
 * Chapa payment client — Ethiopian payment provider.
 *
 * Supports Telebirr, CBE Birr, Awash Bank, Amole, and card payments
 * in Ethiopian Birr (ETB).
 *
 * Test mode: use CHAPA_SECRET_KEY starting with CHASECK_TEST-...
 * Test card: 4242 4242 4242 4242, any future expiry, any CVC
 */

const CHAPA_BASE_URL = 'https://api.chapa.co/v1';

interface ChapaInitializeParams {
  amount: number;
  currency: 'ETB' | 'USD';
  email: string;
  first_name: string;
  last_name: string;
  tx_ref: string;
  callback_url: string;
  return_url: string;
  customization?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  meta?: Record<string, string>;
}

interface ChapaInitializeResponse {
  message: string;
  status: string;
  data: {
    checkout_url: string;
  };
}

interface ChapaVerifyResponse {
  message: string;
  status: string;
  data: {
    first_name: string;
    last_name: string;
    email: string;
    currency: string;
    amount: number;
    charge: number;
    mode: string;
    method: string;
    type: string;
    status: string;
    reference: string;
    tx_ref: string;
    created_at: string;
    updated_at: string;
    meta?: Record<string, string>;
  };
}

function getChapaKey(): string {
  const key = process.env.CHAPA_SECRET_KEY;
  if (!key) {
    throw new Error('CHAPA_SECRET_KEY is not set');
  }
  return key;
}

export async function chapaInitialize(
  params: ChapaInitializeParams
): Promise<ChapaInitializeResponse> {
  const res = await fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getChapaKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Chapa initialize failed: ${err}`);
  }

  return res.json();
}

export async function chapaVerify(txRef: string): Promise<ChapaVerifyResponse> {
  const res = await fetch(`${CHAPA_BASE_URL}/transaction/verify/${txRef}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${getChapaKey()}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Chapa verify failed: ${err}`);
  }

  return res.json();
}

/**
 * Generate a unique transaction reference for Chapa.
 */
export function generateTxRef(orgId: string, planId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `onekof-${orgId.slice(0, 8)}-${planId.toLowerCase()}-${timestamp}-${random}`;
}
