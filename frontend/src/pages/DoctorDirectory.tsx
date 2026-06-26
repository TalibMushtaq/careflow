import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../api/client';
import { Doctor, ApiResponse } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorComponent } from '../components/ErrorComponent';
import toast from 'react-hot-toast';
import { Search, Stethoscope, MapPin, Calendar, Clock, X, Sparkles, Loader2 } from 'lucide-react';

const bookingSchema = z.object({
  doctor_id: z.number(),
  appointment_date: z.string().min(1, 'Please select a date'),
  time_slot: z.string().min(1, 'Please select a time slot'),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const TIME_SLOTS = [
  "09:00 - 09:30", "09:30 - 10:00", "10:00 - 10:30", "10:30 - 11:00",
  "11:00 - 11:30", "11:30 - 12:00", "14:00 - 14:30", "14:30 - 15:00",
  "15:00 - 15:30", "15:30 - 16:00"
];

export const DoctorDirectory: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Fetch doctors with optional search parameter
  const { data: response, isLoading, error, refetch } = useQuery<ApiResponse<Doctor[]>>({
    queryKey: ['doctors', searchTerm],
    queryFn: async () => {
      const res = await apiClient.get('/doctors', {
        params: { search: searchTerm }
      });
      return res.data;
    },
  });

  const doctors = response?.data || [];

  // Book appointment mutation
  const bookMutation = useMutation({
    mutationFn: async (values: BookingFormValues) => {
      const res = await apiClient.post('/appointments/book', values);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`Appointed successfully! Your Queue Number is #${data.data.queue_number}`);
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      setSelectedDoctor(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to book appointment. The slot may be taken.');
    }
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
  });

  const handleOpenBooking = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    reset({
      doctor_id: doctor.id,
      appointment_date: new Date().toISOString().split('T')[0],
      time_slot: '',
    });
  };

  const onSubmit = (values: BookingFormValues) => {
    bookMutation.mutate(values);
  };

  if (isLoading && !searchTerm) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title & Search bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-outfit text-slate-800 dark:text-white">Doctor Directory</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Search for specialized medical doctors and book consultation slots instantly.</p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-hospital-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {error ? (
        <ErrorComponent message={error instanceof Error ? error.message : "Failed to load doctors"} onRetry={refetch} />
      ) : doctors.length === 0 ? (
        <div className="py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center shadow-soft transition-colors">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full inline-block mb-3">
            <Stethoscope size={32} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No Doctors Found</h3>
          <p className="text-sm text-slate-450 max-w-xs mx-auto mt-1">Try refining your search query or look for another specialty.</p>
        </div>
      ) : (
        /* Doctors List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div 
              key={doctor.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-soft hover:shadow-premium transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Doctor Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-hospital-50 dark:bg-hospital-950/20 text-hospital-500 dark:text-hospital-400 flex items-center justify-center font-bold text-lg font-outfit shrink-0">
                    {doctor.name.split(' ').pop()?.[0] || 'D'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-base leading-tight font-outfit">{doctor.name}</h4>
                    <span className="inline-block px-2.5 py-0.5 mt-1.5 bg-hospital-50 dark:bg-hospital-950/20 text-hospital-600 dark:text-hospital-400 border border-hospital-100 dark:border-hospital-900/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {doctor.specialty}
                    </span>
                  </div>
                </div>

                {/* Info Room */}
                <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 mb-6">
                  <MapPin size={15} className="text-slate-400" />
                  <span>Room Location: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{doctor.room_number}</strong></span>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={() => handleOpenBooking(doctor)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-hospital-50 hover:bg-hospital-500 dark:bg-slate-800 dark:hover:bg-hospital-500 text-hospital-600 hover:text-white dark:text-hospital-400 dark:hover:text-white rounded-2xl font-bold text-xs transition-all duration-200"
              >
                <Calendar size={14} />
                Book Consultation
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Booking Form Slide-over/Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedDoctor(null)}></div>
          
          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-premium animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedDoctor(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="mb-6 flex items-start gap-4">
              <div className="p-3 bg-hospital-50 dark:bg-hospital-950/20 text-hospital-500 dark:text-hospital-400 rounded-2xl">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-white">Book Appointment</h3>
                <p className="text-xs text-slate-400">Scheduling with <strong className="text-slate-600 dark:text-slate-300 font-semibold">{selectedDoctor.name}</strong></p>
              </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <input type="hidden" {...register('doctor_id', { valueAsNumber: true })} />

              {/* Date selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={14} />
                  Appointment Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-hospital-500 transition-all ${
                    errors.appointment_date 
                      ? 'border-red-500 ring-1 ring-red-500' 
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                  {...register('appointment_date')}
                />
                {errors.appointment_date && (
                  <span className="text-xs text-red-500 font-medium">{errors.appointment_date.message}</span>
                )}
              </div>

              {/* Slot selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} />
                  Select Time Slot
                </label>
                <select
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-hospital-500 transition-all ${
                    errors.time_slot 
                      ? 'border-red-500 ring-1 ring-red-500' 
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                  {...register('time_slot')}
                >
                  <option value="">-- Select Slot --</option>
                  {TIME_SLOTS.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
                {errors.time_slot && (
                  <span className="text-xs text-red-500 font-medium">{errors.time_slot.message}</span>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookMutation.isPending}
                  className="flex-1 py-3 px-4 bg-hospital-500 hover:bg-hospital-600 text-white rounded-2xl font-bold text-xs shadow-premium disabled:opacity-75 flex items-center justify-center gap-1.5 transition-all"
                >
                  {bookMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
