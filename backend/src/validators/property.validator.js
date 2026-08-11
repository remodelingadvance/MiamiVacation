import { body, param, query } from 'express-validator';

export const createPropertyValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Property name is required')
        .isLength({ min: 5, max: 200 })
        .withMessage('Property name must be between 5 and 200 characters'),

    body('description.short')
        .trim()
        .notEmpty()
        .withMessage('Short description is required')
        .isLength({ max: 500 })
        .withMessage('Short description cannot exceed 500 characters'),

    body('description.full')
        .trim()
        .notEmpty()
        .withMessage('Full description is required'),

    body('type')
        .notEmpty()
        .withMessage('Property type is required')
        .isIn(['condo', 'villa', 'penthouse', 'apartment', 'studio', 'house', 'mansion'])
        .withMessage('Invalid property type'),

    body('location.address')
        .trim()
        .notEmpty()
        .withMessage('Address is required'),

    body('location.coordinates.coordinates')
        .isArray({ min: 2, max: 2 })
        .withMessage('Coordinates must be an array of [longitude, latitude]'),

    body('location.coordinates.coordinates.*')
        .isFloat()
        .withMessage('Coordinates must be valid numbers'),

    body('location.nearbyPlaces')
        .optional()
        .isArray()
        .withMessage('Nearby places must be an array'),

    body('location.nearbyPlaces.*.name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Nearby place name is required'),

    body('location.nearbyPlaces.*.distance')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Distance is required'),

    body('location.nearbyPlaces.*.type')
        .optional()
        .isIn(['airport', 'bus_station', 'metro', 'beach', 'restaurant', 'shopping', 'park', 'hospital', 'school', 'other'])
        .withMessage('Invalid nearby place type'),

    body('details.bedrooms')
        .isInt({ min: 0 })
        .withMessage('Number of bedrooms must be a positive number'),

    body('details.bathrooms')
        .isFloat({ min: 0 })
        .withMessage('Number of bathrooms must be a positive number'),

    body('details.maxGuests')
        .isInt({ min: 1 })
        .withMessage('Maximum guests must be at least 1'),

    body('details.size')
        .optional({ values: 'null' })
        .isInt({ min: 0 })
        .withMessage('Size must be a positive number'),

    body('details.yearBuilt')
        .optional({ values: 'null' })
        .isInt({ min: 1800, max: new Date().getFullYear() })
        .withMessage('Invalid year'),

    body('amenities')
        .optional()
        .isArray()
        .withMessage('Amenities must be an array'),

    body('amenities.*.name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Amenity name is required'),

    body('amenities.*.category')
        .optional()
        .isIn(['basic', 'kitchen', 'bathroom', 'outdoor', 'entertainment', 'safety', 'accessibility', 'other'])
        .withMessage('Invalid amenity category'),

    body('amenities.*.description')
        .optional()
        .trim(),

    body('pricing.basePrice')
        .isFloat({ min: 0 })
        .withMessage('Base price must be a positive number'),

    body('pricing.cleaningFee')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Cleaning fee must be a positive number'),

    body('pricing.serviceFee')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Service fee must be a positive number'),

    body('pricing.taxRate')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Tax rate must be between 0 and 100'),

    body('pricing.minimumStay')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Minimum stay must be at least 1 night'),

    body('pricing.weeklyDiscount')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Weekly discount must be between 0 and 100'),

    body('pricing.monthlyDiscount')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Monthly discount must be between 0 and 100'),

    body('houseRules.checkIn')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Invalid check-in time format (HH:MM)'),

    body('houseRules.checkOut')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Invalid check-out time format (HH:MM)'),

    body('houseRules.smoking')
        .optional()
        .isBoolean()
        .withMessage('Smoking must be boolean'),

    body('houseRules.pets')
        .optional()
        .isBoolean()
        .withMessage('Pets must be boolean'),

    body('houseRules.parties')
        .optional()
        .isBoolean()
        .withMessage('Parties must be boolean'),

    body('houseRules.additionalRules')
        .optional()
        .isArray()
        .withMessage('Additional rules must be an array'),

    body('policiesAndNotes')
        .optional()
        .isArray()
        .withMessage('Policies and notes must be an array'),

    body('policiesAndNotes.*.title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Policy title is required'),

    body('policiesAndNotes.*.points')
        .optional()
        .isArray()
        .withMessage('Policy points must be an array'),

    body('policiesAndNotes.*.points.*')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Policy point cannot be empty'),

    body('images')
        .optional()
        .isArray()
        .withMessage('Images must be an array'),

    body('images.*.url')
        .optional()
        .isURL()
        .withMessage('Invalid image URL'),

    body('images.*.isPrimary')
        .optional()
        .isBoolean()
        .withMessage('isPrimary must be boolean'),
];

export const updatePropertyValidator = [
    param('id')
        .isMongoId()
        .withMessage('Invalid property ID'),

    body('name')
        .optional()
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Property name must be between 5 and 200 characters'),

    body('type')
        .optional()
        .isIn(['condo', 'villa', 'penthouse', 'apartment', 'studio', 'house', 'mansion'])
        .withMessage('Invalid property type'),

    body('pricing.basePrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Base price must be a positive number'),

    body('status')
        .optional()
        .isIn(['active', 'inactive', 'maintenance', 'draft'])
        .withMessage('Invalid status'),

    body('featured')
        .optional()
        .isBoolean()
        .withMessage('Featured must be boolean'),

    body('location.nearbyPlaces')
        .optional()
        .isArray(),

    body('amenities')
        .optional()
        .isArray(),

    body('policiesAndNotes')
        .optional()
        .isArray(),
];

export const propertySearchValidator = [
    query('search')
        .optional()
        .trim(),

    query('neighborhood')
        .optional()
        .trim(),

    query('neighbourhood')
        .optional()
        .trim(),

    query('minPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum price must be a positive number'),

    query('maxPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum price must be a positive number'),

    query('guests')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Number of guests must be at least 1'),

    query('bedrooms')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Number of bedrooms must be a positive number'),

    query('type')
        .optional()
        .custom((value) => {
            const allowedTypes = ['condo', 'villa', 'penthouse', 'apartment', 'studio', 'house', 'mansion'];
            return value.split(',').every((type) => allowedTypes.includes(type));
        })
        .withMessage('Invalid property type'),

    query('amenities')
        .optional()
        .trim(),

    query('sort')
        .optional()
        .trim(),

    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive number'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
];
