export function formatCurrency(amount, currency = "LKR") {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return amount; // return raw if not a number
  }

  // Create a formatter
  const formatter = new Intl.NumberFormat(currency === "LKR" ? "si-LK" : "en-US", {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return formatter.format(Number(amount));
}
