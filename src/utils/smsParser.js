/**
 * Parses a raw SMS body into a transaction object.
 * Extend the regex patterns to match your bank's SMS format.
 */
export function parseSms(sms) {
  const body = sms.body ?? '';

  const isCredit = body.toLowerCase().includes('credited');

  const amountMatch = body.match(/\$(\d{1,6}(?:,\d{3})*(?:\.\d{1,2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

  if (!amount) {
    return { valid: false };
  }

  const merchantMatch = body.match(/\bat\s+([A-Z0-9][A-Z0-9\s&'-]{1,40}?)(?:\s+on\s|\s*$)/i);
  const merchant = merchantMatch ? merchantMatch[1].trim() : 'Unknown Merchant';


   return {
    valid: true,
    type: isCredit ? 'credit' : 'debit',
    amount,
    merchant: isCredit ? (merchantMatch?.[1]?.trim() ?? 'Unknown Credit') : merchant,
    date: new Date(sms.date).toISOString(),
    id: String(sms.date),
    raw: body,
  };
}
