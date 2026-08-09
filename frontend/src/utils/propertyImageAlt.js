const toCleanText = (value) => (typeof value === 'string' ? value.trim() : '');

export const getPropertyLocationLabel = (property = {}) => {
  const neighborhood = toCleanText(property.location?.neighborhood);
  const city = toCleanText(property.location?.city) || 'Miami';
  const state = toCleanText(property.location?.state);

  return [neighborhood, city, state].filter(Boolean).join(', ');
};

export const getPropertyImageAlt = (property = {}, image = {}, index = 0) => {
  const savedAlt = toCleanText(image?.alt);
  if (savedAlt) return savedAlt;

  const name = toCleanText(property.name) || 'Stay Wise Miami vacation rental';
  const location = getPropertyLocationLabel(property);
  const photoNumber = Number.isInteger(index) ? index + 1 : 1;

  return `${name}${location ? ` in ${location}` : ''} - vacation rental photo ${photoNumber}`;
};
