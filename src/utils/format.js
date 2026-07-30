export function formatCurrency(value) {
  return `PKR ${Number(value || 0).toLocaleString()}`;
}

export function paymentToForm(payment) {
  return {
    company: payment.company,
    opportunity: payment.opportunity,
    invoice: payment.invoice,
    amount: String(payment.amount),
    paid: String(payment.paid),
    method: payment.method,
    reference: payment.reference,
    date: payment.date,
    notes: payment.notes,
  };
}
