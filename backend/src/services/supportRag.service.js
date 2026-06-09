import { BusinessKnowledge, Property, Booking } from '../models/index.js';
import { generateGeminiAnswer } from './gemini.service.js';
import logger from '../utils/logger.js';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'what', 'when', 'where', 'which',
  'about', 'property', 'properties', 'stay', 'wise', 'miami', 'vacation', 'rental', 'rentals',
  'please', 'tell', 'show', 'does', 'have', 'price', 'pricing', 'book', 'booking',
]);

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getKeywords = (message) => {
  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .slice(0, 12);
};

const formatMoney = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null) return 'not listed';
  return `${currency} ${Number(amount).toLocaleString('en-US')}`;
};

const formatDate = (date) => new Date(date).toISOString().slice(0, 10);

const getFrontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

const getPropertyUrl = (property) => {
  if (!property.slug) return null;
  return `${getFrontendUrl()}/properties/${property.slug}`;
};

const summarizeProperty = (property, blockedDateRanges = []) => {
  const amenities = (property.amenities || [])
    .map((item) => item.name)
    .filter(Boolean)
    .slice(0, 18)
    .join(', ');

  const customRates = (property.availability || [])
    .filter((day) => day?.date && day.price)
    .slice(0, 30)
    .map((day) => `${formatDate(day.date)} ${formatMoney(day.price, property.pricing?.currency)}`)
    .join('; ');

  const policies = (property.policiesAndNotes || [])
    .slice(0, 8)
    .map((policy) => `${policy.title}: ${(policy.points || []).join(' ')}`)
    .join('\n');

  const nearby = [
    ...(property.location?.nearbyPlaces || []),
    ...(property.location?.nearbyAttractions || []),
  ]
    .slice(0, 12)
    .map((place) => `${place.name}${place.distance ? ` (${place.distance})` : ''}`)
    .join(', ');

  const blocks = blockedDateRanges
    .filter((item) => item.propertyId?.toString() === property._id.toString())
    .map((item) => `${formatDate(item.checkIn)} to ${formatDate(item.checkOut)} (${item.status})`)
    .slice(0, 12)
    .join('; ');

  const maintenance = (property.maintenanceDates || [])
    .slice(0, 12)
    .map((item) => `${formatDate(item.startDate)} to ${formatDate(item.endDate)} (${item.reason})`)
    .join('; ');

  return [
    `PROPERTY: ${property.name}`,
    `Source ID: property:${property._id}`,
    `URL slug: ${property.slug || 'not listed'}`,
    `Property details URL: ${getPropertyUrl(property) || 'not listed'}`,
    `Type/status: ${property.type}, ${property.status}`,
    `Location: ${property.location?.address || 'not listed'}, ${property.location?.neighborhood || 'not listed'}, ${property.location?.city || 'Miami'}`,
    `Bedrooms/bathrooms/guests: ${property.details?.bedrooms ?? 'not listed'} bedrooms, ${property.details?.bathrooms ?? 'not listed'} bathrooms, up to ${property.details?.maxGuests ?? 'not listed'} guests`,
    `Pricing: base nightly ${formatMoney(property.pricing?.basePrice, property.pricing?.currency)}, cleaning fee ${formatMoney(property.pricing?.cleaningFee, property.pricing?.currency)}, service fee ${formatMoney(property.pricing?.serviceFee, property.pricing?.currency)}, tax rate ${property.pricing?.taxRate ?? 'not listed'}%`,
    `Stay rules: minimum ${property.pricing?.minimumStay ?? 'not listed'} nights, maximum ${property.pricing?.maximumStay ?? 'not listed'} nights, check-in ${property.houseRules?.checkIn || 'not listed'}, check-out ${property.houseRules?.checkOut || 'not listed'}, pets ${property.houseRules?.pets ? 'allowed' : 'not allowed'}, smoking ${property.houseRules?.smoking ? 'allowed' : 'not allowed'}, parties ${property.houseRules?.parties ? 'allowed' : 'not allowed'}`,
    `Amenities: ${amenities || 'not listed'}`,
    `Custom day rates: ${customRates || 'not listed'}`,
    `Blocked/booking date ranges: ${blocks || 'not listed'}`,
    `Maintenance date ranges: ${maintenance || 'not listed'}`,
    `Nearby approved places: ${nearby || 'not listed'}`,
    `Property policies: ${policies || 'not listed'}`,
  ].join('\n');
};

const buildFallbackAnswer = ({ properties, knowledge }) => {
  const lines = [];

  if (properties.length) {
    lines.push('I found these approved Stay Wise property records:');
    properties.slice(0, 4).forEach((property) => {
      const url = getPropertyUrl(property);
      lines.push(
        `- ${property.name}: ${property.details?.bedrooms ?? 'N/A'} bedrooms, ${property.details?.bathrooms ?? 'N/A'} bathrooms, up to ${property.details?.maxGuests ?? 'N/A'} guests, from ${formatMoney(property.pricing?.basePrice, property.pricing?.currency)} per night.${url ? ` Details: ${url}` : ''}`
      );
    });
  }

  if (knowledge.length) {
    lines.push(properties.length ? '\nApproved business information:' : 'Approved business information:');
    knowledge.slice(0, 4).forEach((item) => {
      lines.push(`- ${item.title}: ${item.answer}`);
    });
  }

  if (!lines.length) {
    return "I don't have approved information for that yet. Please choose Ask Admin and our team will confirm it for you.";
  }

  lines.push('\nFor exact availability or anything not shown above, please choose Ask Admin and our team will confirm it.');
  return lines.join('\n');
};

const findRelevantProperties = async (message) => {
  const keywords = getKeywords(message);
  const isPropertyQuestion = /property|properties|villa|condo|penthouse|studio|house|bedroom|guest|amenit|pool|beach|neighborhood|price|rate|availability|available|check.?in|check.?out/i.test(message);

  if (!keywords.length && !isPropertyQuestion) {
    return [];
  }

  const regex = keywords.length
    ? new RegExp(keywords.map(escapeRegex).join('|'), 'i')
    : /./;

  const query = {
    status: 'active',
    $or: [
      { name: regex },
      { slug: regex },
      { 'description.short': regex },
      { 'description.full': regex },
      { type: regex },
      { 'location.neighborhood': regex },
      { 'location.address': regex },
      { 'amenities.name': regex },
      { 'policiesAndNotes.title': regex },
      { 'policiesAndNotes.points': regex },
    ],
  };

  const properties = await Property.find(query)
    .sort({ featured: -1, priority: -1, 'ratings.average': -1 })
    .limit(6)
    .lean();

  if (!properties.length && isPropertyQuestion) {
    return Property.find({ status: 'active' })
      .sort({ featured: -1, priority: -1, 'ratings.average': -1 })
      .limit(4)
      .lean();
  }

  return properties;
};

const findRelevantKnowledge = async (message) => {
  const keywords = getKeywords(message);
  const regex = keywords.length
    ? new RegExp(keywords.map(escapeRegex).join('|'), 'i')
    : /faq|policy|booking|cancellation|check-in|local|payment/i;

  return BusinessKnowledge.find({
    isApproved: true,
    $or: [
      { title: regex },
      { question: regex },
      { answer: regex },
      { category: regex },
      { tags: regex },
    ],
  })
    .sort({ priority: -1, updatedAt: -1 })
    .limit(10)
    .lean();
};

const findBlockedRanges = async (properties) => {
  if (!properties.length) return [];

  const propertyIds = properties.map((property) => property._id);
  const start = new Date();
  const end = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

  return Booking.find({
    property: { $in: propertyIds },
    status: { $in: ['pending', 'confirmed', 'active'] },
    checkOut: { $gte: start },
    checkIn: { $lte: end },
  })
    .select('property checkIn checkOut status')
    .limit(80)
    .lean()
    .then((bookings) => bookings.map((booking) => ({
      propertyId: booking.property,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      status: booking.status,
    })));
};

const buildContext = async (message) => {
  const [properties, knowledge] = await Promise.all([
    findRelevantProperties(message),
    findRelevantKnowledge(message),
  ]);
  const blockedRanges = await findBlockedRanges(properties);

  const propertyContext = properties.map((property) => summarizeProperty(property, blockedRanges));
  const knowledgeContext = knowledge.map((item) => [
    `APPROVED KNOWLEDGE: ${item.title}`,
    `Source ID: knowledge:${item._id}`,
    `Category: ${item.category}`,
    `Question: ${item.question || 'not listed'}`,
    `Answer: ${item.answer}`,
    `Source: ${item.source}`,
  ].join('\n'));

  return {
    contextText: [...propertyContext, ...knowledgeContext].join('\n\n---\n\n'),
    fallbackAnswer: buildFallbackAnswer({ properties, knowledge }),
    sources: [
      ...properties.map((property) => ({
        type: 'property',
        id: property._id,
        title: property.name,
        slug: property.slug,
        url: getPropertyUrl(property),
        basePrice: property.pricing?.basePrice,
        currency: property.pricing?.currency || 'USD',
        neighborhood: property.location?.neighborhood,
      })),
      ...knowledge.map((item) => ({
        type: 'knowledge',
        id: item._id,
        title: item.title,
        category: item.category,
      })),
    ],
  };
};

const buildPrompt = ({ message, contextText }) => `
You are Stay Wise AI, a booking assistant for a premium Miami vacation rental website.

Hard rules:
- Answer only from the CONTEXT below.
- Never invent property names, prices, fees, amenities, availability, policies, dates, cancellation rules, or local recommendations.
- If the context does not contain the answer, say exactly: "I don't have approved information for that yet. Please choose Ask Admin and our team will confirm it for you."
- If the question asks for availability, make clear that booking status can change and recommend confirming dates in the booking calendar or Ask Admin.
- Give a complete answer when the context contains enough detail. Use short bullets for multiple properties or policies.
- Include property names when relevant.
- When a property details URL is listed in context, include it as "Details: URL".
- For pricing, include listed base nightly price, fees, and day-specific rates when they are present in context.

CONTEXT:
${contextText || 'No approved context matched this question.'}

CUSTOMER QUESTION:
${message}
`;

export const answerSupportQuestion = async ({ message }) => {
  const startedAt = Date.now();
  const { contextText, fallbackAnswer, sources } = await buildContext(message);

  if (!contextText) {
    return {
      answer: "I don't have approved information for that yet. Please choose Ask Admin and our team will confirm it for you.",
      sources: [],
      grounded: false,
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      latencyMs: Date.now() - startedAt,
    };
  }

  try {
    const gemini = await generateGeminiAnswer({
      prompt: buildPrompt({ message, contextText }),
    });

    if (!gemini.configured) {
      return {
        answer: fallbackAnswer,
        sources,
        grounded: true,
        model: gemini.model,
        configured: false,
        latencyMs: Date.now() - startedAt,
      };
    }

    return {
      answer: gemini.text || fallbackAnswer,
      sources,
      grounded: true,
      model: gemini.model,
      configured: gemini.configured,
      latencyMs: Date.now() - startedAt,
    };
  } catch (error) {
    logger.error('Support RAG answer failed:', error);
    return {
      answer: 'AI support is temporarily unavailable. Please choose Ask Admin and our team will help you.',
      sources,
      grounded: false,
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      latencyMs: Date.now() - startedAt,
    };
  }
};
