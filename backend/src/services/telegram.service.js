import crypto from 'crypto';
import logger from '../utils/logger.js';

const truncate = (value = '', max = 700) => {
  const text = String(value);
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const buildAdminChatLink = (conversationId) => {
  const baseUrl = process.env.ADMIN_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
  const secret = process.env.ADMIN_DEEP_LINK_SECRET || process.env.JWT_SECRET || 'stay-wise-local';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(String(conversationId))
    .digest('hex')
    .slice(0, 32);

  return `${baseUrl.replace(/\/$/, '')}/admin/support?chat=${conversationId}&sig=${signature}`;
};

const isPrivateHost = (hostname = '') => {
  const normalized = hostname.toLowerCase();
  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '0.0.0.0' ||
    normalized === '::1' ||
    normalized.endsWith('.local') ||
    /^10\./.test(normalized) ||
    /^192\.168\./.test(normalized) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)
  );
};

const isPublicTelegramUrl = (value) => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !isPrivateHost(url.hostname);
  } catch {
    return false;
  }
};

export const sendTelegramMessage = async ({ text, replyMarkup }) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) {
    logger.warn('Telegram support notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID missing');
    return { sent: false, skipped: true };
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...(replyMarkup && { reply_markup: replyMarkup }),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    logger.error('Telegram support notification failed:', {
      status: response.status,
      message: data?.description,
    });
    return { sent: false, error: data?.description || 'Telegram request failed' };
  }

  return { sent: true, data };
};

export const notifyTelegramForCustomerMessage = async ({ conversation, message }) => {
  const customer = conversation.customer || {};
  const adminLink = buildAdminChatLink(conversation._id);
  const canUseAdminLink = isPublicTelegramUrl(adminLink);

  const text = [
    '<b>New Stay Wise support message</b>',
    '',
    `<b>Chat:</b> ${escapeHtml(conversation.conversationId || conversation._id)}`,
    `<b>Customer:</b> ${escapeHtml(customer.name || 'Guest visitor')}`,
    `<b>Email:</b> ${escapeHtml(customer.email || 'Not provided')}`,
    `<b>Phone:</b> ${escapeHtml(customer.phone || 'Not provided')}`,
    `<b>Subject:</b> ${escapeHtml(conversation.subject || 'Booking assistance')}`,
    '',
    `<b>Message:</b> ${escapeHtml(truncate(message.body || '[attachment]', 900))}`,
    '',
    canUseAdminLink
      ? `<a href="${adminLink}">Open secure admin chat</a>`
      : '<i>Admin deep link unavailable in local development. Set ADMIN_URL to a public HTTPS admin URL for Telegram buttons.</i>',
  ].join('\n');

  return sendTelegramMessage({
    text,
    replyMarkup: canUseAdminLink
      ? {
          inline_keyboard: [[
            { text: 'Open Chat Dashboard', url: adminLink },
          ]],
        }
      : undefined,
  });
};
