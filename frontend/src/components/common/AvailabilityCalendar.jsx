// components/common/AvailabilityCalendar.jsx
import { useEffect, useMemo, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { addMonths, format, isSameDay } from 'date-fns';
import apiService from '../../config/api';
import { formatCurrency } from '../../utils/helpers';

const buildDateList = (start, end, includeEnd = false) => {
  const dates = [];
  const currentDate = new Date(start);
  const finalDate = new Date(end);

  while (includeEnd ? currentDate <= finalDate : currentDate < finalDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

const AvailabilityCalendar = ({ propertyId, onDateSelect, selectedDates: propSelectedDates }) => {
  const [bookedDates, setBookedDates] = useState([]);
  const [maintenanceDates, setMaintenanceDates] = useState([]);
  const [rateCalendar, setRateCalendar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState(propSelectedDates || [new Date(), null]);

  useEffect(() => {
    const fetchDates = async () => {
      if (!propertyId) return;

      try {
        setLoading(true);

        const today = new Date();
        const [bookingsResponse, maintenanceResponse, rateCalendarResponse] = await Promise.allSettled([
          apiService.getPropertyBookings(propertyId),
          apiService.getMaintenanceDates(propertyId),
          apiService.getPropertyRateCalendar(propertyId, {
            startDate: format(today, 'yyyy-MM-dd'),
            endDate: format(addMonths(today, 18), 'yyyy-MM-dd'),
          }),
        ]);

        if (bookingsResponse.status === 'fulfilled') {
          const bookings = bookingsResponse.value.data.bookings || [];
          setBookedDates(
            bookings.flatMap((booking) => {
              if (!['confirmed', 'active', 'pending'].includes(booking.status)) return [];
              return buildDateList(booking.checkIn, booking.checkOut);
            })
          );
        } else {
          setBookedDates([]);
        }

        if (maintenanceResponse.status === 'fulfilled') {
          const maintenance = maintenanceResponse.value.data.maintenanceDates || [];
          setMaintenanceDates(
            maintenance.flatMap((item) => buildDateList(item.startDate, item.endDate, true))
          );
        } else {
          setMaintenanceDates([]);
        }

        if (rateCalendarResponse.status === 'fulfilled') {
          setRateCalendar(rateCalendarResponse.value.data.days || []);
        } else {
          setRateCalendar([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDates();
  }, [propertyId]);

  const rateMap = useMemo(
    () => new Map(rateCalendar.map((day) => [day.date, day])),
    [rateCalendar]
  );

  const getRateForDate = (date) => rateMap.get(format(date, 'yyyy-MM-dd'));
  const isDateBooked = (date) => bookedDates.some((bookedDate) => isSameDay(bookedDate, date));
  const isDateMaintenance = (date) =>
    maintenanceDates.some((maintenanceDate) => isSameDay(maintenanceDate, date));
  const isDateBlocked = (date) => getRateForDate(date)?.status === 'blocked';
  const isDateUnavailable = (date) =>
    isDateBooked(date) || isDateMaintenance(date) || isDateBlocked(date);

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    if (isDateMaintenance(date)) return 'maintenance-date';
    if (isDateBooked(date)) return 'booked-date';
    if (isDateBlocked(date)) return 'blocked-date';

    if (selectedDates?.[0] && selectedDates?.[1]) {
      if (date >= selectedDates[0] && date <= selectedDates[1]) {
        if (isSameDay(date, selectedDates[0])) return 'range-start';
        if (isSameDay(date, selectedDates[1])) return 'range-end';
        return 'range-middle';
      }
    }

    return null;
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    const rate = getRateForDate(date);
    if (!rate?.price) return null;

    return (
      <span className="availability-day-price">
        {formatCurrency(rate.price).replace('.00', '')}
      </span>
    );
  };

  const tileDisabled = ({ date, view }) => {
    if (view !== 'month') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || isDateUnavailable(date);
  };

  const handleDateChange = (dates) => {
    setSelectedDates(dates);
    if (onDateSelect && dates?.[0] && dates?.[1]) {
      onDateSelect({ start: dates[0], end: dates[1] });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center rounded-[24px] bg-white py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="availability-calendar">
      <Calendar
        selectRange
        onChange={handleDateChange}
        value={selectedDates}
        tileClassName={tileClassName}
        tileContent={tileContent}
        tileDisabled={tileDisabled}
        minDate={new Date()}
        formatShortWeekday={(_, date) => format(date, 'EEE')}
      />

      <div className="mt-6 flex flex-wrap justify-center gap-4 border-t border-[var(--color-border)] pt-4">
        {[
          ['Selected Range', 'bg-[var(--color-primary)]'],
          ['Booked', 'bg-red-500'],
          ['Under Maintenance', 'bg-amber-400'],
          ['Closed', 'bg-slate-400'],
          ['Available', 'bg-white border border-[var(--color-border)]'],
        ].map(([label, swatch]) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`h-4 w-4 rounded ${swatch}`} />
            <span className="text-xs font-bold text-[var(--color-text-muted)]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
