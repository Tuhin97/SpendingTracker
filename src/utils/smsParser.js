/**
 * Parses a raw SMS body into a transaction object.
 * Extend the regex patterns to match your bank's SMS format.
 */
export function parseSms(sms) {
  const body = sms.body ?? '';

  if (body.toLowerCase().includes('credited')) {
    return { valid: false };
  }
  const amountMatch = sms.body?.match(/\$([\d,]+(?:\.\d{1,2})?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

  if (!amount) {
    return { valid: false };
  }

  const merchantMatch = body.match(/\bat\s+([A-Z0-9][A-Z0-9\s&'-]{1,40}?)(?:\s+on\s|\s*$)/i);
  const merchant = merchantMatch ? merchantMatch[1].trim() : 'Unknown Merchant';


   return {
    valid: true,
    amount,
    merchant,
    date: new Date(sms.date).toISOString(),
    id: String(sms.date),
    raw: body,
  };
}
