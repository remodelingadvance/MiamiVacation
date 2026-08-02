import { COMPANY_INFO } from '../config/constants.js';

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 48;

const clean = (value) =>
  String(value ?? 'Not provided')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Not provided';

const escapePdfText = (value) => clean(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const formatMoney = (value, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return 'Not provided';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
};

const customerName = (booking) => {
  const guest = booking.guestsInfo?.primaryGuest || {};
  const user = booking.user || {};
  return clean(`${guest.firstName || user.firstName || ''} ${guest.lastName || user.lastName || ''}`);
};

const customerAddress = (booking) => {
  const guestAddress = booking.guestsInfo?.primaryGuest?.address || {};
  const userAddress = booking.user?.address || {};
  const street = guestAddress.street || userAddress.street;
  const city = guestAddress.city || userAddress.city;
  const state = guestAddress.state || userAddress.state;
  const postalCode = guestAddress.postalCode || userAddress.zipCode || userAddress.postalCode;
  const country = guestAddress.country || userAddress.country;
  return clean([street, [city, state, postalCode].filter(Boolean).join(', '), country].filter(Boolean).join(' | '));
};

const propertyAddress = (property) => {
  const location = property?.location || {};
  return clean([
    location.address,
    location.neighborhood,
    [location.city, location.state, location.zipCode].filter(Boolean).join(', '),
    location.country,
  ].filter(Boolean).join(' | '));
};

const buildPdf = (content) => {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets[index + 1] = Buffer.byteLength(pdf, 'latin1');
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'latin1');
};

export const createBookingInvoicePdf = (booking) => {
  const currency = booking.pricing?.currency || 'USD';
  const guest = booking.guestsInfo?.primaryGuest || {};
  const property = booking.property || {};
  const totalGuests = (booking.guests?.adults || 0) + (booking.guests?.children || 0);
  const rows = [];

  const drawText = (text, x, y, options = {}) => {
    const font = options.bold ? 'F2' : 'F1';
    const size = options.size || 10;
    const color = options.color || '0 0 0';
    rows.push(`BT /${font} ${size} Tf ${color} rg ${x} ${y} Td (${escapePdfText(text)}) Tj ET`);
  };

  const drawRect = (x, y, width, height, color) => {
    rows.push(`${color} rg ${x} ${y} ${width} ${height} re f`);
  };

  const drawDivider = (y) => {
    rows.push('0.86 0.88 0.91 RG 0.8 w');
    rows.push(`${MARGIN} ${y} m ${PAGE_WIDTH - MARGIN} ${y} l S`);
  };

  const labelValue = (label, value, x, y, width = 240) => {
    drawText(label, x, y, { size: 8, bold: true, color: '0.38 0.43 0.55' });
    drawText(value, x, y - 15, { size: 10, bold: true });
    return width;
  };

  drawRect(0, 728, PAGE_WIDTH, 64, '0.03 0.08 0.30');
  drawText(COMPANY_INFO.name.toUpperCase(), MARGIN, 764, { size: 20, bold: true, color: '1 1 1' });
  drawText('Miami Vacation Rental Invoice', MARGIN, 744, { size: 10, color: '1 1 1' });
  drawText(`${COMPANY_INFO.phone} | ${COMPANY_INFO.email}`, MARGIN, 730, { size: 8, color: '1 1 1' });
  drawText(`Invoice ${booking.bookingNumber}`, 380, 758, { size: 14, bold: true, color: '1 1 1' });
  drawText(`Issued ${formatDate(new Date())}`, 380, 742, { size: 9, color: '1 1 1' });

  drawText('Booking Summary', MARGIN, 696, { size: 14, bold: true });
  labelValue('Booking Number', booking.bookingNumber, MARGIN, 674);
  labelValue('Payment Status', booking.payment?.status || 'Not provided', 210, 674);
  labelValue('Booking Status', booking.status || 'Not provided', 380, 674);

  drawDivider(638);

  drawText('Customer Information', MARGIN, 616, { size: 14, bold: true });
  labelValue('Primary Guest', customerName(booking), MARGIN, 594);
  labelValue('Email', guest.email || booking.user?.email, 300, 594);
  labelValue('Phone', guest.phone || booking.user?.phone, MARGIN, 558);
  labelValue('Address', customerAddress(booking), 210, 558, 350);

  drawDivider(522);

  drawText('Property And Stay', MARGIN, 500, { size: 14, bold: true });
  labelValue('Property', property.name, MARGIN, 478);
  labelValue('Property Address', propertyAddress(property), 300, 478);
  labelValue('Check-in', formatDate(booking.checkIn), MARGIN, 442);
  labelValue('Check-out', formatDate(booking.checkOut), 170, 442);
  labelValue('Nights', booking.pricing?.nights || 0, 300, 442);
  labelValue('Guests', `${totalGuests} guests, ${booking.guests?.infants || 0} infants`, 400, 442);

  drawDivider(406);

  drawText('Charges', MARGIN, 384, { size: 14, bold: true });
  const priceRows = [
    [`Nightly rates (${booking.pricing?.nights || 0} nights)`, booking.pricing?.baseTotal],
    ['Cleaning fee', booking.pricing?.cleaningFee],
    ['Service fee', booking.pricing?.serviceFee],
    ['Taxes', booking.pricing?.taxes],
  ];

  let y = 362;
  priceRows.forEach(([label, amount]) => {
    drawText(label, MARGIN, y, { size: 10 });
    drawText(formatMoney(amount, currency), 450, y, { size: 10, bold: true });
    y -= 20;
  });

  if ((booking.pricing?.discount || 0) > 0) {
    drawText('Discount', MARGIN, y, { size: 10 });
    drawText(`-${formatMoney(booking.pricing.discount, currency)}`, 450, y, { size: 10, bold: true });
    y -= 20;
  }

  drawDivider(y + 5);
  drawText('Total Paid', MARGIN, y - 16, { size: 13, bold: true });
  drawText(formatMoney(booking.pricing?.total, currency), 430, y - 16, { size: 13, bold: true });

  drawText('Daily Rate Snapshot', MARGIN, 206, { size: 12, bold: true });
  (booking.pricing?.dailyRates || []).slice(0, 7).forEach((day, index) => {
    const lineY = 186 - (index * 16);
    drawText(`${formatDate(day.date)} - ${day.source || 'rate'}`, MARGIN, lineY, { size: 8 });
    drawText(formatMoney(day.price, currency), 450, lineY, { size: 8, bold: true });
  });

  if ((booking.pricing?.dailyRates || []).length > 7) {
    drawText(`+ ${(booking.pricing.dailyRates.length - 7)} more nightly rates on file`, MARGIN, 70, { size: 8 });
  }

  drawText(`Thank you for booking with ${COMPANY_INFO.name}. Please keep this invoice for your records.`, MARGIN, 40, {
    size: 8,
    color: '0.38 0.43 0.55',
  });
  drawText(COMPANY_INFO.address, MARGIN, 24, { size: 7, color: '0.38 0.43 0.55' });

  return buildPdf(`${rows.join('\n')}\n`);
};
