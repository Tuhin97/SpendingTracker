/**
 * Parses a raw SMS body into a transaction object.
 * Extend the regex patterns to match your bank's SMS format.
 */
export function parseSms(sms) {
  const amountMatch = sms.body?.match(/(?:Rs\.?|INR)\s?([\d,]+(?:\.\d{1,2})?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

  return {
    id: String(sms.date),
    amount,
    description: sms.address ?? 'Unknown',
    date: new Date(sms.date).toISOString(),
    raw: sms.body,
  };
}
