import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { HiArrowLeft, HiSave, HiEye } from 'react-icons/hi';
import SEOHead from '../components/common/SEOHead';
import ImageUploader from '../components/common/ImageUploader';
import adminApi from '../config/api';
import toast from 'react-hot-toast';

const PROPERTY_TYPES = ['condo', 'villa', 'penthouse', 'apartment', 'studio', 'house', 'mansion'];
const PROPERTY_STATUS = ['active', 'inactive', 'maintenance', 'draft'];

const AdminPropertyForm = () => {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [images, setImages] = useState([]);

    const {
  register,
  handleSubmit,
  reset,
  setValue,
  watch,
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
    },

    details: {
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      size: '',
      floor: '',
      parking: 0,
    },

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
    },
  },
});

    useEffect(() => {
        if (isEditing) {
            fetchProperty();
        }
    }, [id]);

    const fetchProperty = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getProperty(id);
            const property = response.data.property;

            // Set form values
            Object.keys(property).forEach((key) => {
                if (typeof property[key] === 'object' && property[key] !== null && !Array.isArray(property[key])) {
                    Object.keys(property[key]).forEach((subKey) => {
                        setValue(`${key}.${subKey}`, property[key][subKey]);
                    });
                } else if (key !== 'images' && key !== '_id' && key !== '__v') {
                    setValue(key, property[key]);
                }
            });

            // Set coordinates
            if (property.location?.coordinates?.coordinates) {
                setValue('location.coordinates', property.location.coordinates.coordinates);
            }

            // Set images
            if (property.images) {
                setImages(property.images);
            }
        } catch (error) {
            toast.error('Failed to load property');
            navigate('/admin/properties');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
  try {
    setSaving(true);

    const propertyData = {
      name: data.name,

      description: {
        short: data.description.short,
        full: data.description.full,
      },

      type: data.type,
      status: data.status,
      featured: data.featured,

      location: {
        address: data.location.address,
        neighborhood: data.location.neighborhood,
        city: data.location.city,
        state: data.location.state,
        zipCode: data.location.zipCode,

        coordinates: {
          type: 'Point',
          coordinates: [
            parseFloat(data.location.coordinates[0]),
            parseFloat(data.location.coordinates[1]),
          ],
        },
      },

      details: {
        bedrooms: parseInt(data.details.bedrooms),
        bathrooms: parseFloat(data.details.bathrooms),
        maxGuests: parseInt(data.details.maxGuests),

        size: data.details.size
          ? parseInt(data.details.size)
          : 0,

        floor: data.details.floor
          ? parseInt(data.details.floor)
          : 0,

        parking: data.details.parking
          ? parseInt(data.details.parking)
          : 0,
      },

      pricing: {
        basePrice: parseFloat(data.pricing.basePrice),

        cleaningFee: data.pricing.cleaningFee
          ? parseFloat(data.pricing.cleaningFee)
          : 0,

        serviceFee: data.pricing.serviceFee
          ? parseFloat(data.pricing.serviceFee)
          : 0,

        taxRate: data.pricing.taxRate
          ? parseFloat(data.pricing.taxRate)
          : 13.5,

        minimumStay: data.pricing.minimumStay
          ? parseInt(data.pricing.minimumStay)
          : 2,

        weeklyDiscount: data.pricing.weeklyDiscount
          ? parseFloat(data.pricing.weeklyDiscount)
          : 0,

        monthlyDiscount: data.pricing.monthlyDiscount
          ? parseFloat(data.pricing.monthlyDiscount)
          : 0,
      },

      houseRules: {
        checkIn: data.houseRules.checkIn,
        checkOut: data.houseRules.checkOut,
        smoking: data.houseRules.smoking,
        pets: data.houseRules.pets,
        parties: data.houseRules.parties,
      },

      images: images.map((img, index) => ({
        url: img.url,
        publicId: img.publicId,
        isPrimary: img.isPrimary || index === 0,
        order: index,
      })),
    };

    console.log('FINAL PROPERTY DATA');
    console.log(propertyData);

    if (isEditing) {
      await adminApi.updateProperty(id, propertyData);

      toast.success('Property updated successfully');
    } else {
      await adminApi.createProperty(propertyData);

      toast.success('Property created successfully');
    }

    navigate('/admin/properties');
  } catch (error) {
    console.log(error.response?.data);

    toast.error(
      error.response?.data?.message ||
      'Failed to save property'
    );
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
                        {isEditing && (
                            <a
                                href={`/properties/${watch('name')?.toLowerCase()?.replace(/\s+/g, '-')}`}
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
                                    {...register('name', { required: 'Property name is required' })}
                                    className="input-field"
                                    placeholder="e.g., Luxury Oceanfront Penthouse"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="input-label">Short Description *</label>
                                <input
                                    type="text"
                                    {...register('description.short', { required: 'Short description is required' })}
                                    className="input-field"
                                    placeholder="Brief summary of the property"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="input-label">Full Description *</label>
                                <textarea
                                    {...register('description.full')}
                                    className="input-field resize-none"
                                    rows={6}
                                    placeholder="Detailed description of the property..."
                                />
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
                    </div>

                    {/* Details */}
                    <div className="glass rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Property Details</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div>
                                <label className="input-label">Bedrooms *</label>
                                <input
                                    type="number"
                                    min="0"
                                    {...register('details.bedrooms')}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="input-label">Bathrooms *</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    {...register('details.bathrooms')}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="input-label">Max Guests *</label>
                                <input
                                    type="number"
                                    min="1"
                                    {...register('details.maxGuests')}
                                    className="input-field"
                                />
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
                                <label className="input-label">Parking Spots</label>
                                <input type="number" min="0" {...register('details.parking')} className="input-field" />
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="glass rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Pricing</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="input-label">Base Price/Night *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...register('pricing.basePrice', { required: 'Price is required' })}
                                    className="input-field"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="input-label">Cleaning Fee</label>
                                <input type="number" step="0.01" min="0" {...register('pricing.cleaningFee')} className="input-field" />
                            </div>
                            <div>
                                <label className="input-label">Service Fee</label>
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

                    {/* House Rules */}
                    <div className="glass rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">House Rules</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="input-label">Check-in Time</label>
                                <input type="time" {...register('houseRules.checkIn')} className="input-field" />
                            </div>
                            <div>
                                <label className="input-label">Check-out Time</label>
                                <input type="time" {...register('houseRules.checkOut')} className="input-field" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" {...register('houseRules.smoking')} className="w-4 h-4 rounded border-white/20 bg-transparent text-[var(--color-primary)]" />
                                <label className="text-sm text-[var(--color-text-secondary)]">Smoking Allowed</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" {...register('houseRules.pets')} className="w-4 h-4 rounded border-white/20 bg-transparent text-[var(--color-primary)]" />
                                <label className="text-sm text-[var(--color-text-secondary)]">Pets Allowed</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" {...register('houseRules.parties')} className="w-4 h-4 rounded border-white/20 bg-transparent text-[var(--color-primary)]" />
                                <label className="text-sm text-[var(--color-text-secondary)]">Parties Allowed</label>
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="glass rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Property Images</h3>
                        <ImageUploader images={images} onChange={setImages} maxImages={20} />
                    </div>
                </form>
            </div>
        </>
    );
};

export default AdminPropertyForm;