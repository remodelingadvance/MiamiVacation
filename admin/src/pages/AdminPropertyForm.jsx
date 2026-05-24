import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { HiArrowLeft, HiSave, HiEye, HiPlus, HiTrash } from 'react-icons/hi';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import SEOHead from '../components/common/SEOHead';
import ImageUploader from '../components/common/ImageUploader';
import adminApi from '../config/api';
import toast from 'react-hot-toast';

const PROPERTY_TYPES = ['condo', 'villa', 'penthouse', 'apartment', 'studio', 'house', 'mansion'];
const PROPERTY_STATUS = ['active', 'inactive', 'maintenance', 'draft'];
const AMENITY_CATEGORIES = ['basic', 'kitchen', 'bathroom', 'outdoor', 'entertainment', 'safety', 'accessibility', 'other'];
const NEARBY_PLACE_TYPES = ['airport', 'bus_station', 'metro', 'beach', 'restaurant', 'shopping', 'park', 'hospital', 'school', 'other'];

// Component for Policy Points - MUST be defined outside the main component
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
    const [bookings, setBookings] = useState([]);

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

    // Field arrays - all at top level
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
            fetchBookings();
        }
    }, [id]);

    const fetchProperty = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getProperty(id);
            const property = response.data.property;

            // Reset form with proper default values
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

            // Set images
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

    const fetchBookings = async () => {
        try {
            const response = await adminApi.getAllBookings({ property: id });
            setBookings(response.data.bookings || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const onSubmit = async (data) => {
    try {
        setSaving(true);

        // Format coordinates properly
        let coordinates = [-80.1300, 25.7800];
        if (data.location.coordinates && Array.isArray(data.location.coordinates)) {
            coordinates = [
                parseFloat(data.location.coordinates[0]) || -80.1300,
                parseFloat(data.location.coordinates[1]) || 25.7800
            ];
        }

        // Filter out empty policy points and ensure proper structure
        const filteredPolicies = (data.policiesAndNotes || [])
            .filter(policy => policy.title && policy.title.trim() !== '')
            .map(policy => ({
                title: policy.title,
                points: (policy.points || []).filter(point => point && point.trim() !== ''),
                order: policy.order || 0
            }))
            .filter(policy => policy.points.length > 0);

        // Filter out empty amenities
        const filteredAmenities = (data.amenities || [])
            .filter(amenity => amenity.name && amenity.name.trim() !== '')
            .map(amenity => ({
                category: amenity.category || 'other',
                name: amenity.name,
                description: amenity.description || '',
                icon: amenity.icon || ''
            }));

        // Filter out empty nearby places
        const filteredNearbyPlaces = (data.location.nearbyPlaces || [])
            .filter(place => place.name && place.name.trim() !== '' && place.distance && place.distance.trim() !== '');

        // Filter out empty additional rules
        const filteredAdditionalRules = (data.houseRules.additionalRules || [])
            .filter(rule => rule && rule.trim() !== '');

        // IMPORTANT: Prepare images data correctly from the images state
        const imagesData = images
            .filter(img => img.url && img.url.trim() !== '') // Only include images with URL
            .map((img, index) => ({
                url: img.url,
                publicId: img.publicId || '',
                alt: img.alt || data.name,
                isPrimary: img.isPrimary || index === 0,
                order: index,
            }));

        console.log('Images being submitted:', imagesData);
        console.log('Images state:', images);

        const propertyData = {
            name: data.name,
            description: {
                short: data.description.short,
                full: data.description.full,
            },
            type: data.type,
            status: data.status,
            featured: data.featured || false,
            location: {
                address: data.location.address,
                neighborhood: data.location.neighborhood || '',
                city: data.location.city || 'Miami',
                state: data.location.state || 'Florida',
                zipCode: data.location.zipCode || '',
                coordinates: {
                    type: 'Point',
                    coordinates: coordinates,
                },
                nearbyPlaces: filteredNearbyPlaces,
            },
            details: {
                bedrooms: parseInt(data.details.bedrooms) || 0,
                bathrooms: parseFloat(data.details.bathrooms) || 0,
                maxGuests: parseInt(data.details.maxGuests) || 1,
                size: data.details.size ? parseInt(data.details.size) : null,
                floor: data.details.floor ? parseInt(data.details.floor) : null,
                yearBuilt: data.details.yearBuilt ? parseInt(data.details.yearBuilt) : null,
                parking: parseInt(data.details.parking) || 0,
            },
            amenities: filteredAmenities,
            pricing: {
                basePrice: parseFloat(data.pricing.basePrice) || 0,
                cleaningFee: parseFloat(data.pricing.cleaningFee) || 0,
                serviceFee: parseFloat(data.pricing.serviceFee) || 0,
                taxRate: parseFloat(data.pricing.taxRate) || 13.5,
                minimumStay: parseInt(data.pricing.minimumStay) || 2,
                weeklyDiscount: parseFloat(data.pricing.weeklyDiscount) || 0,
                monthlyDiscount: parseFloat(data.pricing.monthlyDiscount) || 0,
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

        // Only add images if there are valid images
        if (imagesData.length > 0) {
            propertyData.images = imagesData;
        }

        console.log('Final property data being sent:', JSON.stringify(propertyData, null, 2));

        if (isEditing) {
            await adminApi.updateProperty(id, propertyData);
            toast.success('Property updated successfully');
        } else {
            const response = await adminApi.createProperty(propertyData);
            console.log('Create response:', response.data);
            toast.success('Property created successfully');
        }

        navigate('/admin/properties');
    } catch (error) {
        console.error('Error saving property:', error);
        console.error('Error response:', error.response?.data);
        
        // Show detailed error message
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to save property';
        toast.error(errorMessage);
    } finally {
        setSaving(false);
    }
};
    // Function to get booked dates for calendar
    const getBookedDates = () => {
        const bookedDates = [];
        bookings.forEach(booking => {
            if (booking.status === 'confirmed' || booking.status === 'active') {
                let currentDate = new Date(booking.checkIn);
                const endDate = new Date(booking.checkOut);
                while (currentDate <= endDate) {
                    bookedDates.push(new Date(currentDate));
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }
        });
        return bookedDates;
    };

    const isDateBooked = (date) => {
        return getBookedDates().some(bookedDate => 
            bookedDate.toDateString() === date.toDateString()
        );
    };

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            if (isDateBooked(date)) {
                return 'bg-red-500/20 text-red-400 rounded-lg';
            }
        }
        return null;
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
                                    {...register('name', { required: 'Property name is required' })}
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

                        {/* Nearby Places */}
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-3">
                                <label className="input-label">Nearby Places (Airport, Metro, Beach, etc.)</label>
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
                                            placeholder="Place name (e.g., Miami Airport)"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            {...register(`location.nearbyPlaces.${index}.distance`)}
                                            className="input-field"
                                            placeholder="Distance (e.g., 5 miles)"
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
                                <label className="input-label">Year Built</label>
                                <input type="number" {...register('details.yearBuilt')} className="input-field" />
                            </div>
                            <div>
                                <label className="input-label">Parking Spots</label>
                                <input type="number" min="0" {...register('details.parking')} className="input-field" />
                            </div>
                        </div>
                    </div>

                    {/* Amenities with Description */}
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
                                        <select
                                            {...register(`amenities.${index}.category`)}
                                            className="input-field"
                                        >
                                            {AMENITY_CATEGORIES.map((cat) => (
                                                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <input
                                            {...register(`amenities.${index}.name`)}
                                            className="input-field"
                                            placeholder="Amenity name (e.g., WiFi, Pool, AC)"
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <textarea
                                        {...register(`amenities.${index}.description`)}
                                        className="input-field resize-none"
                                        rows={2}
                                        placeholder="Description (e.g., High-speed fiber optic internet, 500 Mbps)"
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
                                        placeholder="Policy title (e.g., Cancellation Policy, Security Deposit)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePolicy(policyIndex)}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        <HiTrash className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                {/* Use the PolicyPoints component with control and register props */}
                                <PolicyPoints 
                                    control={control} 
                                    register={register} 
                                    policyIndex={policyIndex} 
                                />
                            </div>
                        ))}
                    </div>

                    {/* Images */}
                    <div className="glass rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Property Images</h3>
                        <ImageUploader images={images} onChange={setImages} maxImages={20} multiple={true} />
                    </div>

                    {/* Availability Calendar */}
                    {isEditing && bookings.length > 0 && (
                        <div className="glass rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Availability Calendar</h3>
                            <div className="flex justify-center">
                                <style>{`
                                    .react-calendar {
                                        background: rgba(255, 255, 255, 0.05);
                                        border: 1px solid rgba(255, 255, 255, 0.1);
                                        border-radius: 0.75rem;
                                        color: white;
                                        width: 100%;
                                        max-width: 600px;
                                    }
                                    .react-calendar__navigation button {
                                        color: white;
                                    }
                                    .react-calendar__navigation button:enabled:hover,
                                    .react-calendar__navigation button:enabled:focus {
                                        background-color: rgba(255, 255, 255, 0.1);
                                    }
                                    .react-calendar__month-view__weekdays {
                                        color: rgba(255, 255, 255, 0.7);
                                    }
                                    .react-calendar__tile {
                                        background: transparent;
                                        color: white;
                                    }
                                    .react-calendar__tile:enabled:hover,
                                    .react-calendar__tile:enabled:focus {
                                        background-color: rgba(255, 255, 255, 0.1);
                                    }
                                    .react-calendar__tile--now {
                                        background: rgba(var(--color-primary-rgb), 0.3);
                                    }
                                    .react-calendar__tile--active {
                                        background: var(--color-primary);
                                        color: white;
                                    }
                                `}</style>
                                <Calendar
                                    tileClassName={tileClassName}
                                    className="w-full"
                                />
                            </div>
                            <div className="flex justify-center gap-4 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-red-500/20"></div>
                                    <span className="text-sm text-[var(--color-text-muted)]">Booked</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-[var(--color-primary)]"></div>
                                    <span className="text-sm text-[var(--color-text-muted)]">Available</span>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </>
    );
};

export default AdminPropertyForm;