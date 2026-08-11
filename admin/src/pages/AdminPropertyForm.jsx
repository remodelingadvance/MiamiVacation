// pages/admin/AdminPropertyForm.jsx - Add maintenance section
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  HiArrowLeft, 
  HiSave, 
  HiEye, 
  HiPlus, 
  HiTrash, 
  HiCalendar,
  HiInformationCircle
} from 'react-icons/hi';
import { FaWrench } from "react-icons/fa";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SEOHead from '../components/common/SEOHead';
import ImageUploader from '../components/common/ImageUploader';
import RateCalendarManager from '../components/admin/RateCalendarManager';
import adminApi from '../config/api';
import toast from 'react-hot-toast';

const PROPERTY_TYPES = ['condo', 'villa', 'penthouse', 'apartment', 'studio', 'house', 'mansion'];
const PROPERTY_STATUS = ['active', 'inactive', 'maintenance', 'draft'];
const AMENITY_CATEGORIES = ['basic', 'kitchen', 'bathroom', 'outdoor', 'entertainment', 'safety', 'accessibility', 'other'];
const NEARBY_PLACE_TYPES = ['airport', 'bus_station', 'metro', 'beach', 'restaurant', 'shopping', 'park', 'hospital', 'school', 'other'];
const MAINTENANCE_REASONS = [
  { value: 'maintenance', label: 'Maintenance', color: 'yellow' },
  { value: 'renovation', label: 'Renovation', color: 'orange' },
  { value: 'owner_use', label: 'Owner Use', color: 'blue' },
  { value: 'seasonal_closing', label: 'Seasonal Closing', color: 'green' },
  { value: 'other', label: 'Other', color: 'gray' }
];

const cleanText = (value) => (typeof value === 'string' ? value.trim() : '');

const parseInteger = (value, fallback = 0) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const parseFloatValue = (value, fallback = 0) => {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const parseCoordinate = (value, fallback) => {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const parseOptionalInteger = (value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const omitUndefined = (object) => Object.fromEntries(
  Object.entries(object).filter(([, value]) => value !== undefined)
);

const getApiValidationMessage = (error) => {
  const validationErrors = error.response?.data?.errors;
  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors
      .map((item) => item.msg)
      .filter(Boolean)
      .join(', ');
  }

  return error.response?.data?.message || error.response?.data?.error || 'Failed to save property';
};

// Component for Policy Points
const PolicyPoints = ({ control, register, policyIndex }) => {
  const { fields: pointsFields, append: appendPoint, remove: removePoint } = useFieldArray({
    control,
    name: `policiesAndNotes.${policyIndex}.points`
  });

  return (
    <div className="ml-4">
      {pointsFields.map((pointField, pointIndex) => (
        <div key={pointField.id} className="flex gap-2 mb-2">
          <input
            {...register(`policiesAndNotes.${policyIndex}.points.${pointIndex}`)}
            className="input-field flex-1"
            placeholder="Policy point"
          />
          <button
            type="button"
            onClick={() => removePoint(pointIndex)}
            className="px-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40"
          >
            <HiTrash className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => appendPoint('')}
        className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-light)] flex items-center gap-1 mt-2"
      >
        <HiPlus className="w-4 h-4" />
        Add Point
      </button>
    </div>
  );
};

const AdminPropertyForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [maintenanceDates, setMaintenanceDates] = useState([]);
  const [newMaintenanceStart, setNewMaintenanceStart] = useState(null);
  const [newMaintenanceEnd, setNewMaintenanceEnd] = useState(null);
  const [newMaintenanceReason, setNewMaintenanceReason] = useState('maintenance');
  const [newMaintenanceDescription, setNewMaintenanceDescription] = useState('');
  const [addingMaintenance, setAddingMaintenance] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: {
        short: '',
        full: '',
      },
      type: 'condo',
      status: 'active',
      featured: false,
      location: {
        address: '',
        neighborhood: '',
        city: 'Miami',
        state: 'Florida',
        zipCode: '',
        coordinates: [-80.1300, 25.7800],
        nearbyPlaces: [],
      },
      details: {
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        size: '',
        floor: '',
        yearBuilt: '',
        parking: 0,
      },
      amenities: [],
      pricing: {
        basePrice: '',
        cleaningFee: '',
        serviceFee: '',
        taxRate: 13.5,
        minimumStay: 2,
        weeklyDiscount: '',
        monthlyDiscount: '',
      },
      houseRules: {
        checkIn: '15:00',
        checkOut: '11:00',
        smoking: false,
        pets: false,
        parties: false,
        additionalRules: [],
      },
      policiesAndNotes: [],
    },
  });

  // Field arrays
  const { fields: amenityFields, append: appendAmenity, remove: removeAmenity } = useFieldArray({
    control,
    name: 'amenities'
  });

  const { fields: nearbyPlacesFields, append: appendNearbyPlace, remove: removeNearbyPlace } = useFieldArray({
    control,
    name: 'location.nearbyPlaces'
  });

  const { fields: policyFields, append: appendPolicy, remove: removePolicy } = useFieldArray({
    control,
    name: 'policiesAndNotes'
  });

  const { fields: additionalRulesFields, append: appendRule, remove: removeRule } = useFieldArray({
    control,
    name: 'houseRules.additionalRules'
  });

  useEffect(() => {
    if (isEditing) {
      fetchProperty();
      fetchMaintenanceDates();
    }
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getProperty(id);
      const property = response.data.property;

      reset({
        name: property.name || '',
        description: {
          short: property.description?.short || '',
          full: property.description?.full || '',
        },
        type: property.type || 'condo',
        status: property.status || 'active',
        featured: property.featured || false,
        location: {
          address: property.location?.address || '',
          neighborhood: property.location?.neighborhood || '',
          city: property.location?.city || 'Miami',
          state: property.location?.state || 'Florida',
          zipCode: property.location?.zipCode || '',
          coordinates: property.location?.coordinates?.coordinates || [-80.1300, 25.7800],
          nearbyPlaces: property.location?.nearbyPlaces || [],
        },
        details: {
          bedrooms: property.details?.bedrooms || 1,
          bathrooms: property.details?.bathrooms || 1,
          maxGuests: property.details?.maxGuests || 2,
          size: property.details?.size || '',
          floor: property.details?.floor || '',
          yearBuilt: property.details?.yearBuilt || '',
          parking: property.details?.parking || 0,
        },
        amenities: property.amenities || [],
        pricing: {
          basePrice: property.pricing?.basePrice || '',
          cleaningFee: property.pricing?.cleaningFee || 0,
          serviceFee: property.pricing?.serviceFee || 0,
          taxRate: property.pricing?.taxRate || 13.5,
          minimumStay: property.pricing?.minimumStay || 2,
          weeklyDiscount: property.pricing?.weeklyDiscount || 0,
          monthlyDiscount: property.pricing?.monthlyDiscount || 0,
        },
        houseRules: {
          checkIn: property.houseRules?.checkIn || '15:00',
          checkOut: property.houseRules?.checkOut || '11:00',
          smoking: property.houseRules?.smoking || false,
          pets: property.houseRules?.pets || false,
          parties: property.houseRules?.parties || false,
          additionalRules: property.houseRules?.additionalRules || [],
        },
        policiesAndNotes: property.policiesAndNotes || [],
      });

      if (property.images && property.images.length > 0) {
        setImages(property.images);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Failed to load property');
      navigate('/admin/properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceDates = async () => {
    try {
      const response = await adminApi.get(`/properties/${id}/maintenance-dates`);
      setMaintenanceDates(response.data.maintenanceDates || []);
    } catch (error) {
      console.error('Error fetching maintenance dates:', error);
    }
  };

  const handleAddMaintenanceDate = async () => {
    if (!newMaintenanceStart || !newMaintenanceEnd) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (newMaintenanceStart > newMaintenanceEnd) {
      toast.error('Start date must be before end date');
      return;
    }

    setAddingMaintenance(true);
    try {
      const response = await adminApi.post(`/properties/${id}/maintenance-dates`, {
        startDate: newMaintenanceStart.toISOString(),
        endDate: newMaintenanceEnd.toISOString(),
        reason: newMaintenanceReason,
        description: newMaintenanceDescription
      });

      if (response.data.success) {
        toast.success('Maintenance period added successfully');
        setNewMaintenanceStart(null);
        setNewMaintenanceEnd(null);
        setNewMaintenanceReason('maintenance');
        setNewMaintenanceDescription('');
        fetchMaintenanceDates();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add maintenance period');
    } finally {
      setAddingMaintenance(false);
    }
  };

  const handleRemoveMaintenanceDate = async (dateId) => {
    try {
      const response = await adminApi.delete(`/properties/${id}/maintenance-dates/${dateId}`);
      if (response.data.success) {
        toast.success('Maintenance period removed');
        fetchMaintenanceDates();
      }
    } catch (error) {
      toast.error('Failed to remove maintenance period');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getReasonColor = (reason) => {
    const colors = {
      maintenance: 'yellow',
      renovation: 'orange',
      owner_use: 'blue',
      seasonal_closing: 'green',
      other: 'gray'
    };
    return colors[reason] || 'gray';
  };

  const getReasonLabel = (reason) => {
    const reasons = {
      maintenance: 'Maintenance',
      renovation: 'Renovation',
      owner_use: 'Owner Use',
      seasonal_closing: 'Seasonal Closing',
      other: 'Other'
    };
    return reasons[reason] || reason;
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);

      let coordinates = [-80.1300, 25.7800];
      if (data.location.coordinates && Array.isArray(data.location.coordinates)) {
        coordinates = [
          parseCoordinate(data.location.coordinates[0], -80.1300),
          parseCoordinate(data.location.coordinates[1], 25.7800)
        ];
      }

      const filteredPolicies = (data.policiesAndNotes || [])
        .filter(policy => policy.title && policy.title.trim() !== '')
        .map(policy => ({
          title: policy.title,
          points: (policy.points || []).filter(point => point && point.trim() !== ''),
          order: policy.order || 0
        }))
        .filter(policy => policy.points.length > 0);

      const filteredAmenities = (data.amenities || [])
        .filter(amenity => amenity.name && amenity.name.trim() !== '')
        .map(amenity => ({
          category: amenity.category || 'other',
          name: amenity.name,
          description: amenity.description || '',
          icon: amenity.icon || ''
        }));

      const filteredNearbyPlaces = (data.location.nearbyPlaces || [])
        .filter(place => place.name && place.name.trim() !== '' && place.distance && place.distance.trim() !== '');

      const filteredAdditionalRules = (data.houseRules.additionalRules || [])
        .filter(rule => rule && rule.trim() !== '');

      const imageLocationLabel = [
        cleanText(data.location.neighborhood),
        cleanText(data.location.city) || 'Miami',
        cleanText(data.location.state) || 'Florida',
      ].filter(Boolean).join(', ');

      const imagesData = images
        .filter(img => img.url && img.url.trim() !== '')
        .map((img, index) => ({
          url: img.url,
          publicId: img.publicId || '',
          alt: cleanText(img.alt) || `${cleanText(data.name)}${imageLocationLabel ? ` in ${imageLocationLabel}` : ''} - property photo ${index + 1}`,
          isPrimary: img.isPrimary || index === 0,
          order: index,
        }));

      const propertyData = {
        name: cleanText(data.name),
        description: {
          short: cleanText(data.description.short),
          full: cleanText(data.description.full),
        },
        type: data.type,
        status: data.status,
        featured: data.featured || false,
        location: {
          address: cleanText(data.location.address),
          neighborhood: cleanText(data.location.neighborhood),
          city: cleanText(data.location.city) || 'Miami',
          state: cleanText(data.location.state) || 'Florida',
          zipCode: cleanText(data.location.zipCode),
          coordinates: {
            type: 'Point',
            coordinates: coordinates,
          },
          nearbyPlaces: filteredNearbyPlaces,
        },
        details: omitUndefined({
          bedrooms: parseInteger(data.details.bedrooms, 0),
          bathrooms: parseFloatValue(data.details.bathrooms, 0),
          maxGuests: parseInteger(data.details.maxGuests, 1),
          size: parseOptionalInteger(data.details.size),
          floor: parseOptionalInteger(data.details.floor),
          yearBuilt: parseOptionalInteger(data.details.yearBuilt),
          parking: parseInteger(data.details.parking, 0),
        }),
        amenities: filteredAmenities,
        pricing: {
          basePrice: parseFloatValue(data.pricing.basePrice, 0),
          cleaningFee: parseFloatValue(data.pricing.cleaningFee, 0),
          serviceFee: parseFloatValue(data.pricing.serviceFee, 0),
          taxRate: parseFloatValue(data.pricing.taxRate, 13.5),
          minimumStay: parseInteger(data.pricing.minimumStay, 2),
          weeklyDiscount: parseFloatValue(data.pricing.weeklyDiscount, 0),
          monthlyDiscount: parseFloatValue(data.pricing.monthlyDiscount, 0),
        },
        houseRules: {
          checkIn: data.houseRules.checkIn || '15:00',
          checkOut: data.houseRules.checkOut || '11:00',
          smoking: data.houseRules.smoking || false,
          pets: data.houseRules.pets || false,
          parties: data.houseRules.parties || false,
          additionalRules: filteredAdditionalRules,
        },
        policiesAndNotes: filteredPolicies,
      };

      if (imagesData.length > 0) {
        propertyData.images = imagesData;
      }

      if (isEditing) {
        await adminApi.updateProperty(id, propertyData);
        toast.success('Property updated successfully');
      } else {
        const response = await adminApi.createProperty(propertyData);
        toast.success('Property created successfully');
        navigate(`/admin/properties/${response.data.property._id}/edit`);
        return;
      }

      navigate('/admin/properties');
    } catch (error) {
      console.error('Error saving property:', error);
      const errorMessage = getApiValidationMessage(error);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEOHead title={isEditing ? 'Edit Property' : 'Add Property'} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/properties')}
              className="w-10 h-10 rounded-lg glass-light flex items-center justify-center text-[var(--color-text-muted)] hover:text-white transition-colors"
            >
              <HiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-display font-bold text-white">
                {isEditing ? 'Edit Property' : 'Add New Property'}
              </h1>
              <p className="text-sm text-[var(--color-text-muted)]">
                {isEditing ? 'Update property details' : 'Create a new property listing'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isEditing && watch('name') && (
              <a
                href={`/properties/${watch('name').toLowerCase().replace(/\s+/g, '-')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline flex items-center gap-2 text-sm"
              >
                <HiEye className="w-4 h-4" />
                Preview
              </a>
            )}
            <button
              type="submit"
              form="property-form"
              disabled={saving}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <HiSave className="w-4 h-4" />
                  {isEditing ? 'Update Property' : 'Create Property'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Form */}
        <form id="property-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="input-label">Property Name *</label>
                <input
                  type="text"
                  {...register('name', {
                    required: 'Property name is required',
                    minLength: {
                      value: 5,
                      message: 'Property name must be at least 5 characters',
                    },
                  })}
                  className="input-field"
                  placeholder="e.g., Luxury Oceanfront Penthouse"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="input-label">Short Description *</label>
                <textarea
                  {...register('description.short', { required: 'Short description is required' })}
                  className="input-field resize-none"
                  rows={2}
                  placeholder="Brief summary of the property"
                />
                {errors.description?.short && <p className="text-red-500 text-xs mt-1">{errors.description.short.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="input-label">Full Description *</label>
                <textarea
                  {...register('description.full', { required: 'Full description is required' })}
                  className="input-field resize-none"
                  rows={6}
                  placeholder="Detailed description of the property..."
                />
                {errors.description?.full && <p className="text-red-500 text-xs mt-1">{errors.description.full.message}</p>}
              </div>

              <div>
                <label className="input-label">Property Type *</label>
                <select {...register('type')} className="input-field">
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type} className="capitalize">{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="input-label">Status *</label>
                <select {...register('status')} className="input-field">
                  {PROPERTY_STATUS.map((status) => (
                    <option key={status} value={status} className="capitalize">{status}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('featured')}
                  className="w-4 h-4 rounded border-white/20 bg-transparent text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <label className="text-sm text-[var(--color-text-secondary)]">Featured Property</label>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="input-label">Address *</label>
                <input
                  type="text"
                  {...register('location.address', { required: 'Address is required' })}
                  className="input-field"
                  placeholder="123 Ocean Drive"
                />
                {errors.location?.address && <p className="text-red-500 text-xs mt-1">{errors.location.address.message}</p>}
              </div>
              <div>
                <label className="input-label">Neighborhood</label>
                <input
                  type="text"
                  {...register('location.neighborhood')}
                  className="input-field"
                  placeholder="e.g., South Beach"
                />
              </div>
              <div>
                <label className="input-label">City</label>
                <input type="text" {...register('location.city')} className="input-field" />
              </div>
              <div>
                <label className="input-label">State</label>
                <input type="text" {...register('location.state')} className="input-field" />
              </div>
              <div>
                <label className="input-label">Zip Code</label>
                <input type="text" {...register('location.zipCode')} className="input-field" />
              </div>
              <div>
                <label className="input-label">Longitude</label>
                <input
                  type="number"
                  step="any"
                  {...register('location.coordinates.0')}
                  className="input-field"
                  placeholder="-80.1300"
                />
              </div>
              <div>
                <label className="input-label">Latitude</label>
                <input
                  type="number"
                  step="any"
                  {...register('location.coordinates.1')}
                  className="input-field"
                  placeholder="25.7800"
                />
              </div>
            </div>

            {/* Nearby Places */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <label className="input-label">Nearby Places</label>
                <button
                  type="button"
                  onClick={() => appendNearbyPlace({ name: '', distance: '', type: 'other' })}
                  className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-light)] flex items-center gap-1"
                >
                  <HiPlus className="w-4 h-4" />
                  Add Place
                </button>
              </div>
              {nearbyPlacesFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 p-3 bg-white/5 rounded-lg">
                  <div>
                    <input
                      {...register(`location.nearbyPlaces.${index}.name`)}
                      className="input-field"
                      placeholder="Place name"
                    />
                  </div>
                  <div>
                    <input
                      {...register(`location.nearbyPlaces.${index}.distance`)}
                      className="input-field"
                      placeholder="Distance"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      {...register(`location.nearbyPlaces.${index}.type`)}
                      className="input-field flex-1"
                    >
                      {NEARBY_PLACE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeNearbyPlace(index)}
                      className="px-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Property Details */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Property Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="input-label">Bedrooms *</label>
                <input type="number" min="0" {...register('details.bedrooms')} className="input-field" />
              </div>
              <div>
                <label className="input-label">Bathrooms *</label>
                <input type="number" step="0.5" min="0" {...register('details.bathrooms')} className="input-field" />
              </div>
              <div>
                <label className="input-label">Max Guests *</label>
                <input type="number" min="1" {...register('details.maxGuests')} className="input-field" />
              </div>
              <div>
                <label className="input-label">Size (sq ft)</label>
                <input type="number" min="0" {...register('details.size')} className="input-field" />
              </div>
              <div>
                <label className="input-label">Floor</label>
                <input type="number" {...register('details.floor')} className="input-field" />
              </div>
              <div>
                <label className="input-label">Year Built</label>
                <input type="number" {...register('details.yearBuilt')} className="input-field" />
              </div>
              <div>
                <label className="input-label">Parking Spots</label>
                <input type="number" min="0" {...register('details.parking')} className="input-field" />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Amenities</h3>
              <button
                type="button"
                onClick={() => appendAmenity({ category: 'other', name: '', icon: '', description: '' })}
                className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-light)] flex items-center gap-1"
              >
                <HiPlus className="w-4 h-4" />
                Add Amenity
              </button>
            </div>
            {amenityFields.map((field, index) => (
              <div key={field.id} className="mb-4 p-4 bg-white/5 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <select {...register(`amenities.${index}.category`)} className="input-field">
                      {AMENITY_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      {...register(`amenities.${index}.name`)}
                      className="input-field"
                      placeholder="Amenity name"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <textarea
                    {...register(`amenities.${index}.description`)}
                    className="input-field resize-none"
                    rows={2}
                    placeholder="Description"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeAmenity(index)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Pricing</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="input-label">Base Price/Night * ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('pricing.basePrice', { required: 'Price is required' })}
                  className="input-field"
                  placeholder="0.00"
                />
                {errors.pricing?.basePrice && <p className="text-red-500 text-xs mt-1">{errors.pricing.basePrice.message}</p>}
              </div>
              <div>
                <label className="input-label">Cleaning Fee ($)</label>
                <input type="number" step="0.01" min="0" {...register('pricing.cleaningFee')} className="input-field" />
              </div>
              <div>
                <label className="input-label">Service Fee ($)</label>
                <input type="number" step="0.01" min="0" {...register('pricing.serviceFee')} className="input-field" />
              </div>
              <div>
                <label className="input-label">Tax Rate (%)</label>
                <input type="number" step="0.1" {...register('pricing.taxRate')} className="input-field" />
              </div>
              <div>
                <label className="input-label">Minimum Stay (nights)</label>
                <input type="number" min="1" {...register('pricing.minimumStay')} className="input-field" />
              </div>
              <div>
                <label className="input-label">Weekly Discount (%)</label>
                <input type="number" step="0.1" min="0" max="100" {...register('pricing.weeklyDiscount')} className="input-field" />
              </div>
              <div>
                <label className="input-label">Monthly Discount (%)</label>
                <input type="number" step="0.1" min="0" max="100" {...register('pricing.monthlyDiscount')} className="input-field" />
              </div>
            </div>
          </div>

          {isEditing && (
            <RateCalendarManager
              propertyId={id}
              basePrice={watch('pricing.basePrice')}
              minimumStay={watch('pricing.minimumStay')}
            />
          )}

          {/* House Rules */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">House Rules</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="input-label">Check-in Time</label>
                <input type="time" {...register('houseRules.checkIn')} className="input-field" />
              </div>
              <div>
                <label className="input-label">Check-out Time</label>
                <input type="time" {...register('houseRules.checkOut')} className="input-field" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register('houseRules.smoking')} className="w-4 h-4 rounded" />
                <label className="text-sm">Smoking Allowed</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register('houseRules.pets')} className="w-4 h-4 rounded" />
                <label className="text-sm">Pets Allowed</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register('houseRules.parties')} className="w-4 h-4 rounded" />
                <label className="text-sm">Parties Allowed</label>
              </div>
            </div>

            {/* Additional Rules */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="input-label">Additional Rules</label>
                <button
                  type="button"
                  onClick={() => appendRule('')}
                  className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-light)] flex items-center gap-1"
                >
                  <HiPlus className="w-4 h-4" />
                  Add Rule
                </button>
              </div>
              {additionalRulesFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 mb-2">
                  <input
                    {...register(`houseRules.additionalRules.${index}`)}
                    className="input-field flex-1"
                    placeholder="e.g., No loud music after 10 PM"
                  />
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="px-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Policies and Notes */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Policies & Notes</h3>
              <button
                type="button"
                onClick={() => appendPolicy({ title: '', points: [], order: policyFields.length })}
                className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-light)] flex items-center gap-1"
              >
                <HiPlus className="w-4 h-4" />
                Add Policy Section
              </button>
            </div>
            {policyFields.map((field, policyIndex) => (
              <div key={field.id} className="mb-6 p-4 bg-white/5 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <input
                    {...register(`policiesAndNotes.${policyIndex}.title`)}
                    className="input-field flex-1 mr-2"
                    placeholder="Policy title"
                  />
                  <button
                    type="button"
                    onClick={() => removePolicy(policyIndex)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <HiTrash className="w-5 h-5" />
                  </button>
                </div>
                <PolicyPoints control={control} register={register} policyIndex={policyIndex} />
              </div>
            ))}
          </div>

          {/* Maintenance Management - NEW SECTION */}
          {isEditing && (
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaWrench className="w-5 h-5 text-yellow-500" />
                Maintenance Management
              </h3>
              
              {/* Info Box */}
              <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start gap-3">
                  <HiInformationCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-400 font-medium">How Maintenance Mode Works</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      When you mark dates as maintenance, those dates will appear in red on the booking calendar.
                      Customers will see that the property is unavailable on those specific dates but can still book other available dates.
                    </p>
                  </div>
                </div>
              </div>

              {/* Add New Maintenance Period */}
              <div className="mb-6 p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <HiPlus className="w-4 h-4 text-[var(--color-primary)]" />
                  Add Maintenance Period
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label text-sm">Start Date</label>
                    <DatePicker
                      selected={newMaintenanceStart}
                      onChange={setNewMaintenanceStart}
                      selectsStart
                      startDate={newMaintenanceStart}
                      endDate={newMaintenanceEnd}
                      minDate={new Date()}
                      className="input-field w-full"
                      placeholderText="Select start date"
                      dateFormat="MM/dd/yyyy"
                    />
                  </div>
                  <div>
                    <label className="input-label text-sm">End Date</label>
                    <DatePicker
                      selected={newMaintenanceEnd}
                      onChange={setNewMaintenanceEnd}
                      selectsEnd
                      startDate={newMaintenanceStart}
                      endDate={newMaintenanceEnd}
                      minDate={newMaintenanceStart || new Date()}
                      className="input-field w-full"
                      placeholderText="Select end date"
                      dateFormat="MM/dd/yyyy"
                    />
                  </div>
                  <div>
                    <label className="input-label text-sm">Reason</label>
                    <select
                      value={newMaintenanceReason}
                      onChange={(e) => setNewMaintenanceReason(e.target.value)}
                      className="input-field"
                    >
                      {MAINTENANCE_REASONS.map(reason => (
                        <option key={reason.value} value={reason.value}>{reason.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label text-sm">Description (Optional)</label>
                    <input
                      type="text"
                      value={newMaintenanceDescription}
                      onChange={(e) => setNewMaintenanceDescription(e.target.value)}
                      className="input-field"
                      placeholder="e.g., Deep cleaning and maintenance"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddMaintenanceDate}
                  disabled={addingMaintenance}
                  className="mt-4 btn-primary text-sm flex items-center gap-2 justify-center w-full md:w-auto"
                >
                  <HiPlus className="w-4 h-4" />
                  {addingMaintenance ? 'Adding...' : 'Add Maintenance Period'}
                </button>
              </div>

              {/* Existing Maintenance Periods */}
              {maintenanceDates.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <HiCalendar className="w-4 h-4 text-yellow-500" />
                    Existing Maintenance Periods ({maintenanceDates.length})
                  </h4>
                  <div className="space-y-2">
                    {maintenanceDates.map((date) => (
                      <div
                        key={date._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm text-white">
                              {formatDate(date.startDate)} - {formatDate(date.endDate)}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full bg-${getReasonColor(date.reason)}-500/20 text-${getReasonColor(date.reason)}-400`}>
                              {getReasonLabel(date.reason)}
                            </span>
                          </div>
                          {date.description && (
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">
                              {date.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveMaintenanceDate(date._id)}
                          className="w-8 h-8 rounded-lg glass-light flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Maintenance Dates */}
              {maintenanceDates.length === 0 && (
                <div className="text-center py-6">
                  <HiCalendar className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3" />
                  <p className="text-[var(--color-text-secondary)]">No maintenance periods scheduled</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Add maintenance dates to block booking on specific days</p>
                </div>
              )}
            </div>
          )}

          {/* Images */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Property Images</h3>
            <ImageUploader images={images} onChange={setImages} maxImages={20} multiple={true} propertyName={watch('name')} />
          </div>

        </form>
      </div>
    </>
  );
};

export default AdminPropertyForm;
