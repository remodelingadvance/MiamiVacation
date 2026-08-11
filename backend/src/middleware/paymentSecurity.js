import AppError from '../utils/AppError.js';

const normalizeKey = (key) => key.toLowerCase().replace(/[^a-z0-9]/g, '');

const forbiddenKeys = new Set([
  'cardnumber',
  'creditcardnumber',
  'ccnumber',
  'cvv',
  'cvc',
  'securitycode',
  'cardsecuritycode',
  'pan',
  'expiry',
  'expirydate',
  'expiration',
  'expirationdate',
]);

const parentSuggestsRawCard = (parents) =>
  parents.some((key) => /card|credit|paymentmethod/i.test(key));

const isForbiddenPaymentKey = (key, parents) => {
  const normalized = normalizeKey(key);

  if (forbiddenKeys.has(normalized)) return true;

  return (
    ['number', 'last4', 'expmonth', 'expyear'].includes(normalized) &&
    parentSuggestsRawCard(parents)
  );
};

const findRawPaymentField = (value, parents = []) => {
  if (!value || typeof value !== 'object') return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const match = findRawPaymentField(item, parents);
      if (match) return match;
    }
    return null;
  }

  for (const [key, childValue] of Object.entries(value)) {
    if (isForbiddenPaymentKey(key, parents)) {
      return [...parents, key].join('.');
    }

    const match = findRawPaymentField(childValue, [...parents, key]);
    if (match) return match;
  }

  return null;
};

export const rejectRawPaymentData = (req, res, next) => {
  const rawPaymentField = findRawPaymentField(req.body);

  if (rawPaymentField) {
    return next(
      new AppError(
        'Do not send card numbers, CVV, or raw card details to Stay Wise. Use Stripe Elements and PaymentMethod IDs only.',
        400
      )
    );
  }

  next();
};
