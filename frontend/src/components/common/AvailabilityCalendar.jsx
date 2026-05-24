import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { isSameDay, format, parseISO, eachDayOfInterval } from 'date-fns';
import apiService from '../../config/api';
import toast from 'react-hot-toast';

const AvailabilityCalendar = ({ propertyId, onDateSelect, selectedDates: propSelectedDates }) => {
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState(propSelectedDates || [new Date(), null]);

  useEffect(() => {
    if (propertyId) {
      fetchBookedDates();
    }
  }, [propertyId]);

  const fetchBookedDates = async () => {
    try {
      setLoading(true);
      console.log('Fetching bookings for property:', propertyId);
      
      const response = await apiService.getPropertyBookings(propertyId);
      console.log('API Response:', response.data);
      
      const bookings = response.data.bookings || [];
      
      // Get all booked dates from confirmed bookings
      const allBookedDates = [];
      
      bookings.forEach(booking => {
        if (booking.status === 'confirmed' || booking.status === 'active' || booking.status === 'pending') {
          const startDate = new Date(booking.checkIn);
          const endDate = new Date(booking.checkOut);
          
          // Add all dates between check-in and check-out (excluding check-out day)
          const currentDate = new Date(startDate);
          while (currentDate < endDate) {
            allBookedDates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
      });
      
      console.log('Booked dates:', allBookedDates.map(d => format(d, 'yyyy-MM-dd')));
      setBookedDates(allBookedDates);
      
    } catch (error) {
      console.error('Error fetching booked dates:', error);
      toast.error('Unable to load availability calendar');
    } finally {
      setLoading(false);
    }
  };

  const isDateBooked = (date) => {
    return bookedDates.some(bookedDate => 
      isSameDay(bookedDate, date)
    );
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      if (isDateBooked(date)) {
        return 'booked-date';
      }
      // Check if date is in selected range
      if (selectedDates && selectedDates[0] && selectedDates[1]) {
        if (date >= selectedDates[0] && date <= selectedDates[1]) {
          if (isSameDay(date, selectedDates[0])) return 'range-start';
          if (isSameDay(date, selectedDates[1])) return 'range-end';
          return 'range-middle';
        }
      }
    }
    return null;
  };

  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      // Disable past dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
    }
    return false;
  };

  const handleDateChange = (dates) => {
    console.log('Date selected:', dates);
    setSelectedDates(dates);
    if (dates && dates[0] && dates[1]) {
      onDateSelect?.({ start: dates[0], end: dates[1] });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="availability-calendar">
      <style>{`
        .availability-calendar .react-calendar {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          color: white;
          width: 100%;
          padding: 1.5rem;
        }
        .availability-calendar .react-calendar__navigation {
          margin-bottom: 1rem;
        }
        .availability-calendar .react-calendar__navigation button {
          color: white;
          font-size: 1rem;
          font-weight: 500;
          padding: 0.5rem;
        }
        .availability-calendar .react-calendar__navigation button:enabled:hover,
        .availability-calendar .react-calendar__navigation button:enabled:focus {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
        }
        .availability-calendar .react-calendar__month-view__weekdays {
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          font-weight: 600;
          font-size: 0.75rem;
          padding-bottom: 0.5rem;
        }
        .availability-calendar .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
        }
        .availability-calendar .react-calendar__tile {
          background: transparent;
          color: white;
          padding: 0.75rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
          font-size: 0.875rem;
        }
        .availability-calendar .react-calendar__tile:enabled:hover,
        .availability-calendar .react-calendar__tile:enabled:focus {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .availability-calendar .react-calendar__tile--now {
          background: rgba(200, 169, 126, 0.3);
          color: var(--color-primary);
          font-weight: bold;
        }
        .availability-calendar .react-calendar__tile--active {
          background: var(--color-primary) !important;
          color: var(--color-bg-dark) !important;
        }
        .availability-calendar .booked-date {
          background: rgba(239, 68, 68, 0.3) !important;
          color: #ef4444 !important;
          text-decoration: line-through;
          position: relative;
          cursor: not-allowed;
        }
        .availability-calendar .booked-date:hover {
          background: rgba(239, 68, 68, 0.5) !important;
        }
        .availability-calendar .range-start {
          background: var(--color-primary) !important;
          color: var(--color-bg-dark) !important;
          border-radius: 0.5rem 0 0 0.5rem !important;
        }
        .availability-calendar .range-end {
          background: var(--color-primary) !important;
          color: var(--color-bg-dark) !important;
          border-radius: 0 0.5rem 0.5rem 0 !important;
        }
        .availability-calendar .range-middle {
          background: rgba(200, 169, 126, 0.3) !important;
          border-radius: 0 !important;
        }
        .availability-calendar .react-calendar__tile:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
      
      <Calendar
        selectRange={true}
        onChange={handleDateChange}
        value={selectedDates}
        tileClassName={tileClassName}
        tileDisabled={tileDisabled}
        minDate={new Date()}
      />
      
      <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[var(--color-primary)]"></div>
          <span className="text-xs text-[var(--color-text-muted)]">Selected Range</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/50 border border-red-500"></div>
          <span className="text-xs text-[var(--color-text-muted)]">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white/10"></div>
          <span className="text-xs text-[var(--color-text-muted)]">Available</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;