import { useEffect, useMemo, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { addMonths, format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  HiBan,
  HiCalendar,
  HiCurrencyDollar,
  HiRefresh,
  HiSave,
} from 'react-icons/hi';
import adminApi from '../../config/api';

const calendarWindow = () => {
  const today = new Date();
  return {
    startDate: format(today, 'yyyy-MM-dd'),
    endDate: format(addMonths(today, 18), 'yyyy-MM-dd'),
  };
};

const money = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const dateKey = (date) => format(date, 'yyyy-MM-dd');

const RateCalendarManager = ({ propertyId, basePrice = 0, minimumStay = 1 }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rateDays, setRateDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [singlePrice, setSinglePrice] = useState('');
  const [singleMinimumStay, setSingleMinimumStay] = useState('');
  const [singleAvailable, setSingleAvailable] = useState(true);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [rangePrice, setRangePrice] = useState('');
  const [rangeMinimumStay, setRangeMinimumStay] = useState('');
  const [rangeAvailable, setRangeAvailable] = useState(true);

  const windowParams = useMemo(calendarWindow, []);

  const rateMap = useMemo(
    () => new Map(rateDays.map((day) => [day.date, day])),
    [rateDays]
  );

  const selectedKey = dateKey(selectedDate);
  const selectedRate = rateMap.get(selectedKey);
  const defaultMinimumStay = Number(minimumStay || 1);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getRateCalendar(propertyId, windowParams);
      setRateDays(response.data.days || []);
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to load rate calendar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) fetchRates();
  }, [propertyId]);

  useEffect(() => {
    if (!selectedRate) {
      setSinglePrice('');
      setSingleMinimumStay('');
      setSingleAvailable(true);
      return;
    }

    setSinglePrice(selectedRate.isCustomPrice ? selectedRate.price : '');
    setSingleMinimumStay(
      selectedRate.minimumStay && selectedRate.minimumStay !== defaultMinimumStay
        ? selectedRate.minimumStay
        : ''
    );
    setSingleAvailable(selectedRate.status !== 'blocked');
  }, [defaultMinimumStay, selectedKey, selectedRate]);

  const syncDays = (days) => {
    if (Array.isArray(days)) setRateDays(days);
  };

  const saveSingleDate = async () => {
    const reset = singleAvailable && singlePrice === '' && singleMinimumStay === '';
    const update = {
      date: selectedKey,
      isAvailable: singleAvailable,
      reset,
    };

    if (singlePrice !== '') update.price = Number(singlePrice);
    if (singleMinimumStay !== '') update.minimumStay = Number(singleMinimumStay);

    try {
      setSaving(true);
      const response = await adminApi.updateRateCalendar(propertyId, {
        calendarStartDate: windowParams.startDate,
        calendarEndDate: windowParams.endDate,
        updates: [update],
      });
      syncDays(response.data.days);
      toast.success(reset ? 'Date reset to default pricing' : 'Rate updated');
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to update rate');
    } finally {
      setSaving(false);
    }
  };

  const resetSelectedDate = async () => {
    try {
      setSaving(true);
      const response = await adminApi.updateRateCalendar(propertyId, {
        calendarStartDate: windowParams.startDate,
        calendarEndDate: windowParams.endDate,
        removeDates: [selectedKey],
      });
      syncDays(response.data.days);
      toast.success('Date reset to default pricing');
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to reset rate');
    } finally {
      setSaving(false);
    }
  };

  const applyRange = async () => {
    if (!rangeStart || !rangeEnd) {
      toast.error('Select a start and end date');
      return;
    }

    if (rangeStart > rangeEnd) {
      toast.error('Range start must be before range end');
      return;
    }

    const reset = rangeAvailable && rangePrice === '' && rangeMinimumStay === '';

    try {
      setSaving(true);
      const response = await adminApi.updateRateCalendar(propertyId, {
        calendarStartDate: windowParams.startDate,
        calendarEndDate: windowParams.endDate,
        startDate: rangeStart,
        endDate: rangeEnd,
        price: rangePrice === '' ? undefined : Number(rangePrice),
        minimumStay: rangeMinimumStay === '' ? undefined : Number(rangeMinimumStay),
        isAvailable: rangeAvailable,
        reset,
      });
      syncDays(response.data.days);
      toast.success(reset ? 'Range reset to default pricing' : 'Range updated');
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Failed to update range');
    } finally {
      setSaving(false);
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    const day = rateMap.get(dateKey(date));

    if (day?.status === 'maintenance') return 'admin-rate-maintenance';
    if (day?.status === 'booked') return 'admin-rate-booked';
    if (day?.status === 'blocked') return 'admin-rate-blocked';
    if (day?.isCustomPrice) return 'admin-rate-custom';
    if (day?.source === 'seasonal' || day?.source === 'weekend') return 'admin-rate-rule';
    return null;
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const day = rateMap.get(dateKey(date));

    return (
      <span className="admin-rate-day-price">
        {money(day?.price ?? basePrice)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--color-primary)]">Revenue calendar</p>
          <h3 className="text-lg font-bold text-white">Day-wise Pricing & Availability</h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Current default: {money(basePrice)} per night, {defaultMinimumStay} night minimum.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchRates}
          disabled={saving}
          className="btn-outline flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          <HiRefresh className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="admin-rate-calendar">
          <Calendar
            minDate={new Date()}
            onChange={setSelectedDate}
            tileClassName={tileClassName}
            tileContent={tileContent}
            value={selectedDate}
            formatShortWeekday={(_, date) => format(date, 'EEE')}
          />

          <div className="mt-4 grid gap-2 text-xs font-semibold text-[var(--color-text-muted)] sm:grid-cols-5">
            {[
              ['Custom', 'bg-[var(--color-primary)]'],
              ['Rule', 'bg-blue-500'],
              ['Booked', 'bg-yellow-500'],
              ['Maintenance', 'bg-red-500'],
              ['Closed', 'bg-slate-500'],
            ].map(([label, swatch]) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${swatch}`} />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-[var(--color-text-muted)]">Selected date</p>
                <h4 className="text-base font-bold text-white">{format(selectedDate, 'MMM dd, yyyy')}</h4>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
                {money(selectedRate?.price ?? basePrice)}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="input-label flex items-center gap-1 text-sm">
                  <HiCurrencyDollar className="h-4 w-4" />
                  Custom Price
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={singlePrice}
                  onChange={(event) => setSinglePrice(event.target.value)}
                  className="input-field"
                  placeholder={`${basePrice || 0}`}
                />
              </label>

              <label>
                <span className="input-label flex items-center gap-1 text-sm">
                  <HiCalendar className="h-4 w-4" />
                  Minimum Stay
                </span>
                <input
                  type="number"
                  min="1"
                  value={singleMinimumStay}
                  onChange={(event) => setSingleMinimumStay(event.target.value)}
                  className="input-field"
                  placeholder={`${defaultMinimumStay}`}
                />
              </label>
            </div>

            <label className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/10 px-3 py-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                <HiBan className="h-4 w-4 text-red-400" />
                Available for booking
              </span>
              <input
                type="checkbox"
                checked={singleAvailable}
                onChange={(event) => setSingleAvailable(event.target.checked)}
                className="h-5 w-5 rounded"
              />
            </label>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={saveSingleDate}
                disabled={saving}
                className="btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <HiSave className="h-4 w-4" />
                Save Date
              </button>
              <button
                type="button"
                onClick={resetSelectedDate}
                disabled={saving}
                className="btn-outline flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <HiRefresh className="h-4 w-4" />
                Reset Date
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase text-[var(--color-text-muted)]">Bulk edit</p>
              <h4 className="text-base font-bold text-white">Apply to Date Range</h4>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="input-label text-sm">Start Date</span>
                <input
                  type="date"
                  value={rangeStart}
                  onChange={(event) => setRangeStart(event.target.value)}
                  className="input-field"
                />
              </label>
              <label>
                <span className="input-label text-sm">End Date</span>
                <input
                  type="date"
                  value={rangeEnd}
                  onChange={(event) => setRangeEnd(event.target.value)}
                  className="input-field"
                />
              </label>
              <label>
                <span className="input-label text-sm">Price</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={rangePrice}
                  onChange={(event) => setRangePrice(event.target.value)}
                  className="input-field"
                  placeholder={`${basePrice || 0}`}
                />
              </label>
              <label>
                <span className="input-label text-sm">Minimum Stay</span>
                <input
                  type="number"
                  min="1"
                  value={rangeMinimumStay}
                  onChange={(event) => setRangeMinimumStay(event.target.value)}
                  className="input-field"
                  placeholder={`${defaultMinimumStay}`}
                />
              </label>
            </div>

            <label className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/10 px-3 py-3">
              <span className="text-sm font-semibold text-white">Available for booking</span>
              <input
                type="checkbox"
                checked={rangeAvailable}
                onChange={(event) => setRangeAvailable(event.target.checked)}
                className="h-5 w-5 rounded"
              />
            </label>

            <button
              type="button"
              onClick={applyRange}
              disabled={saving}
              className="btn-primary mt-4 flex w-full items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <HiSave className="h-4 w-4" />
              Apply Range
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateCalendarManager;
