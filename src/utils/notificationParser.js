export function parseNotification(notification) {

    const body = notification.text ?? '';
    const isCredit = body.toLowerCase().includes('been paid') || body.toLowerCase().includes('credited');
    const isDebit = body.toLowerCase().includes('spent at') || body.toLowerCase().includes('debited');

    if(!isCredit && !isDebit) 
        return {valid: false};

    const amountMatch = body.match(/$(\d{1,6}(?:,\d{3})*(?:.\d{1,2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

    if (!amount)
        return {valid: false};

    const merchantMatch = body.match(/spent at ([A-Za-z0-9][A-Za-z0-9\s&'()-]{1,40}?)\./i);
    const merchant = merchantMatch ? merchantMatch[1].trim() : 'Unknown Merchant';

    return {
        valid: true,
        type: isCredit ? 'credit' : 'debit',
        amount,
        merchant: isCredit ? 'Woolworths' : merchant,
        date: new Date(notification.time).toISOString(),
        id: String(notification.time),
        raw: body,
    };
}