/**
 * notificationParser.js
 *
 * Parses raw CommBank push notifications into structured transaction objects.
 * Called by handleNotification() in backgroundTask.js every time a CommBank
 * notification arrives.
 */

export function parseNotification(notification) {

    const body = notification.text ?? '';

    // Detect whether this notification is a credit (money in) or debit (money out).
    // CommBank uses phrases like "You've been paid" for credits and "spent at" for debits.
    const isCredit = body.toLowerCase().includes('been paid') || body.toLowerCase().includes('credited');
    const isDebit = body.toLowerCase().includes('spent at') || body.toLowerCase().includes('debited');

    // If it's neither a credit nor a debit we recognise, ignore it (e.g. marketing, OTP alerts)
    if(!isCredit && !isDebit)
        return {valid: false};

    // Extract the dollar amount using a regex.
    // Handles formats like: $7.90  $1,200.00  $70
    const amountMatch = body.match(/\$(\d{1,6}(?:,\d{3})*(?:\.\d{1,2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

    // If we can't find an amount, the notification isn't useful to us
    if (!amount)
        return {valid: false};

    // Extract merchant name for debit transactions.
    // CommBank format: "$7.90 spent at On the Run."
    const merchantMatch = body.match(/spent at ([A-Za-z0-9][A-Za-z0-9\s&'()-]{1,40}?)\./i);
    const merchant = merchantMatch ? merchantMatch[1].trim() : 'Unknown Merchant';

    // Determine the credit source label:
    // - 'Woolworths' if the notification mentions Woolworths (payday from employer)
    // - Extracted name if CommBank says "paid by [Name]" or "paid from [Name]"
    // - 'Direct Credit' as a fallback for bank transfers with no sender info
    let creditMerchant = 'Direct Credit';
    if (body.toLowerCase().includes('woolworths')) {
        creditMerchant = 'Woolworths';
    } else {
        // Try to pull out a sender name e.g. "paid by John" or "paid from Jane Smith"
        const paidByMatch = body.match(/paid (?:by|from) ([A-Za-z][A-Za-z\s]{1,30}?)(?:\.|into| to)/i);
        if (paidByMatch) creditMerchant = paidByMatch[1].trim();
    }

    return {
        valid: true,
        type: isCredit ? 'credit' : 'debit',
        amount,
        // Credits use the resolved creditMerchant; debits use the "spent at" merchant
        merchant: isCredit ? creditMerchant : merchant,
        date: new Date(notification.time).toISOString(),
        // Use the notification timestamp as a unique ID to prevent duplicate entries
        id: String(notification.time),
    };
}
