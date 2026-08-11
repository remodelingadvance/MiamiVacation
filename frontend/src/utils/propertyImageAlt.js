const toCleanText = (value) => (typeof value === 'string' ? value.trim() : '');

export const getPropertyLocationLabel = (property = {}) => {
  const safeProperty = property || {};
  const neighborhood = toCleanText(safeProperty.location?.neighborhood);
  const city = toCleanText(safeProperty.location?.city) || 'Miami';
  const state = toCleanText(safeProperty.location?.state);

  return [neighborhood, city, state].filter(Boolean).join(', ');
};

export const getPropertyImageAlt = (property = {}, image = {}, index = 0) => {
  const safeProperty = property || {};
  const safeImage = image || {};
  const savedAlt = toCleanText(safeImage.alt);
  if (savedAlt) return savedAlt;

  const name = toCleanText(safeProperty.name) || 'Stay Wise Miami vacation rental';
  const location = getPropertyLocationLabel(safeProperty);
  const photoNumber = Number.isInteger(index) ? index + 1 : 1;

  return `${name}${location ? ` in ${location}` : ''} - vacation rental photo ${photoNumber}`;
};
